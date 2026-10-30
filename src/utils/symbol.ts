/** Format-only ticker rules. Whether a symbol actually has data is up to the data provider. */
const SYMBOL_PATTERN = /^[A-Z]{1,5}([.-][A-Z]{1,2})?$/;

export function normalizeSymbol(input: string): string {
  return input.trim().toUpperCase();
}

export type SymbolValidation = { ok: true; symbol: string } | { ok: false; message: string };

/** `alreadyShown` lists symbols the dashboard already charts, which we don't re-add. */
export function validateSymbol(input: string, alreadyShown: readonly string[] = []): SymbolValidation {
  const symbol = normalizeSymbol(input);
  if (symbol === '') return { ok: false, message: 'Enter a ticker symbol, for example AAPL.' };
  if (!SYMBOL_PATTERN.test(symbol)) {
    return { ok: false, message: `"${symbol}" is not a valid ticker. Use 1-5 letters, for example AAPL or BRK.B.` };
  }
  if (alreadyShown.includes(symbol)) {
    return { ok: false, message: `${symbol} is already on the dashboard. Pick a different company.` };
  }
  return { ok: true, symbol };
}
