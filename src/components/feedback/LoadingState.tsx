export function LoadingState({ label = 'Loading market data…' }: { label?: string }) {
  return (
    <div role="status" className="state state-loading">
      {label}
    </div>
  );
}
