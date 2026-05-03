/// <reference types='vitest' />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { vitePluginAnkiTemplate } from '@anki-eco/vite-plugin';

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/templates/example-react',
  server: {
    port: 4200,
    host: 'localhost',
  },
  preview: {
    port: 4200,
    host: 'localhost',
  },
  plugins: [
    react(),
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
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
  },
}));
