import { describe, expect, it } from 'vitest';
import { DEFAULT_COMPANIES } from '../config/companies';
import { createFixtureProvider } from './fixtureProvider';

const provider = createFixtureProvider(() => 1_700_000_000_000);

describe('fixtureProvider', () => {
  it('returns a quote for every default company', async () => {
    const quotes = await provider.getQuotes(DEFAULT_COMPANIES);
    expect(quotes).toHaveLength(5);
    expect(quotes.every((q) => q.ok)).toBe(true);
  });

  it.each([
    ['today', 78],
    ['7d', 7],
    ['quarter', 63],
  ] as const)('returns the expected number of points for %s', async (range, count) => {
    const [ibm] = await provider.getSeries([{ symbol: 'IBM', name: 'IBM' }], range);
    expect(ibm.ok && ibm.data.points).toHaveLength(count);
  });

  it.each(['AAPL', 'GOOGL', 'AMZN', 'NVDA'])('supports extra symbol %s', async (symbol) => {
    const [result] = await provider.getSeries([{ symbol, name: symbol }], '7d');
    expect(result.ok).toBe(true);
  });

  it('is deterministic', async () => {
    const a = await provider.getSeries(DEFAULT_COMPANIES, '7d');
    const b = await provider.getSeries(DEFAULT_COMPANIES, '7d');
    expect(a).toEqual(b);
  });

  it('reports unknown symbols as NOT_FOUND without failing others', async () => {
    const results = await provider.getQuotes([
      { symbol: 'IBM', name: 'IBM' },
      { symbol: 'ZZZZ', name: 'Unknown' },
    ]);
    expect(results[0].ok).toBe(true);
    expect(results[1]).toMatchObject({ ok: false, error: { code: 'NOT_FOUND', symbol: 'ZZZZ' } });
  });
});
