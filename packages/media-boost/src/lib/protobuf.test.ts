import { describe, expect, it } from 'vitest';
import { parseMediaNames, parsePackageVersion } from './protobuf.js';

describe('protobuf parsing', () => {
  it('parses latest package metadata and ignores unknown fields', () => {
    expect(parsePackageVersion(new Uint8Array([0x10, 0x7b, 0x08, 0x03]))).toBe(3);
  });

  it('parses media names and ignores unknown fields', () => {
    const bytes = new Uint8Array([
      0x12, 0x01, 0x00, 0x0a, 0x07, 0x0a, 0x05, 0x61, 0x2e, 0x6a, 0x70, 0x67,
    ]);
    expect(parseMediaNames(bytes)).toEqual(['a.jpg']);
  });

  it('rejects truncated messages', () => {
    expect(() => parseMediaNames(new Uint8Array([0x0a, 0x05, 0x01]))).toThrow(
      'Truncated protobuf message',
    );
  });
});
