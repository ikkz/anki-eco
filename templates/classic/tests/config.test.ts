import { configs, selectBuildConfigs } from '../build/config';
import { renderNativeClozePreview } from '../build/utils';
import { describe, expect, test } from 'vitest';

describe('config', () => {
  test('generates one config per entry and locale with stable native ids', () => {
    expect(configs).toHaveLength(44);
    expect(configs.every(({ name, entry, locale }) => name === `${entry}.${locale}`)).toBe(true);
    expect(new Set(configs.map(({ type_id }) => type_id)).size).eq(configs.length);
    expect(configs.find(({ name }) => name === 'mcq.zh')).toMatchObject({
      type_id: 1730012858034,
      deck_id: 1610612736,
    });
    expect(configs.find(({ name }) => name === 'basic.en')).toMatchObject({
      type_id: 1971232741,
      deck_id: 1610612770,
    });
  });

  test('native cloze builds 4 locale variants', () => {
    const nativeClozeConfigs = configs.filter(({ entry }) => entry === 'cloze_native');
    expect(nativeClozeConfigs).toHaveLength(4);
    expect(nativeClozeConfigs.map(({ locale }) => locale)).toEqual(['zh', 'en', 'ja', 'pt_br']);
  });

  test('local builds require one entry or an explicit full build', () => {
    expect(() => selectBuildConfigs({}, false, false)).toThrow('Specify one template');
    expect(selectBuildConfigs({ entry: 'cloze_native' }, false, false)).toHaveLength(4);
    expect(selectBuildConfigs({}, true, false)).toBe(configs);
    expect(selectBuildConfigs({ locale: 'en' }, false, true).length).toBeGreaterThan(1);
    expect(() => selectBuildConfigs({ entry: 'cloze_native' }, true, false)).toThrow(
      '--all cannot be combined',
    );
  });

  test('native cloze dev preview renders every current ordinal', () => {
    const rendered = renderNativeClozePreview(
      '{{c1::Beijing::capital city}} / {{c1::Beijing}} / {{c2::Shanghai}}',
    );

    expect(rendered.match(/class="cloze"/g)).toHaveLength(2);
    expect(rendered.match(/class="cloze-inactive"/g)).toHaveLength(1);
    expect(rendered).toContain('[capital city]');
  });
});
