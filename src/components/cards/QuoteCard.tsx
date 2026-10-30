import type { Quote } from '../../types/finance';

export function QuoteCard({ quote }: { quote: Quote }) {
  const direction = quote.change >= 0 ? 'up' : 'down';
  const sign = quote.change >= 0 ? '+' : '';
  return (
    <article className="card quote-card" aria-label={`${quote.symbol} quote`}>
      <h3>
        {quote.symbol} <span className="muted">{quote.name}</span>
      </h3>
      <p className="price">
        {quote.price.toFixed(2)} <span className="muted">{quote.currency}</span>
      </p>
      <p className={`delta ${direction}`}>
        {sign}
        {quote.change.toFixed(2)} ({sign}
        {quote.changePct.toFixed(2)}%)
      </p>
    </article>
  );
}
