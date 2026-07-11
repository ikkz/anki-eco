import { describe, expect, test } from 'vitest';

import { extractCollections } from '../src/features/match/extract';

describe('extractCollections', () => {
  test('keeps image markup in match items', () => {
    const field = document.createElement('div');
    field.innerHTML =
      'Animal::<img src="cat.png" alt="cat">,,dog<br>Fruit::apple,,<img src="pear.png" alt="pear">';

    const collections = extractCollections(field);

    expect(collections).toHaveLength(2);
    expect(collections[0].category.name).toBe('Animal');
    expect(collections[0].items[0].html).toBe('<img src="cat.png" alt="cat">');
    expect(collections[0].items[1].html).toBe('dog');
    expect(collections[1].category.name).toBe('Fruit');
    expect(collections[1].items[1].html).toBe('<img src="pear.png" alt="pear">');
  });
});
