"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <h1 className="font-display text-2xl font-semibold text-brand">Portal failed to load</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Please try again. If this continues, return to the school website and open School Portal.
      </p>
      {error?.message ? (
        <p className="mt-3 max-w-lg break-words font-mono text-xs text-muted">{error.message}</p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Try again
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-brand">
          School website
        </Link>
      </div>
    </div>
  );
}
