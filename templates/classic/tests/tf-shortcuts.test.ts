import { getFirstUnansweredIndex } from '../src/features/tf/shortcut';
import { beforeEach, describe, expect, test } from 'vitest';

describe('tf shortcuts', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('finds first unanswered item', () => {
    sessionStorage.setItem('as-cross-status-0', 'true');
    sessionStorage.setItem('as-cross-status-1', 'false');
    expect(getFirstUnansweredIndex(3)).toBe(2);
  });

  test('returns -1 when all items are answered', () => {
    sessionStorage.setItem('as-cross-status-0', 'true');
    sessionStorage.setItem('as-cross-status-1', 'false');
    expect(getFirstUnansweredIndex(2)).toBe(-1);
  });
});
