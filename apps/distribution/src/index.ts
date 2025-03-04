import path from 'node:path';
import { URL } from 'node:url';
import fs from 'node:fs/promises';

const root = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  '../'
);

const packageJson = (await fs
  .readFile(path.resolve(root, 'package.json'), {
    encoding: 'utf8',
  })
  .then(JSON.parse)) as typeof import('../package.json');
const packages = packageJson.nx.implicitDependencies;

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
