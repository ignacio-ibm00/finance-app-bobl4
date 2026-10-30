import { cloneElement, type ReactElement } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createFixtureProvider } from '../services/fixtureProvider';
import type { MarketDataProvider } from '../services';
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

describe('DashboardPage', () => {
  it('shows loading, then quote cards for all default companies', async () => {
    render(<DashboardPage provider={createFixtureProvider()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByLabelText('IBM quote')).toBeInTheDocument();
    for (const symbol of ['MSFT', 'ORCL', 'SAP', 'CRM']) {
      expect(screen.getByLabelText(`${symbol} quote`)).toBeInTheDocument();
    }
  });

  it('switches time range', async () => {
    const user = userEvent.setup();
    render(<DashboardPage provider={createFixtureProvider()} />);
    await screen.findByLabelText('IBM quote');
    await user.click(screen.getByRole('tab', { name: 'Last quarter' }));
    expect(await screen.findByLabelText('Relative performance: Last quarter')).toBeInTheDocument();
  });

  it('shows an error state when the provider fails', async () => {
    const failing: MarketDataProvider = {
      getQuotes: () => Promise.reject(new Error('boom')),
      getSeries: () => Promise.reject(new Error('boom')),
    };
    render(<DashboardPage provider={failing} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('boom');
  });

  it('keeps rendering when only some symbols fail', async () => {
    const base = createFixtureProvider();
    const partial: MarketDataProvider = {
      getQuotes: async (c) => base.getQuotes([...c.slice(0, 1), { symbol: 'ZZZZ', name: 'Unknown' }]),
      getSeries: async (c, r) => base.getSeries([...c.slice(0, 1), { symbol: 'ZZZZ', name: 'Unknown' }], r),
    };
    render(<DashboardPage provider={partial} />);
    expect(await screen.findByLabelText('IBM quote')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('ZZZZ');
  });
});
