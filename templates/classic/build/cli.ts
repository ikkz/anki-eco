#!/usr/bin/env node
import { type BuildConfig, selectBuildConfigs } from './config.ts';
import { rolldownOptions } from './rollup.ts';
import os from 'node:os';
import { parseArgs } from 'node:util';
import { rolldown, watch } from 'rolldown';

const { values: args } = parseArgs({
  options: {
    entry: {
      type: 'string',
    },
    locale: {
      type: 'string',
    },
    dev: {
      type: 'boolean',
      default: false,
    },
    all: {
      type: 'boolean',
      default: false,
    },
  },
});

const argConfig: Partial<Pick<BuildConfig, 'entry' | 'locale'>> = {
  entry: args.entry as BuildConfig['entry'],
  locale: args.locale as BuildConfig['locale'],
};

if (!args.dev) {
  const targetConfigs = selectBuildConfigs(argConfig, args.all, Boolean(process.env.CI));
  const concurrency = Math.max(1, os.availableParallelism?.() ?? os.cpus().length ?? 4);
  let nextIndex = 0;
  const workers = Array.from({ length: Math.min(concurrency, targetConfigs.length) }, async () => {
    while (nextIndex < targetConfigs.length) {
      const config = targetConfigs[nextIndex++];
      console.log('build', config);
      const { inputOptions, outputOptions } = await rolldownOptions(config, {
        dev: false,
      });
      const bundle = await rolldown(inputOptions);
      await bundle.write(outputOptions);
      await bundle.close();
    }
  });
  await Promise.all(workers);
} else {
  const { inputOptions, outputOptions } = await rolldownOptions(
    {
      entry: argConfig.entry || 'basic',
      locale: argConfig.locale || 'en',
      name: 'dev',
      type_id: 0,
      deck_id: 0,
    },
    {
      dev: true,
    },
  );
  const watcher = watch({
    ...inputOptions,
    output: outputOptions,
    watch: {
      buildDelay: 1000,
      exclude: ['node_modules/**', 'output/**'],
    },
  });
  watcher.on('event', (event) => {
    if (event.code === 'BUNDLE_END') {
      event.result.close();
    } else if (event.code === 'ERROR') {
      console.log(event.error);
      event.result?.close();
    }
  });
}
