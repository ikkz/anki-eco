import { shouldShowAnswerBlock } from '../src/entries/mcq.utils';
import { describe, expect, test } from 'vitest';

describe('shouldShowAnswerBlock', () => {
  test('hides answer block when options exist, answer display is hidden, and note is empty', () => {
    expect(shouldShowAnswerBlock(true, true, false)).toBe(false);
  });

  test('shows answer block when options exist, answer display is hidden, and note exists', () => {
    expect(shouldShowAnswerBlock(true, true, true)).toBe(true);
  });

  test('shows answer block when options exist and answer display is not hidden', () => {
    expect(shouldShowAnswerBlock(true, false, false)).toBe(true);
  });

  test('shows answer block for non-option mode', () => {
    expect(shouldShowAnswerBlock(false, true, false)).toBe(true);
  });
});
