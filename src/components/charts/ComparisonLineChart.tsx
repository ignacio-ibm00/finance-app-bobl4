import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Series, TimeRange } from '../../types/finance';
import { toComparisonRows } from '../../utils/metrics';

const COLORS = ['#0f62fe', '#8a3ffc', '#009d9a', '#ee5396', '#ff832b'];

function formatTick(t: number, range: TimeRange): string {
  const d = new Date(t);
  return range === 'today'
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Multi-company line chart, each series rebased to 100 so relative performance is comparable. */
export function ComparisonLineChart({ series, range }: { series: readonly Series[]; range: TimeRange }) {
  const rows = toComparisonRows(series);
  if (rows.length === 0) return <p className="muted">No chart data available.</p>;

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <LineChart data={rows} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={(t: number) => formatTick(t, range)} minTickGap={32} />
          <YAxis domain={['auto', 'auto']} width={48} />
          <Tooltip labelFormatter={(t: number) => formatTick(t, range)} />
          <Legend />
          {series.map((s, i) => (
            <Line
              key={s.symbol}
              type="monotone"
              dataKey={s.symbol}
              stroke={COLORS[i % COLORS.length]}
              dot={false}
              strokeWidth={s.symbol === 'IBM' ? 3 : 1.5}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
