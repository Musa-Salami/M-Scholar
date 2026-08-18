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
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center">
      <h1 className="font-display text-2xl font-bold text-slate-900">Portal failed to load</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Please try again. If this continues, return to the school website and open School Portal.
      </p>
      {error?.message ? (
        <p className="mt-3 max-w-lg break-words font-mono text-xs text-slate-400">{error.message}</p>
      ) : null}
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try again
        </button>
        <Link href="/" className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700">
          School website
        </Link>
      </div>
    </div>
  );
}
