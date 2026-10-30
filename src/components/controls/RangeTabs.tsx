import { TIME_RANGES } from '../../config/companies';
import type { TimeRange } from '../../types/finance';

interface Props {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}

export function RangeTabs({ value, onChange }: Props) {
  return (
    <div role="tablist" aria-label="Time range" className="range-tabs">
      {TIME_RANGES.map((r) => (
        <button
          key={r.id}
          role="tab"
          type="button"
          aria-selected={r.id === value}
          className={r.id === value ? 'active' : undefined}
          onClick={() => onChange(r.id)}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
