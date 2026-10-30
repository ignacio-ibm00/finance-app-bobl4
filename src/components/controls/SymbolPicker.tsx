import { useState, type FormEvent } from 'react';
import { validateSymbol } from '../../utils/symbol';

interface SymbolPickerProps {
  /** Currently charted symbol, if any. */
  selected: string | null;
  /** Symbols already on the main dashboard; these are rejected with a message. */
  alreadyShown: readonly string[];
  onSelect: (symbol: string) => void;
  onClear: () => void;
}

export function SymbolPicker({ selected, alreadyShown, onSelect, onClear }: SymbolPickerProps) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = validateSymbol(draft, alreadyShown);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setError(null);
    setDraft(result.symbol);
    onSelect(result.symbol);
  }

  function handleClear() {
    setDraft('');
    setError(null);
    onClear();
  }

  return (
    <form className="symbol-picker" onSubmit={handleSubmit} noValidate>
      <label htmlFor="symbol-input">Compare another company</label>
      <div className="symbol-picker-row">
        <input
          id="symbol-input"
          type="text"
          value={draft}
          placeholder="Ticker, e.g. AAPL"
          autoComplete="off"
          aria-invalid={error !== null}
          aria-describedby={error ? 'symbol-error' : undefined}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button type="submit">Show chart</button>
        {selected && (
          <button type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      {error && (
        <p id="symbol-error" role="alert" className="field-error">
          {error}
        </p>
      )}
    </form>
  );
}
