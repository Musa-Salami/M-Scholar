import Link from "next/link";
import { SCHOOL } from "@m-scholar/shared";
import { CheckCircle } from "lucide-react";

export default function AdmissionsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold text-slate-900">Admissions</h1>
      <p className="mt-2 text-lg text-slate-500">2025/2026 Academic Session — Now Open</p>

      <div className="mt-12 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section className="card-shadow rounded-2xl border border-slate-100 bg-white p-8">
            <h2 className="font-display text-xl font-bold">Admission Requirements</h2>
            <ul className="mt-4 space-y-3">
              {[
                "Completed application form",
                "Birth certificate or age declaration",
                "Previous school report card (transfer students)",
                "Two recent passport photographs",
                "Medical fitness certificate",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="card-shadow rounded-2xl border border-slate-100 bg-white p-8">
            <h2 className="font-display text-xl font-bold">Classes Available</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {["Nursery", "Primary 1–6", "JSS 1–3", "SS 1–3 (Science, Arts, Commercial)"].map((c) => (
                <div key={c} className="rounded-xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">{c}</div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="card-shadow rounded-2xl border border-blue-100 bg-blue-50 p-6">
            <h3 className="font-display font-bold text-slate-900">Apply Now</h3>
            <p className="mt-2 text-sm text-slate-600">Contact our admissions office to begin your application.</p>
            <p className="mt-4 text-sm"><strong>Phone:</strong> {SCHOOL.phone}</p>
            <p className="text-sm"><strong>Email:</strong> {SCHOOL.email}</p>
            <Link href="/contact" className="mt-4 block rounded-xl bg-blue-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">
              Contact Admissions
            </Link>
          </div>
          <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
            <h3 className="font-display font-bold text-slate-900">Entrance Exam</h3>
            <p className="mt-2 text-sm text-slate-600">Dates will be communicated after application submission. Prep classes available for JSS and SS entrants.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
