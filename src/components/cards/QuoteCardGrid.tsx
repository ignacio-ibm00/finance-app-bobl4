import type { Quote } from '../../types/finance';
import { QuoteCard } from './QuoteCard';

export function QuoteCardGrid({ quotes }: { quotes: readonly Quote[] }) {
  return (
    <div className="quote-grid">
      {quotes.map((q) => (
        <QuoteCard key={q.symbol} quote={q} />
      ))}
    </div>
  );
}
