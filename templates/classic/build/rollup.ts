import type { BuildConfig } from './config.ts';
import { entries } from './entries.ts';
import devServer from './plugins/dev-server/index.ts';
import generateTemplate from './plugins/generate-template.ts';
import { ensureValue, findMatchNote } from './utils.ts';
import nodePolyfills from '@rolldown/plugin-node-polyfills';
import html from '@rollup/plugin-html';
import virtual from '@rollup/plugin-virtual';
import { dataToEsm } from '@rollup/pluginutils';
import { transform as swcTransform } from '@swc/core';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import fs from 'node:fs/promises';
import path from 'node:path';
import postcssNested from 'postcss-nested';
import type { InputOptions, OutputChunk, OutputOptions } from 'rolldown';
import { replacePlugin, aliasPlugin } from 'rolldown/experimental';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';

const packageJson = JSON.parse(
  await fs.readFile(path.resolve(import.meta.dirname, '../package.json'), {
    encoding: 'utf8',
  }),
);

export async function rollupOptions(
  config: BuildConfig,
  { dev = false }: { dev?: boolean } = {},
) {
  async function buildInputOptions() {
    const i18nMap = await fs
      .readFile(
        path.resolve(
          import.meta.dirname,
          '../translations/',
          `${config.locale}.json`,
        ),
        { encoding: 'utf8' },
      )
      .then(JSON.parse);
    const entryCode = await buildEntry();
    return {
      input: 'entry',
      transform: {
        jsx: {
          runtime: 'automatic',
          importSource: 'preact',
        },
      },
      moduleTypes: {
        '.svg': 'dataurl',
      },
      treeshake: true,
      plugins: [
        virtual({
          'at/options': dataToEsm({
            ...entries[config.entry],
            ...config,
          }),
          'at/i18n': dataToEsm(i18nMap),
          entry: entryCode,
          'at/virtual/field': `export {default as AnkiField} from '${path.resolve(import.meta.dirname, config.field === 'markdown' ? '../src/features/markdown/field.tsx' : '../src/components/native-field.tsx')}'`,
          'at/virtual/extract-tf-items': `export {extractItems} from '${path.resolve(import.meta.dirname, config.field === 'markdown' ? '../src/features/tf/extract-markdown-items.ts' : '../src/features/tf/extract-native-items.ts')}'`,
        }),
        replacePlugin(
          {
            'process.env.NODE_ENV': JSON.stringify(
              envValue('production', 'development'),
            ),
            'import.meta.env': '({})',
            'import.meta.env.MODE': JSON.stringify(
              envValue('production', 'development'),
            ),
          },
          {
            preventAssignment: true,
          },
        ),
        aliasPlugin({
          entries: [
            {
              find: 'lodash/isPlainObject',
              replacement: path.resolve(
                import.meta.dirname,
                '../src/polyfills/is-plain-object',
              ),
            },
            {
              find: '@',
              replacement: path.resolve(import.meta.dirname, '../src'),
            },
            { find: 'react', replacement: 'preact/compat' },
            { find: 'react-dom/test-utils', replacement: 'preact/test-utils' },
            { find: 'react-dom', replacement: 'preact/compat' },
            { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
          ].filter(Boolean),
        }),
        nodePolyfills(),
        postcss({
          extract: true,
          plugins: [
            postcssNested(),
            autoprefixer(),
            tailwindcss(),
            envValue(
              cssnano({
                preset: [
                  'default',
                  {
                    discardComments: {
                      removeAll: true,
                    },
                  },
                ],
              }),
              false,
            ),
          ].filter(Boolean),
        }),
        // visualizer(),
        {
          name: 'at-transform',
          async renderChunk(code) {
            const result = await swcTransform(code, {
              jsc: {
                target: 'es5',
                minify: {
                  compress: {
                    drop_console: true,
                  },
                  format: {
                    comments: false,
                  },
                },
              },
              minify: envValue(true, false),
            });
            return result.code;
          },
        },
        html({
          fileName: `front.html`,
          template(options) {
            const { files = {} } = options || {};
            let frontHtml = '';
            frontHtml += `<script>
window.atDefaultOptions =

/* options begin */
{
	"at:test:test": "test"
}
/* options end */

</script>
`;
            frontHtml += `<div data-at-version="${packageJson.version}" id="at-root"></div>`;
            frontHtml += `<style>${(files?.css as { source: string }[])?.map(({ source }) => source).join('')}</style>`;
            frontHtml += `
<div id="at-fields" style="display:none;">
${buildFields()}
</div>
`;
            frontHtml +=
              (files.js as OutputChunk[])
                ?.map(({ code }) =>
                  envValue(
                    `<script>
                      (function(){
                        const code="${Buffer.from(code).toString('base64')}";
                        function decodeBase64(encodedStr) {
                          const bytes = Uint8Array.from(atob(encodedStr), c => c.charCodeAt(0));
                          return new TextDecoder().decode(bytes);
                        }
                        eval(decodeBase64(code));
                      })();
                    </script>`,
                    `<script>${code}</script>`,
                  ),
                )
                .join('') || '';
            return frontHtml;
          },
        }),
        generateTemplate(config),
        envValue(false, () => devServer()),
      ],
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      },
    } as InputOptions;
  }
  function buildOutputOptions() {
    return {
      format: 'iife',
      dir: `output/dist/${config.name}`,
      inlineDynamicImports: true,
      // TODO: rolldown's minify is still wip
      minify: false,
    } as OutputOptions;
  }

  return {
    inputOptions: await buildInputOptions(),
    outputOptions: buildOutputOptions(),
  };

  function envValue<P, D>(prodValue: P, devValue: D) {
    return dev ? ensureValue(devValue) : ensureValue(prodValue);
  }

  function buildFields() {
    const entry = entries[config.entry];
    const notes = findMatchNote(config);
    return entry.fields
      .map(
        (field: string) =>
          `    <div id="at-field-${field}">${envValue(
            `{{${field}}}`,
            notes[0].fields[field as never] || '',
          )}</div>`,
      )
      .join('\n');
  }

  async function buildEntry() {
    // Try to find the full entry file first, then fall back to the base name
    const fullEntryPath = path.resolve(
      import.meta.dirname,
      `../src/entries/${config.entry}.tsx`,
    );

    let entryFile = config.entry.split('_')[0];
    try {
      await fs.access(fullEntryPath);
      entryFile = config.entry;
    } catch {
      // Fall back to base entry
    }

    return `${envValue('', 'import "preact/debug";')}
  import App from '@/entries/${entryFile}.tsx';
  import { setup } from '@/entries';
  setup(App);`;
  }
}
