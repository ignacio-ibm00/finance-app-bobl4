import { createFixtureProvider } from './fixtureProvider';
import type { MarketDataProvider } from './MarketDataProvider';

/**
 * Single place where the data source is chosen.
 * Swap in a Yahoo Finance-backed provider here (see WORKSHOP-part1, Step C).
 */
export const marketData: MarketDataProvider = createFixtureProvider();

export type { MarketDataProvider } from './MarketDataProvider';
