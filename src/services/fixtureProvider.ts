import type { Company, PricePoint, Quote, Result, Series, TimeRange } from '../types/finance';
import type { MarketDataProvider } from './MarketDataProvider';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Base prices for known symbols; anything else is reported as NOT_FOUND. */
const BASE_PRICES: Record<string, number> = {
  IBM: 230,
  MSFT: 420,
  ORCL: 175,
  SAP: 245,
  CRM: 300,
};

const POINTS: Record<TimeRange, { count: number; stepMs: number }> = {
  today: { count: 78, stepMs: 5 * 60 * 1000 },
  '7d': { count: 7, stepMs: DAY_MS },
  quarter: { count: 63, stepMs: DAY_MS },
};

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Deterministic pseudo-random walk, seeded by symbol + range so output is stable. */
function buildPoints(symbol: string, range: TimeRange, now: number): PricePoint[] {
  const base = BASE_PRICES[symbol];
  const { count, stepMs } = POINTS[range];
  let seed = hash(`${symbol}:${range}`);
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 0xffffffff - 0.5;
  };
  const volatility = range === 'today' ? 0.002 : 0.012;
  let price = base;
  return Array.from({ length: count }, (_, i) => {
    price = Math.max(1, price * (1 + next() * volatility * 2));
    return { t: now - (count - 1 - i) * stepMs, close: Number(price.toFixed(2)) };
  });
}

function notFound(symbol: string): Result<never> {
  return {
    ok: false,
    error: { symbol, code: 'NOT_FOUND', message: `No data available for ${symbol}` },
  };
}

export function createFixtureProvider(now: () => number = Date.now): MarketDataProvider {
  return {
    async getQuotes(companies: readonly Company[]): Promise<Result<Quote>[]> {
      return companies.map((c): Result<Quote> => {
        if (!(c.symbol in BASE_PRICES)) return notFound(c.symbol);
        const points = buildPoints(c.symbol, 'today', now());
        const open = points[0].close;
        const price = points[points.length - 1].close;
        return {
          ok: true,
          data: {
            symbol: c.symbol,
            name: c.name,
            price,
            change: Number((price - open).toFixed(2)),
            changePct: Number((((price - open) / open) * 100).toFixed(2)),
            currency: 'USD',
          },
        };
      });
    },

    async getSeries(companies: readonly Company[], range: TimeRange): Promise<Result<Series>[]> {
      return companies.map((c): Result<Series> => {
        if (!(c.symbol in BASE_PRICES)) return notFound(c.symbol);
        return { ok: true, data: { symbol: c.symbol, range, points: buildPoints(c.symbol, range, now()) } };
      });
    },
  };
}
