import { describe, expect, test } from 'vitest';
import { buildOrderingLayout } from '../src/features/ordering/layout';

describe('buildOrderingLayout', () => {
  test('keeps shorter pieces on the same row when they fit', () => {
    const layout = buildOrderingLayout(['a', 'b'], 240, (id) => ({
      width: id === 'a' ? 80 : 90,
      height: 32,
    }));

    expect(layout.positions.get('a')).toMatchObject({ x: 0, y: 0, width: 80, height: 32 });
    expect(layout.positions.get('b')).toMatchObject({ x: 88, y: 0, width: 90, height: 32 });
    expect(layout.height).toBe(32);
  });

  test('clamps a piece wider than the container', () => {
    const layout = buildOrderingLayout(['a'], 180, () => ({ width: 320, height: 48 }));

    expect(layout.positions.get('a')).toMatchObject({ x: 0, y: 0, width: 180, height: 48 });
    expect(layout.height).toBe(48);
  });

  test('places a long piece on its own row at the threshold', () => {
    const layout = buildOrderingLayout(['a', 'b'], 200, (id) => ({
      width: id === 'a' ? 60 : 130,
      height: 32,
    }));

    expect(layout.positions.get('a')).toMatchObject({ x: 0, y: 0 });
    expect(layout.positions.get('b')).toMatchObject({ x: 0, y: 40, width: 130 });
    expect(layout.height).toBe(72);
  });

  test('moves a long trailing piece to a new row and gives it the full row', () => {
    const layout = buildOrderingLayout(['a', 'b', 'c'], 220, (id) => ({
      width: (
        {
          a: 70,
          b: 150,
          c: 60,
        } as const
      )[id],
      height: 32,
    }));

    expect(layout.positions.get('a')).toMatchObject({ x: 0, y: 0 });
    expect(layout.positions.get('b')).toMatchObject({ x: 0, y: 40, width: 150 });
    expect(layout.positions.get('c')).toMatchObject({ x: 0, y: 80 });
    expect(layout.height).toBe(112);
  });

  test('still wraps multiple short pieces without changing basic flow', () => {
    const layout = buildOrderingLayout(['a', 'b', 'c'], 180, () => ({
      width: 70,
      height: 32,
    }));

    expect(layout.positions.get('a')).toMatchObject({ x: 0, y: 0 });
    expect(layout.positions.get('b')).toMatchObject({ x: 78, y: 0 });
    expect(layout.positions.get('c')).toMatchObject({ x: 0, y: 40 });
    expect(layout.height).toBe(72);
  });
});
