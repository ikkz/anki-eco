import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BIN_BASE = path.resolve(import.meta.dirname, 'anki-eco-packager');
const BIN =
  process.platform === 'win32' && existsSync(`${BIN_BASE}.exe`)
    ? `${BIN_BASE}.exe`
    : BIN_BASE;

const normalizeCwd = (cwd: string) => {
  if (process.platform !== 'win32') {
    return cwd;
  }
  if (/^\/[A-Za-z]\//.test(cwd)) {
    const drive = cwd[1].toUpperCase();
    const rest = cwd.slice(2).replace(/\//g, '\\').replace(/^\\+/, '');
    return `${drive}:\\${rest}`;
  }
  return cwd;
};

// Get command line arguments (excluding node and script path)
const args = process.argv.slice(2);

// Spawn the Python process
const cwd = normalizeCwd(process.cwd());

const pythonProcess = spawn(BIN, ['--cwd', cwd, ...args], {
  stdio: 'inherit',
  cwd,
  shell: true,
});

// Handle process exit
pythonProcess.on('close', (code) => {
  process.exit(code);
});

pythonProcess.on('error', (err) => {
  console.error('Failed to start Python process:', err);
  process.exit(1);
});
