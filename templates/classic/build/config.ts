import type { entries } from './entries.ts';

export interface BuildConfig {
  type_id: number;
  deck_id: number;
  name: string;
  locale: string;
  entry: keyof typeof entries;
  field: 'native' | 'markdown';
}

interface ConfigItem {
  key: keyof BuildConfig;
  len: number;
  variants: string[];
}

export const items: ConfigItem[] = [
  {
    key: 'entry',
    len: 5,
    variants: [
      'mcq',
      'tf',
      'basic',
      'mcq_10',
      'mcq_26',
      'match',
      'match_ordered',
      'cloze',
      'input',
    ] as const satisfies (keyof typeof entries)[],
  },
  {
    key: 'locale',
    len: 4,
    variants: ['zh', 'en', 'ja', 'pt_br'],
  },
  {
    key: 'field',
    len: 2,
    variants: ['native', 'markdown'],
  },
];

const configs: BuildConfig[] = [];

function extendVariant(
  index: number,
  base: number,
  config: Pick<BuildConfig, 'type_id' | 'deck_id'> & Partial<BuildConfig>,
) {
  if (index === items.length) {
    configs.push({
      ...config,
    } as BuildConfig);
    return;
  }
  const { variants, len, key } = items[index];
  variants.forEach((value, i) => {
    extendVariant(index + 1, base + len, {
      ...config,
      [key]: value,
      name: config.name ? `${config.name}.${value}` : value,
      type_id: config.type_id | (i << base),
      deck_id: config.deck_id | (i << base),
    });
  });
}

const TEMPLATE_TAG = 0b111;
const DECK_TAG = 0b110;

extendVariant(0, 0, { type_id: TEMPLATE_TAG << 28, deck_id: DECK_TAG << 28 });

const LEGACY_TEMPLATE_MAP: Record<number, number> = {
  1879048192: 1730012858034,
  1879048224: 1725616643031,
  1879048193: 1356462000,
  1879048225: 1693362483,
  1879048194: 1382768988,
  1879048226: 1971232741,
};

configs.forEach((config) => {
  if (LEGACY_TEMPLATE_MAP[config.type_id]) {
    config.type_id = LEGACY_TEMPLATE_MAP[config.type_id];
  }
});

export { configs };
