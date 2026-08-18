import Link from "next/link";
import { pageHref } from "@/lib/paths";

const NEWS = [
  { date: "2026-02-15", title: "Inter-House Sports Competition", excerpt: "Our annual sports day will be held on March 5th. All parents are invited to attend and support their children." },
  { date: "2026-02-01", title: "Term 2 Results Published", excerpt: "First term report cards are now available on the parent and student portal. Log in to view and download.", href: "/login/" },
  { date: "2026-01-20", title: "New Science Laboratory Commissioned", excerpt: "We officially opened our upgraded science lab, equipped with modern apparatus for practical sessions." },
  { date: "2026-01-08", title: "Welcome Back — New Term Begins", excerpt: "We warmly welcome all students and staff back for the 2025/2026 second term. Term begins January 13." },
];

export default function NewsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold text-slate-900">News & Events</h1>
      <p className="mt-2 text-lg text-slate-500">Latest updates from our school community</p>

      <div className="mt-12 space-y-6">
        {NEWS.map(({ date, title, excerpt, href }) => (
          <article key={title} className="card-shadow rounded-2xl border border-slate-100 bg-white p-6 md:p-8">
            <time className="text-sm font-medium text-blue-600">{new Date(date).toLocaleDateString("en-NG", { dateStyle: "long" })}</time>
            <h2 className="mt-2 font-display text-xl font-bold text-slate-900">{title}</h2>
            <p className="mt-2 text-slate-600">{excerpt}</p>
            {href && (
              <Link href={pageHref(href)} className="mt-3 inline-block text-sm font-semibold text-blue-600 hover:underline">
                Open School Portal
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
