import type { DataError } from '../../types/finance';

export function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="state state-error">
      {message}
    </div>
  );
}

/** Non-blocking notice shown when some (not all) symbols failed. */
export function PartialDataBanner({ errors }: { errors: readonly DataError[] }) {
  if (errors.length === 0) return null;
  return (
    <div role="alert" className="state state-warning">
      Some data is unavailable: {errors.map((e) => `${e.symbol} (${e.message})`).join('; ')}
    </div>
  );
}
