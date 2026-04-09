const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = path.resolve(root, 'src');
const dist = path.resolve(root, 'miniprogram_dist');

const DIRS_TO_COPY = ['components', 'behaviors', 'utils', 'libs', 'styles'];

const copyDir = (srcDir, destDir) => {
  fs.mkdirSync(destDir, { recursive: true });

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const clean = () => {
  if (fs.existsSync(dist)) {
    fs.rmSync(dist, { recursive: true, force: true });
  }
};

const build = () => {
  clean();
  console.log('Building miniprogram_dist...');

  for (const dir of DIRS_TO_COPY) {
    const srcDir = path.join(src, dir);
    if (fs.existsSync(srcDir)) {
      copyDir(srcDir, path.join(dist, dir));
      console.log(`  ✓ ${dir}`);
    }
  }

  console.log('Build complete.');
};

build();
