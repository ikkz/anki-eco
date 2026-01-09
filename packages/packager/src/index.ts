import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

const BIN_BASE = path.resolve(import.meta.dirname, 'anki-eco-packager');
const BIN =
  process.platform === 'win32' && existsSync(`${BIN_BASE}.exe`)
    ? `${BIN_BASE}.exe`
    : BIN_BASE;

export interface AnkiPackageOptions {
  input?: string;
  output?: string;
  cwd?: string;
  multiple?: boolean;
}

export function ankiPackage(options: AnkiPackageOptions = {}): Promise<number> {
  const args: string[] = [];

  if (options.input) {
    args.push('-i', options.input);
  }
  if (options.output) {
    args.push('-o', options.output);
  }
  if (options.multiple) {
    args.push('--multiple');
  }

  const cwd = options.cwd || process.cwd();

  return new Promise((resolve, reject) => {
    const pythonProcess = spawn(BIN, ['--cwd', cwd, ...args], {
      stdio: 'inherit',
      cwd,
      shell: true,
    });

    pythonProcess.on('close', (code) => {
      resolve(code || 0);
    });

    pythonProcess.on('error', (err) => {
      reject(err);
    });
  });
}
