import { useState } from 'react';
import { QuoteCardGrid } from '../components/cards/QuoteCardGrid';
import { ChartCard } from '../components/charts/ChartCard';
import { ComparisonLineChart } from '../components/charts/ComparisonLineChart';
import { RangeTabs } from '../components/controls/RangeTabs';
import { SymbolPicker } from '../components/controls/SymbolPicker';
import { ErrorBoundary } from '../components/feedback/ErrorBoundary';
import { ErrorState, PartialDataBanner } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { SelectedCompanyPanel } from '../components/panels/SelectedCompanyPanel';
import { DEFAULT_COMPANIES, TIME_RANGES } from '../config/companies';
import { useMarketData } from '../hooks/useMarketData';
import { marketData, type MarketDataProvider } from '../services';
import type { TimeRange } from '../types/finance';

interface DashboardPageProps {
  /** Injectable for tests and for swapping data sources. */
  provider?: MarketDataProvider;
}

export function DashboardPage({ provider = marketData }: DashboardPageProps) {
  const [range, setRange] = useState<TimeRange>('today');
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const state = useMarketData(provider, DEFAULT_COMPANIES, range);
  const rangeLabel = TIME_RANGES.find((r) => r.id === range)?.label ?? range;

  return (
    <>
      <RangeTabs value={range} onChange={setRange} />
      {state.status === 'loading' && <LoadingState />}
      {state.status === 'error' && <ErrorState message={state.fatal ?? 'Unable to load market data'} />}
      {state.status === 'ready' && (
        <>
          <PartialDataBanner errors={state.errors} />
          <QuoteCardGrid quotes={state.quotes} />
          <ChartCard title={`Relative performance: ${rangeLabel}`} subtitle="Each series rebased to 100 at the start of the period">
            <ComparisonLineChart series={state.series} range={range} />
          </ChartCard>
        </>
      )}
      <SymbolPicker
        selected={selectedSymbol}
        alreadyShown={DEFAULT_COMPANIES.map((c) => c.symbol)}
        onSelect={setSelectedSymbol}
        onClear={() => setSelectedSymbol(null)}
      />
      {selectedSymbol && (
        <ErrorBoundary>
          <SelectedCompanyPanel provider={provider} symbol={selectedSymbol} range={range} />
        </ErrorBoundary>
      )}
    </>
  );
}
