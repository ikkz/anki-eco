import { getAnkiClient } from '../src/utils/get-anki-client';
import { afterEach, describe, expect, test } from 'vitest';

const originalUserAgent = navigator.userAgent;

const mockUserAgent = (value: string) => {
  Object.defineProperty(window.navigator, 'userAgent', {
    value,
    configurable: true,
  });
};

describe('getAnkiClient', () => {
  afterEach(() => {
    mockUserAgent(originalUserAgent);
  });

  test('returns Android for Android user agent', () => {
    mockUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8)');
    expect(getAnkiClient()).toBe('Android');
  });

  test('returns iPhone for iPhone user agent', () => {
    mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)');
    expect(getAnkiClient()).toBe('iPhone');
  });

  test('returns Desktop for desktop user agent', () => {
    mockUserAgent('Mozilla/5.0 (X11; Linux x86_64)');
    expect(getAnkiClient()).toBe('Desktop');
  });
});
