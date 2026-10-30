import { useMemo } from 'react';
import { DEFAULT_COMPANIES, TIME_RANGES } from '../../config/companies';
import { useMarketData } from '../../hooks/useMarketData';
import type { MarketDataProvider } from '../../services';
import type { TimeRange } from '../../types/finance';
import { ChartCard } from '../charts/ChartCard';
import { ComparisonLineChart } from '../charts/ComparisonLineChart';
import { ErrorState } from '../feedback/ErrorState';
import { LoadingState } from '../feedback/LoadingState';

const BASELINE = DEFAULT_COMPANIES[0]; // IBM

interface Props {
  provider: MarketDataProvider;
  symbol: string;
  range: TimeRange;
}

/**
 * Chart of one user-chosen company against IBM. It owns its own data request, so its
 * loading or failure never affects the main dashboard.
 */
export function SelectedCompanyPanel({ provider, symbol, range }: Props) {
  // Memoized: useMarketData refetches whenever the array identity changes.
  const companies = useMemo(() => [BASELINE, { symbol, name: symbol }], [symbol]);
  const state = useMarketData(provider, companies, range);
  const rangeLabel = TIME_RANGES.find((r) => r.id === range)?.label ?? range;

  if (state.status === 'loading') return <LoadingState label={`Loading ${symbol}…`} />;
  if (state.status === 'error') {
    return <ErrorState message={state.fatal ?? `Unable to load data for ${symbol}`} />;
  }

  // Only ever chart the requested symbol's own series; never substitute another company.
  const selectedSeries = state.series.find((s) => s.symbol === symbol);
  if (!selectedSeries || selectedSeries.points.length === 0) {
    return <ErrorState message={`No data available for ${symbol}. Check the ticker and try again.`} />;
  }

  return (
    <ChartCard
      title={`Selected company: ${symbol} vs ${BASELINE.symbol} · ${rangeLabel}`}
      subtitle="Each series rebased to 100 at the start of the period"
    >
      <ComparisonLineChart series={state.series} range={range} />
    </ChartCard>
  );
}
