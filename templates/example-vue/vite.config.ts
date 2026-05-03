/// <reference types='vitest' />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { vitePluginAnkiTemplate } from '@anki-eco/vite-plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/templates/example-vue',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4300,
    host: 'localhost',
  },
  plugins: [
    vue(),
    vitePluginAnkiTemplate({
      note_type_id: 59545345,
      deck_id: 534536664,
      deck_name: 'test deck',
      note_type_name: 'note name',
      fields: ['Q', 'A'],
      notes: [
        {
          fields: {
            Q: 'What is ...?',
            A: 'A ...',
          },
        },
      ],
    }),
  ],
  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
}));
