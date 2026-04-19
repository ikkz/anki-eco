import { hasSelectedText } from '../src/features/cloze/has-selected-text';
import { afterEach, describe, expect, test } from 'vitest';

afterEach(() => {
  window.getSelection()?.removeAllRanges();
});

describe('hasSelectedText', () => {
  test('returns false when selection is collapsed', () => {
    const container = document.createElement('div');
    const text = document.createTextNode('hello');
    container.appendChild(text);
    document.body.appendChild(container);

    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 0);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(hasSelectedText(container)).toBe(false);
    container.remove();
  });

  test('returns true when selected text is inside container', () => {
    const container = document.createElement('div');
    const text = document.createTextNode('hello');
    container.appendChild(text);
    document.body.appendChild(container);

    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, 5);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(hasSelectedText(container)).toBe(true);
    container.remove();
  });

  test('returns false when selected text is outside container', () => {
    const container = document.createElement('div');
    const inside = document.createTextNode('inside');
    container.appendChild(inside);
    document.body.appendChild(container);

    const outside = document.createElement('div');
    const outsideText = document.createTextNode('outside');
    outside.appendChild(outsideText);
    document.body.appendChild(outside);

    const range = document.createRange();
    range.setStart(outsideText, 0);
    range.setEnd(outsideText, 7);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(hasSelectedText(container)).toBe(false);
    container.remove();
    outside.remove();
  });
});
