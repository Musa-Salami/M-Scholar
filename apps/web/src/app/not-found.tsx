import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="text-sm font-semibold text-gold">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-brand">Page not found</h1>
      <p className="mt-2 max-w-md text-muted">
        This page does not exist, or the link may be outdated.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Back to school website
        </Link>
        <Link
          href="/login/"
          className="inline-flex min-h-11 items-center rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-brand hover:bg-white"
        >
          School Portal
        </Link>
      </div>
    </div>
  );
}
