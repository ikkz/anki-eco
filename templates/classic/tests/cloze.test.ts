import { getClozeShortcut, isEditableTarget } from '../src/features/cloze/shortcut';
import { getNextHiddenClozeNode, getTargetClozeNode } from '../src/features/cloze/target-node';
import {
  CLOZE_CLASS,
  domToCloze,
  getClozeData,
  hideNativeCloze,
  toggleClozeHint,
} from '../src/features/cloze/dom-to-cloze';
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

test('adapts an Anki native cloze for interactive reveal', () => {
  const field = document.createElement('div');
  field.innerHTML =
    '<span class="cloze" data-cloze="Beijing" data-ordinal="1">[capital city]</span><span class="cloze-inactive">Shanghai</span>';

  expect(domToCloze(field)).toBe(1);
  const cloze = field.firstElementChild as Element;
  expect(getClozeData(cloze)).toEqual({
    type: 'native',
    answer: 'Beijing',
    hint: 'capital city',
    index: 0,
  });
});

test('does not treat Anki native placeholder as a hint', () => {
  const field = document.createElement('div');
  field.innerHTML = '<span class="cloze" data-cloze="Beijing" data-ordinal="1">[...]</span>';

  domToCloze(field);
  expect(getClozeData(field.firstElementChild as Element)?.hint).toBeUndefined();
});

test('renders a native hint separately from the hidden answer', () => {
  const field = document.createElement('div');
  field.innerHTML =
    '<span class="cloze" data-cloze="Beijing" data-ordinal="1">[capital city]</span>';

  domToCloze(field);
  const cloze = field.firstElementChild as Element;
  hideNativeCloze(cloze, getClozeData(cloze)?.hint);

  const hint = cloze.querySelector<HTMLElement>('.at-cloze-hint');
  expect(hint?.querySelector('.at-cloze-hint-placeholder')?.textContent).toBe('\u00a0'.repeat(3));
  expect(hint?.querySelector('[role="tooltip"]')?.textContent).toBe('capital city');
  expect(hint?.getAttribute('role')).toBe('button');
  expect(hint?.tabIndex).toBe(0);
  expect(hint?.getAttribute('aria-expanded')).toBe('false');
  expect(toggleClozeHint(hint as Element)).toBe(true);
  expect(hint?.getAttribute('aria-expanded')).toBe('true');
  hint?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  expect(hint?.getAttribute('aria-expanded')).toBe('false');
  expect(getClozeData(cloze)?.answer).toBe('Beijing');
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
