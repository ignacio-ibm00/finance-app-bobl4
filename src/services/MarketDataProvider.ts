import type { Company, Quote, Result, Series, TimeRange } from '../types/finance';

/**
 * Contract between the UI and any market data source.
 * Implementations: fixtureProvider (offline/demo), future yahooProvider (via backend proxy).
 * Methods resolve per-symbol Results and should not throw for expected failures.
 */
export interface MarketDataProvider {
  getQuotes(companies: readonly Company[]): Promise<Result<Quote>[]>;
  getSeries(companies: readonly Company[], range: TimeRange): Promise<Result<Series>[]>;
}
