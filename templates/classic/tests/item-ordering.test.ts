import { expect, test, describe } from 'vitest';
import { extractItems } from '../src/features/item-ordering/extract';

describe('extractItems', () => {
  function createField(html: string) {
    const el = document.createElement('div');
    el.innerHTML = html;
    return el;
  }

  test('simple text nodes separated by ===', () => {
    const field = createField('Apple===Banana===Orange');
    const items = extractItems(field);
    expect(items.length).toBe(3);
    expect(items[0].node.innerHTML).toBe('Apple');
    expect(items[1].node.innerHTML).toBe('Banana');
    expect(items[2].node.innerHTML).toBe('Orange');
  });

  test('items with <br> separating ===', () => {
    const field = createField('Apple<br>===<br>Banana<br>===<br>Orange');
    const items = extractItems(field);
    expect(items.length).toBe(3);
    expect(items[0].node.innerHTML).toBe('Apple');
    expect(items[1].node.innerHTML).toBe('Banana');
    expect(items[2].node.innerHTML).toBe('Orange');
  });

  test('pure separators in elements', () => {
    const field = createField('<div>Apple</div><div>===</div><div>Banana</div>');
    const items = extractItems(field);
    expect(items.length).toBe(2);
    expect(items[0].node.innerHTML).toBe('<div>Apple</div>');
    expect(items[1].node.innerHTML).toBe('<div>Banana</div>');
  });

  test('separators mixed inside block elements', () => {
    const field = createField('<div>Apple===Banana</div>');
    const items = extractItems(field);
    expect(items.length).toBe(2);
    expect(items[0].node.innerHTML).toBe('<div>Apple</div>');
    expect(items[1].node.innerHTML).toBe('<div>Banana</div>');
  });

  test('rich text is preserved', () => {
    const field = createField('<b>Apple</b><br>===<br><i>Banana</i>');
    const items = extractItems(field);
    expect(items.length).toBe(2);
    expect(items[0].node.innerHTML).toBe('<b>Apple</b>');
    expect(items[1].node.innerHTML).toBe('<i>Banana</i>');
  });

  test('leading and trailing white space or br is ignored', () => {
    const field = createField('<br> <br>Apple=== Banana <br>');
    const items = extractItems(field);
    expect(items.length).toBe(2);
    expect(items[0].node.innerHTML).toBe('Apple');
    expect(items[1].node.innerHTML).toBe(' Banana ');
  });
});
