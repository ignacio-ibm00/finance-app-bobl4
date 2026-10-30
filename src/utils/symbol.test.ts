import { describe, expect, it } from 'vitest';
import { normalizeSymbol, validateSymbol } from './symbol';

describe('normalizeSymbol', () => {
  it('trims and uppercases', () => {
    expect(normalizeSymbol('  aapl ')).toBe('AAPL');
  });
});

describe('validateSymbol', () => {
  it('accepts a normal ticker and returns it normalized', () => {
    expect(validateSymbol(' aapl ')).toEqual({ ok: true, symbol: 'AAPL' });
  });

  it.each(['BRK.B', 'BRK-B'])('accepts share-class ticker %s', (input) => {
    expect(validateSymbol(input)).toMatchObject({ ok: true });
  });

  it.each(['', '   ', 'A1B', 'TOOLONG', '$AAPL', 'AAPL!', 'A B'])('rejects %j', (input) => {
    expect(validateSymbol(input)).toMatchObject({ ok: false });
  });

  it('rejects symbols already on the dashboard', () => {
    const result = validateSymbol('ibm', ['IBM', 'MSFT']);
    expect(result).toMatchObject({ ok: false });
    expect(!result.ok && result.message).toMatch(/already on the dashboard/);
  });
});
