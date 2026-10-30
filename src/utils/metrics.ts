import type { PricePoint, Result } from '../types/finance';

/** Percent change from first to last point; 0 for fewer than two points. */
export function percentChange(points: readonly PricePoint[]): number {
  if (points.length < 2 || points[0].close === 0) return 0;
  const first = points[0].close;
  const last = points[points.length - 1].close;
  return ((last - first) / first) * 100;
}

export interface ComparisonRow {
  t: number;
  [symbol: string]: number;
}

/**
 * Rebase each series to 100 at its first point and merge into rows keyed by index,
 * so companies with different price levels can share one chart axis.
 */
export function toComparisonRows(series: readonly { symbol: string; points: readonly PricePoint[] }[]): ComparisonRow[] {
  const length = Math.min(...series.map((s) => s.points.length));
  if (!Number.isFinite(length) || length === 0) return [];
  return Array.from({ length }, (_, i) => {
    const row: ComparisonRow = { t: series[0].points[i].t };
    for (const s of series) {
      row[s.symbol] = Number(((s.points[i].close / s.points[0].close) * 100).toFixed(2));
    }
    return row;
  });
}

export function splitResults<T>(results: readonly Result<T>[]) {
  const data: T[] = [];
  const errors: Extract<Result<T>, { ok: false }>['error'][] = [];
  for (const r of results) {
    if (r.ok) data.push(r.data);
    else errors.push(r.error);
  }
  return { data, errors };
}
