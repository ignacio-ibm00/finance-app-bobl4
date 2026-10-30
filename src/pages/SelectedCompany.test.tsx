import { cloneElement, type ReactElement } from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createFixtureProvider } from '../services/fixtureProvider';
import type { MarketDataProvider } from '../services';
import type { Company, Result, Series } from '../types/finance';
import { DashboardPage } from './DashboardPage';

// jsdom has no layout, so ResponsiveContainer would measure 0x0; give the chart a fixed size.
vi.mock('recharts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('recharts')>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactElement<{ width?: number; height?: number }> }) =>
      cloneElement(children, { width: 600, height: 320 }),
  };
});

const MAIN_CHART = 'Relative performance: Current day';
const SELECTED_CHART = /^Selected company: /;

async function pickSymbol(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByLabelText('Compare another company');
  await user.clear(input);
  if (text) await user.type(input, text);
  await user.click(screen.getByRole('button', { name: 'Show chart' }));
}

describe('DashboardPage: user-selected company chart', () => {
  it('shows no selected-company panel initially', async () => {
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');
    expect(screen.queryByLabelText(SELECTED_CHART)).not.toBeInTheDocument();
  });

  it('charts a valid ticker (normalized) while keeping the existing dashboard', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');

    await pickSymbol(user, ' aapl ');

    expect(await screen.findByLabelText('Selected company: AAPL vs IBM · Current day')).toBeInTheDocument();
    expect(screen.getByLabelText(MAIN_CHART)).toBeInTheDocument();
    for (const symbol of ['IBM', 'MSFT', 'ORCL', 'SAP', 'CRM']) {
      expect(screen.getByLabelText(`${symbol} quote`)).toBeInTheDocument();
    }
    // The selected company does not leak into the quote grid.
    expect(screen.queryByLabelText('AAPL quote')).not.toBeInTheDocument();
  });

  it('shows a loading state while the selected company loads', async () => {
    const user = userEvent.setup();
    const base = createFixtureProvider();
    let release: () => void = () => {};
    const gate = new Promise<void>((r) => (release = r));
    const slow: MarketDataProvider = {
      getQuotes: base.getQuotes,
      getSeries: async (companies, range) => {
        if (companies.some((c) => c.symbol === 'AAPL')) await gate;
        return base.getSeries(companies, range);
      },
    };
    render(<DashboardPage provider={slow} />);
    await screen.findByLabelText('IBM quote');

    await pickSymbol(user, 'AAPL');
    expect(await screen.findByText('Loading AAPL…')).toBeInTheDocument();
    // Main dashboard is not blocked by the slow request.
    expect(screen.getByLabelText('IBM quote')).toBeInTheDocument();

    release();
    expect(await screen.findByLabelText(/^Selected company: AAPL/)).toBeInTheDocument();
  });

  it('shows a no-data message for an unknown symbol and never substitutes another company', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');

    await pickSymbol(user, 'zzzz');

    const alert = await screen.findByText(/No data available for ZZZZ/);
    expect(alert).toBeInTheDocument();
    expect(screen.queryByLabelText(SELECTED_CHART)).not.toBeInTheDocument();
    // Existing dashboard unchanged.
    expect(screen.getByLabelText(MAIN_CHART)).toBeInTheDocument();
    expect(screen.getByLabelText('IBM quote')).toBeInTheDocument();
  });

  it('shows a no-data message when the provider returns an empty series for the symbol', async () => {
    const user = userEvent.setup();
    const base = createFixtureProvider();
    const empty: MarketDataProvider = {
      getQuotes: base.getQuotes,
      getSeries: async (companies: readonly Company[], range): Promise<Result<Series>[]> => {
        const results = await base.getSeries(companies, range);
        return results.map((r) => (r.ok && r.data.symbol === 'AAPL' ? { ok: true, data: { ...r.data, points: [] } } : r));
      },
    };
    render(<DashboardPage provider={empty} />);
    await screen.findByLabelText('IBM quote');

    await pickSymbol(user, 'AAPL');
    expect(await screen.findByText(/No data available for AAPL/)).toBeInTheDocument();
    expect(screen.queryByLabelText(SELECTED_CHART)).not.toBeInTheDocument();
  });

  it('rejects malformed input inline without fetching', async () => {
    const user = userEvent.setup();
    const base = createFixtureProvider();
    const getSeries = vi.fn(base.getSeries);
    render(<DashboardPage provider={{ getQuotes: base.getQuotes, getSeries }} />);
    await screen.findByLabelText('IBM quote');
    const callsBefore = getSeries.mock.calls.length;

    await pickSymbol(user, 'A1B');

    expect(screen.getByRole('alert')).toHaveTextContent(/not a valid ticker/);
    expect(getSeries.mock.calls.length).toBe(callsBefore);
    expect(screen.queryByLabelText(SELECTED_CHART)).not.toBeInTheDocument();
  });

  it('rejects empty input and symbols already on the dashboard', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');

    await pickSymbol(user, '');
    expect(screen.getByRole('alert')).toHaveTextContent(/Enter a ticker/);

    await pickSymbol(user, 'msft');
    expect(screen.getByRole('alert')).toHaveTextContent(/already on the dashboard/);
  });

  it('updates the selected-company chart when the range changes', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');
    await pickSymbol(user, 'NVDA');
    await screen.findByLabelText('Selected company: NVDA vs IBM · Current day');

    await user.click(screen.getByRole('tab', { name: 'Last quarter' }));

    expect(await screen.findByLabelText('Selected company: NVDA vs IBM · Last quarter')).toBeInTheDocument();
    expect(await screen.findByLabelText('Relative performance: Last quarter')).toBeInTheDocument();
  });

  it('clears the selection and hides the panel', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');
    await pickSymbol(user, 'GOOGL');
    await screen.findByLabelText(/^Selected company: GOOGL/);

    await user.click(screen.getByRole('button', { name: 'Clear' }));

    expect(screen.queryByLabelText(SELECTED_CHART)).not.toBeInTheDocument();
    expect(screen.getByLabelText(MAIN_CHART)).toBeInTheDocument();
    expect(within(screen.getByLabelText('Compare another company').closest('form')!).queryByRole('button', { name: 'Clear' })).toBeNull();
  });
});
