import { getTargetClozeNode } from '../src/features/cloze/target-node';
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
