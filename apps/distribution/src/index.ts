import path from 'node:path';
import { URL } from 'node:url';
import fs from 'node:fs/promises';

const packages = ['style-kit'];

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../'
);

const nodeModules = path.resolve(root, 'node_modules');
const thisDist = path.resolve(root, 'dist');

if (
  await fs
    .stat(thisDist)
    .then((stat) => stat.isDirectory())
    .catch(() => false)
) {
  await fs.rm(thisDist, {
    force: true,
    recursive: true,
  });
}

for (const name of packages) {
  const dist = path.resolve(nodeModules, `@anki-eco/${name}/dist`);

  await fs.cp(dist, path.resolve(root, `dist/${name}`), {
    recursive: true,
  });
}
