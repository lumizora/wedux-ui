const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');
const semver = require('semver');
const pico = require('picocolors');
const { prompt } = require('enquirer');
const { exec, execInteractive } = require('./utils');

const pkgPath = path.resolve(__dirname, '../package.json');
const getPkg = () => JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
const currentVersion = getPkg().version;

let versionUpdated = false;

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    preid: { type: 'string' },
    dry: { type: 'boolean' },
    tag: { type: 'string' },
    skipBuild: { type: 'boolean' },
    skipGit: { type: 'boolean' },
    skipPrompts: { type: 'boolean' },
    registry: { type: 'string' },
    publishOnly: { type: 'boolean' },
  },
});

const preId = args.preid || semver.prerelease(currentVersion)?.[0];
const isDryRun = args.dry;

const run = async (bin, runArgs, opts = {}) => execInteractive(bin, runArgs, opts);

const dryRun = async (bin, runArgs, opts = {}) =>
  console.log(pico.blue(`[dryrun] ${bin} ${runArgs.join(' ')}`), opts);

const runIfNotDry = isDryRun ? dryRun : run;

const step = (msg) => console.log(pico.cyan(msg));

const versionIncrements = [
  'patch',
  'minor',
  'major',
  ...(preId ? ['prepatch', 'preminor', 'premajor', 'prerelease'] : []),
];

const inc = (i) => semver.inc(currentVersion, i, typeof preId === 'string' ? preId : undefined);

async function getSha() {
  return (await exec('git', ['rev-parse', 'HEAD'])).stdout;
}

async function getBranch() {
  return (await exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'])).stdout;
}

async function isInSyncWithRemote() {
  try {
    const branch = await getBranch();
    const res = await fetch(
      `https://api.github.com/repos/BitterBar/wedux-ui/commits/${branch}?per_page=1`,
    );
    const data = await res.json();
    if (data.sha === (await getSha())) {
      return true;
    } else {
      if (args.skipPrompts) {
        console.error(pico.red('Local HEAD is not up-to-date with remote.'));
        return false;
      }
      const { yes } = await prompt({
        type: 'confirm',
        name: 'yes',
        message: pico.red(
          'Local HEAD is not up-to-date with remote. Are you sure you want to continue?',
        ),
      });
      return yes;
    }
  } catch {
    console.error(pico.red('Failed to check whether local HEAD is up-to-date with remote.'));
    return false;
  }
}

function getPublishTag(version) {
  if (args.tag) return args.tag;
  if (version.includes('alpha')) return 'alpha';
  if (version.includes('beta')) return 'beta';
  if (version.includes('rc')) return 'rc';
  return null;
}

const updateVersion = (version) => {
  const pkg = getPkg();
  pkg.version = version;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
};

async function main() {
  if (!(await isInSyncWithRemote())) {
    return;
  } else {
    console.log(`${pico.green('✓')} Commit is up-to-date with remote.\n`);
  }

  let targetVersion = positionals[0];

  if (!targetVersion) {
    const { release } = await prompt({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: versionIncrements.map((i) => `${i} (${inc(i)})`).concat(['custom']),
    });

    if (release === 'custom') {
      const { version } = await prompt({
        type: 'input',
        name: 'version',
        message: 'Input custom version',
        initial: currentVersion,
      });
      targetVersion = version;
    } else {
      targetVersion = release.match(/\((.*)\)/)?.[1] ?? '';
    }
  }

  if (versionIncrements.includes(targetVersion)) {
    targetVersion = inc(targetVersion);
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }

  if (!args.skipPrompts) {
    const { yes } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: `Releasing v${targetVersion}. Confirm?`,
    });
    if (!yes) return;
  } else {
    step(`Releasing v${targetVersion}...`);
  }

  // build
  if (!args.skipBuild) {
    step('\nBuilding...');
    await run('node', [path.resolve(__dirname, 'build.js')]);
  }

  // update version
  step('\nUpdating version...');
  updateVersion(targetVersion);
  versionUpdated = true;

  // generate changelog
  step('\nGenerating changelog...');
  await run('pnpm', ['run', 'changelog']);

  if (!args.skipPrompts) {
    const { yes } = await prompt({
      type: 'confirm',
      name: 'yes',
      message: 'Changelog generated. Does it look good?',
    });
    if (!yes) return;
  }

  if (!args.skipGit) {
    const { stdout } = await exec('git', ['diff']);
    if (stdout) {
      step('\nCommitting changes...');
      await runIfNotDry('git', ['add', '-A']);
      await runIfNotDry('git', ['commit', '-m', `release: v${targetVersion}`]);
    } else {
      console.log('No changes to commit.');
    }
  }

  // publish
  step('\nPublishing...');
  const releaseTag = getPublishTag(targetVersion);
  const publishArgs = [
    'publish',
    '--access',
    'public',
    ...(releaseTag ? ['--tag', releaseTag] : []),
    ...(args.registry ? ['--registry', args.registry] : []),
    ...(isDryRun ? ['--dry-run'] : []),
    ...(isDryRun || args.skipGit ? ['--no-git-checks'] : []),
  ];

  try {
    await run('pnpm', publishArgs);
    console.log(pico.green(`Successfully published wedux-ui@${targetVersion}`));
  } catch (e) {
    if (e.message?.match(/previously published/)) {
      console.log(pico.red(`Skipping already published: wedux-ui@${targetVersion}`));
    } else {
      throw e;
    }
  }

  // git tag & push
  if (!args.skipGit) {
    step('\nPushing to remote...');
    await runIfNotDry('git', ['tag', `v${targetVersion}`]);
    await runIfNotDry('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
    await runIfNotDry('git', ['push']);
  }

  if (isDryRun) {
    console.log('\nDry run finished - run git diff to see package changes.');
  }

  console.log();
}

async function publishOnly() {
  const targetVersion = positionals[0];
  if (targetVersion) {
    updateVersion(targetVersion);
    versionUpdated = true;
  }

  if (!args.skipBuild) {
    step('\nBuilding...');
    await run('node', [path.resolve(__dirname, 'build.js')]);
  }

  step('\nPublishing...');
  const version = getPkg().version;
  const releaseTag = getPublishTag(version);
  const publishArgs = [
    'publish',
    '--access',
    'public',
    ...(releaseTag ? ['--tag', releaseTag] : []),
    ...(args.registry ? ['--registry', args.registry] : []),
    ...(isDryRun ? ['--dry-run'] : []),
    '--no-git-checks',
  ];

  try {
    await run('pnpm', publishArgs);
    console.log(pico.green(`Successfully published wedux-ui@${version}`));
  } catch (e) {
    if (e.message?.match(/previously published/)) {
      console.log(pico.red(`Skipping already published: wedux-ui@${version}`));
    } else {
      throw e;
    }
  }
}

const fnToRun = args.publishOnly ? publishOnly : main;

fnToRun().catch((err) => {
  if (versionUpdated) {
    updateVersion(currentVersion);
  }
  console.error(err);
  process.exit(1);
});
