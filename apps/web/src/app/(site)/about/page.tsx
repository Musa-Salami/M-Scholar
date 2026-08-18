import Link from "next/link";
import { SCHOOL } from "@m-scholar/shared";
import { ArrowRight } from "lucide-react";
import { pageHref } from "@/lib/paths";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 md:px-6">
      <h1 className="font-display text-4xl font-bold text-slate-900">About Us</h1>
      <p className="mt-2 text-lg text-slate-500">{SCHOOL.motto}</p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 leading-relaxed">
            {SCHOOL.name} was established in {SCHOOL.founded} with a vision to provide accessible,
            high-quality education to children in Lagos and beyond. For over {SCHOOL.stats.years} years,
            we have nurtured thousands of students who have gone on to excel in universities and careers worldwide.
          </p>
          <h2 className="mt-8 font-display text-2xl font-bold text-slate-900">Our Mission</h2>
          <p className="text-slate-600 leading-relaxed">
            To develop well-rounded individuals through rigorous academics, character formation,
            and extracurricular enrichment in a safe, inclusive environment.
          </p>
          <h2 className="mt-8 font-display text-2xl font-bold text-slate-900">Our Vision</h2>
          <p className="text-slate-600 leading-relaxed">
            To be a leading educational institution recognised for academic excellence,
            innovation, and the holistic development of every child.
          </p>
        </div>
        <div className="space-y-4">
          {[
            { title: "Academic Excellence", desc: `${SCHOOL.stats.passRate} WAEC pass rate with distinguished performances.` },
            { title: "Experienced Faculty", desc: `${SCHOOL.stats.teachers} qualified and dedicated teachers.` },
            { title: "Modern Facilities", desc: "Well-equipped labs, library, sports fields, and ICT centre." },
            { title: "Parent Partnership", desc: "Active parent-teacher communication through our digital portal.", href: "/login/" },
          ].map(({ title, desc, href }) => (
            <div key={title} className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
              <h3 className="font-display font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-600">{desc}</p>
              {href && (
                <Link href={pageHref(href)} className="mt-2 inline-block text-sm font-semibold text-blue-600 hover:underline">
                  Open School Portal
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-blue-50 p-8 text-center">
        <p className="font-display text-xl font-bold text-slate-900">Ready to join us?</p>
        <Link href={pageHref("/admissions")} className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline">
          View admissions <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
