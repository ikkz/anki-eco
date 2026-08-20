import { describe, expect, test } from 'vitest';

import { extractCollections } from '../src/features/match/extract';

describe('extractCollections', () => {
  test('keeps image markup in match categories and items', () => {
    const field = document.createElement('div');
    field.innerHTML =
      '<img src="animal.png" alt="animal">::<img src="cat.png" alt="cat">,,dog<br>Fruit::apple,,<img src="pear.png" alt="pear">';

    const collections = extractCollections(field);

    expect(collections).toHaveLength(2);
    expect(collections[0].category.html).toBe('<img src="animal.png" alt="animal">');
    expect(collections[0].items[0].html).toBe('<img src="cat.png" alt="cat">');
    expect(collections[0].items[1].html).toBe('dog');
    expect(collections[1].category.html).toBe('Fruit');
    expect(collections[1].items[1].html).toBe('<img src="pear.png" alt="pear">');
  });
});
