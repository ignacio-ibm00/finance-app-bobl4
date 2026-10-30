/** Domain types shared by the data layer, state, and UI. */

export type TimeRange = 'today' | '7d' | 'quarter';

export interface Company {
  symbol: string;
  name: string;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  currency: string;
}

export interface PricePoint {
  /** Epoch milliseconds. */
  t: number;
  close: number;
}

export interface Series {
  symbol: string;
  range: TimeRange;
  points: PricePoint[];
}

export type ErrorCode = 'INVALID_SYMBOL' | 'NOT_FOUND' | 'UPSTREAM' | 'TIMEOUT';

export interface DataError {
  symbol: string;
  code: ErrorCode;
  message: string;
}

/** Per-symbol result so one failing ticker never blanks the whole dashboard. */
export type Result<T> = { ok: true; data: T } | { ok: false; error: DataError };
