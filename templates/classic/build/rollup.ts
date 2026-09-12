import type { BuildConfig } from './config.ts';
import { entries } from './entries.ts';
import devServer from './plugins/dev-server/index.ts';
import generateTemplate from './plugins/generate-template.ts';
import { ensureValue, findMatchNote, renderNativeClozePreview } from './utils.ts';
import nodePolyfills from '@rolldown/plugin-node-polyfills';
import html from '@rollup/plugin-html';
import virtual from '@rollup/plugin-virtual';
import { dataToEsm } from '@rollup/pluginutils';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import fs from 'node:fs/promises';
import path from 'node:path';
import postcssNested from 'postcss-nested';
import type { InputOptions, OutputOptions } from 'rolldown';
import { viteAliasPlugin as aliasPlugin } from 'rolldown/experimental';
import { replacePlugin } from 'rolldown/plugins';
import postcss from 'rollup-plugin-postcss';
import tailwindcss from 'tailwindcss';

const packageJson = JSON.parse(
  await fs.readFile(path.resolve(import.meta.dirname, '../package.json'), {
    encoding: 'utf8',
  }),
);

export async function rolldownOptions(
  config: BuildConfig,
  { dev = false }: { dev?: boolean } = {},
) {
  async function buildInputOptions() {
    const i18nMap = await fs
      .readFile(path.resolve(import.meta.dirname, '../translations/', `${config.locale}.json`), {
        encoding: 'utf8',
      })
      .then(JSON.parse);
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
        '.css': 'empty',
      },
      treeshake: true,
      plugins: [
        virtual({
          'at/options': dataToEsm({
            ...entries[config.entry],
            ...config,
          }),
          'at/i18n': dataToEsm(i18nMap),
          entry: buildEntry(),
        }),
        replacePlugin(
          {
            'process.env.NODE_ENV': JSON.stringify(envValue('production', 'development')),
            'import.meta.env': '({})',
            'import.meta.env.MODE': JSON.stringify(envValue('production', 'development')),
          },
          {
            preventAssignment: true,
          },
        ),
        aliasPlugin({
          entries: [
            {
              find: 'lodash/isPlainObject',
              replacement: path.resolve(import.meta.dirname, '../src/polyfills/is-plain-object'),
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
        html({
          fileName: `front.html`,
          template(options) {
            const { files = {} } = options || {};
            const jsFiles = files.js ?? [];
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
              jsFiles
                .map((file) => {
                  if (!('code' in file)) return '';
                  const { code } = file;
                  // return `<script>${code}</script>`;
                  return envValue(
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
                  );
                })
                .filter(Boolean)
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
      codeSplitting: false,
      minify: envValue(
        {
          compress: {
            dropConsole: true,
            dropDebugger: true,
          },
        },
        false,
      ),
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
      .map((field: string) => {
        const value = notes[0].fields[field as never] || '';
        return `    <div id="at-field-${field}">${envValue(
          config.entry === 'cloze_native' && field === 'question'
            ? `{{cloze:${field}}}`
            : `{{${field}}}`,
          config.entry === 'cloze_native' && field === 'question'
            ? renderNativeClozePreview(value)
            : value,
        )}</div>`;
      })
      .join('\n');
  }

  function buildEntry() {
    return `${envValue('', 'import "preact/debug";')}
  import App from '@/entries/${config.entry.split('_')[0]}.tsx';
  import { setup } from '@/entries';
  setup(App);`;
  }
}
