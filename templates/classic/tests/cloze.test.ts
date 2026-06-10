import { getClozeShortcut, isEditableTarget } from '../src/features/cloze/shortcut';
import { getNextHiddenClozeNode, getTargetClozeNode } from '../src/features/cloze/target-node';
import { CLOZE_CLASS } from '../src/features/cloze/dom-to-cloze';
import { describe, expect, test } from 'vitest';

describe('getTargetClozeNode', () => {
  test('reveals next hidden cloze when clicking outside and setting is enabled', () => {
    const field = document.createElement('div');
    field.innerHTML = `<span class="${CLOZE_CLASS}" data-at-cloze-hide="true"></span><span id="outside">outside</span>`;
    const outside = field.querySelector('#outside');
    expect(outside).toBeTruthy();

    const node = getTargetClozeNode(field, outside as Element, true);
    expect(node).toBe(field.querySelector(`.${CLOZE_CLASS}`));
  });

  test('does not reveal next hidden cloze when clicking outside and setting is disabled', () => {
    const field = document.createElement('div');
    field.innerHTML = `<span class="${CLOZE_CLASS}" data-at-cloze-hide="true"></span><span id="outside">outside</span>`;
    const outside = field.querySelector('#outside');
    expect(outside).toBeTruthy();

    const node = getTargetClozeNode(field, outside as Element, false);
    expect(node).toBeNull();
  });

  test('always allows clicking directly on a cloze unit', () => {
    const field = document.createElement('div');
    field.innerHTML = `<span class="${CLOZE_CLASS}" data-at-cloze-hide="true" id="cloze">hidden</span>`;
    const cloze = field.querySelector('#cloze');
    expect(cloze).toBeTruthy();

    const node = getTargetClozeNode(field, cloze as Element, false);
    expect(node).toBe(cloze);
  });
});

describe('cloze shortcuts', () => {
  test('maps W to reveal next and Shift+Space to toggle all', () => {
    expect(getClozeShortcut(new KeyboardEvent('keydown', { key: 'w' }))).toBe('reveal-next');
    expect(getClozeShortcut(new KeyboardEvent('keydown', { key: 'W' }))).toBe('reveal-next');
    expect(getClozeShortcut(new KeyboardEvent('keydown', { key: ' ', shiftKey: true }))).toBe(
      'toggle-all',
    );
  });

  test('ignores modified shortcuts and editable targets', () => {
    expect(
      getClozeShortcut(new KeyboardEvent('keydown', { key: 'w', shiftKey: true })),
    ).toBeUndefined();
    expect(
      getClozeShortcut(new KeyboardEvent('keydown', { key: 'w', ctrlKey: true })),
    ).toBeUndefined();
    expect(
      getClozeShortcut(new KeyboardEvent('keydown', { key: 'w', isComposing: true })),
    ).toBeUndefined();

    const input = document.createElement('input');
    const contentEditable = document.createElement('div');
    contentEditable.setAttribute('contenteditable', 'true');
    expect(isEditableTarget(input)).toBe(true);
    expect(isEditableTarget(contentEditable)).toBe(true);
  });

  test('finds the next hidden cloze in document order', () => {
    const field = document.createElement('div');
    field.innerHTML = `<span class="${CLOZE_CLASS}" data-at-cloze-hide="false"></span><span id="next" class="${CLOZE_CLASS}" data-at-cloze-hide="true"></span><span class="${CLOZE_CLASS}" data-at-cloze-hide="true"></span>`;
    expect(getNextHiddenClozeNode(field)).toBe(field.querySelector('#next'));
  });
});
