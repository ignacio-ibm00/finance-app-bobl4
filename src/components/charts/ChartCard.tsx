import type { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Reusable framed container for any chart or visual; keeps chart pages visually consistent. */
export function ChartCard({ title, subtitle, children }: ChartCardProps) {
  return (
    <section className="card chart-card" aria-label={title}>
      <header className="card-header">
        <h2>{title}</h2>
        {subtitle && <p className="muted">{subtitle}</p>}
      </header>
      <div className="card-body">{children}</div>
    </section>
  );
}
