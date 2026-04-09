const { spawn } = require('child_process');

/**
 * 执行命令并捕获输出（stdin 关闭，stdout/stderr 通过 pipe 收集）
 */
const exec = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const _process = spawn(command, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
      shell: process.platform === 'win32',
    });

    const stderrChunks = [];
    const stdoutChunks = [];

    _process.stderr?.on('data', (chunk) => stderrChunks.push(chunk));
    _process.stdout?.on('data', (chunk) => stdoutChunks.push(chunk));

    _process.on('error', (error) => reject(error));
    _process.on('exit', (code) => {
      const stderr = Buffer.concat(stderrChunks).toString().trim();
      const stdout = Buffer.concat(stdoutChunks).toString().trim();

      if (code === 0) {
        resolve({ ok: true, code, stderr, stdout });
      } else {
        reject(new Error(`Failed to execute command: ${command} ${args.join(' ')}: ${stderr}`));
      }
    });
  });

/**
 * 执行命令并继承终端 stdio（支持交互式输入，如验证码）
 */
const execInteractive = (command, args, options = {}) =>
  new Promise((resolve, reject) => {
    const _process = spawn(command, args, {
      stdio: 'inherit',
      ...options,
      shell: process.platform === 'win32',
    });

    _process.on('error', (error) => reject(error));
    _process.on('exit', (code) => {
      if (code === 0) {
        resolve({ ok: true, code });
      } else {
        reject(new Error(`Failed to execute command: ${command} ${args.join(' ')}`));
      }
    });
  });

module.exports = { exec, execInteractive };
