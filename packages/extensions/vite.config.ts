/// <reference types='vitest' />
import { defineConfig, type UserConfig } from 'vite';
import dts from 'vite-plugin-dts';
import * as path from 'path';

const __dirname = import.meta.dirname;

export const commonConfig: Partial<UserConfig> = {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
};

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/extensions',
  plugins: [
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
  ],
  ...commonConfig,
  build: {
    outDir: './dist',
    emptyOutDir: false,
    reportCompressedSize: true,
    lib: {
      entry: 'src/index.ts',
      formats: ['es' as const],
    },
    rolldownOptions: {
      external: [],
    },
  },
}));
