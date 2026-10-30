import { describe, expect, it } from 'vitest';
import { percentChange, splitResults, toComparisonRows } from './metrics';

describe('percentChange', () => {
  it('computes first-to-last change', () => {
    expect(percentChange([{ t: 1, close: 100 }, { t: 2, close: 110 }])).toBeCloseTo(10);
  });
  it('returns 0 with fewer than two points', () => {
    expect(percentChange([{ t: 1, close: 100 }])).toBe(0);
  });
});

describe('toComparisonRows', () => {
  it('rebases each series to 100 and trims to the shortest length', () => {
    const rows = toComparisonRows([
      { symbol: 'A', points: [{ t: 1, close: 10 }, { t: 2, close: 20 }, { t: 3, close: 30 }] },
      { symbol: 'B', points: [{ t: 1, close: 200 }, { t: 2, close: 100 }] },
    ]);
    expect(rows).toEqual([
      { t: 1, A: 100, B: 100 },
      { t: 2, A: 200, B: 50 },
    ]);
  });
  it('returns empty for no series', () => {
    expect(toComparisonRows([])).toEqual([]);
  });
});

describe('splitResults', () => {
  it('separates data from errors', () => {
    const { data, errors } = splitResults<number>([
      { ok: true, data: 1 },
      { ok: false, error: { symbol: 'X', code: 'NOT_FOUND', message: 'nope' } },
    ]);
    expect(data).toEqual([1]);
    expect(errors).toHaveLength(1);
  });
});
