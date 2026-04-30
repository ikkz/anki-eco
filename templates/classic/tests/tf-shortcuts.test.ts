import { getFirstUnansweredIndex } from '../src/features/tf/shortcut';
import { beforeEach, describe, expect, test } from 'vitest';

describe('tf shortcuts', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('finds first unanswered item in order', () => {
    sessionStorage.setItem('as-cross-status-2', 'true');
    sessionStorage.setItem('as-cross-status-0', 'false');
    expect(getFirstUnansweredIndex([2, 0, 1])).toBe(1);
  });

  test('returns -1 when all items are answered', () => {
    sessionStorage.setItem('as-cross-status-0', 'true');
    sessionStorage.setItem('as-cross-status-1', 'false');
    expect(getFirstUnansweredIndex([1, 0])).toBe(-1);
  });
});
