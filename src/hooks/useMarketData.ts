import { useEffect, useState } from 'react';
import type { MarketDataProvider } from '../services';
import type { Company, DataError, Quote, Series, TimeRange } from '../types/finance';
import { splitResults } from '../utils/metrics';

export type LoadStatus = 'loading' | 'ready' | 'error';

export interface MarketDataState {
  status: LoadStatus;
  quotes: Quote[];
  series: Series[];
  /** Per-symbol failures; the dashboard still renders whatever succeeded. */
  errors: DataError[];
  /** Set only when the whole request failed (not per-symbol errors). */
  fatal?: string;
}

const INITIAL: MarketDataState = { status: 'loading', quotes: [], series: [], errors: [] };

export function useMarketData(
  provider: MarketDataProvider,
  companies: readonly Company[],
  range: TimeRange,
): MarketDataState {
  const [state, setState] = useState<MarketDataState>(INITIAL);

  useEffect(() => {
    let cancelled = false;
    setState(INITIAL);
    Promise.all([provider.getQuotes(companies), provider.getSeries(companies, range)])
      .then(([quoteResults, seriesResults]) => {
        if (cancelled) return;
        const q = splitResults(quoteResults);
        const s = splitResults(seriesResults);
        const errors = [...q.errors, ...s.errors].filter(
          (e, i, all) => all.findIndex((x) => x.symbol === e.symbol) === i,
        );
        setState({ status: 'ready', quotes: q.data, series: s.data, errors });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({
          ...INITIAL,
          status: 'error',
          fatal: err instanceof Error ? err.message : 'Unable to load market data',
        });
      });
    return () => {
      cancelled = true;
    };
  }, [provider, companies, range]);

  return state;
}
