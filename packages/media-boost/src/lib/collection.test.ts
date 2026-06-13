import { describe, expect, it } from 'vitest';
import { buildReferenceField, escapeHtmlAttribute } from './collection.js';

describe('helper collection fields', () => {
  it('escapes filenames for HTML attributes', () => {
    expect(escapeHtmlAttribute('a&"<中>.jpg')).toBe('a&amp;&quot;&lt;中&gt;.jpg');
  });

  it('creates one media reference per filename', () => {
    expect(buildReferenceField(['a.jpg', 'b.mp3'])).toBe('<img src="a.jpg"><img src="b.mp3">');
  });
});
