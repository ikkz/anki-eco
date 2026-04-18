import { build } from 'vite';
import fs from 'node:fs';
import { commonConfig } from './vite.config.ts';
import path from 'node:path';

const __dirname = import.meta.dirname;

const entries = fs
  .readdirSync(path.join(__dirname, 'src', 'entries'))
  .map((file) => file.split('.').shift());

console.log(entries);

for (const entry of entries) {
  await build({
    configFile: false,
    root: __dirname,
    ...commonConfig,
    esbuild: {
      legalComments: 'none',
    },
    build: {
      outDir: './dist',
      emptyOutDir: false,
      reportCompressedSize: true,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      lib: {
        entry: `./src/entries/${entry}.ts`,
        name: `AnkiEcoExtension_${entry}`,
        fileName: () => `${entry}.js`,
        formats: ['umd' as const],
      },
      rollupOptions: {
        external: [],
      },
    },
  });
}
