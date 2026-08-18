"use client";

import Link from "next/link";
import { ArrowRight, GraduationCap, Users, BookOpen, Award } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";

const PORTAL_CARDS = [
  { key: "student" as const, icon: GraduationCap, color: "border-sky-200 bg-sky-50 hover:border-sky-400" },
  { key: "teacher" as const, icon: BookOpen, color: "border-amber-200 bg-amber-50 hover:border-amber-400" },
  { key: "parent" as const, icon: Users, color: "border-emerald-200 bg-emerald-50 hover:border-emerald-400" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-violet-900 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggIGQ9Ik0zNiAzNGg2djZoLTZ6bTAgMGg2djZoLTZ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:px-6 md:py-32">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-200">Welcome to</p>
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight md:text-6xl">
            {SCHOOL.name}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-blue-100">{SCHOOL.motto} — {SCHOOL.tagline}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/admissions" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-blue-800 hover:bg-blue-50">
              Apply for Admission <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/about" className="inline-flex items-center rounded-xl border border-white/30 px-6 py-3.5 font-semibold text-white hover:bg-white/10">
              Learn About Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-slate-200 md:grid-cols-4">
          {[
            { label: "Students", value: SCHOOL.stats.students },
            { label: "Teachers", value: SCHOOL.stats.teachers },
            { label: "Years of Excellence", value: SCHOOL.stats.years },
            { label: "WAEC Pass Rate", value: SCHOOL.stats.passRate },
          ].map(({ label, value }) => (
            <div key={label} className="px-6 py-8 text-center">
              <p className="font-display text-3xl font-bold text-blue-700">{value}</p>
              <p className="mt-1 text-sm text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portal login cards */}
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">School Portal</h2>
            <p className="mt-2 text-slate-500">Students, teachers, and parents — sign in to your portal</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PORTAL_CARDS.map(({ key, icon: Icon, color }) => {
              const portal = LOGIN_PORTALS[key];
              return (
                <Link
                  key={key}
                  href={portal.href}
                  className={`card-shadow rounded-2xl border-2 p-8 transition hover:-translate-y-1 ${color}`}
                >
                  <Icon className="h-10 w-10 text-slate-700" />
                  <h3 className="mt-4 font-display text-xl font-bold text-slate-900">{portal.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{portal.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-700">
                    Sign in <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* About preview */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 md:grid-cols-2 md:px-6">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900">A school built on excellence</h2>
            <p className="mt-4 text-slate-600 leading-relaxed">
              Founded in {SCHOOL.founded}, {SCHOOL.name} provides quality primary and secondary education
              in a nurturing environment. Our dedicated teachers, modern facilities, and strong parent
              partnership help every child reach their full potential.
            </p>
            <Link href="/about" className="mt-6 inline-flex items-center gap-2 font-semibold text-blue-600 hover:underline">
              Read our story <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["Modern Library", "Science Labs", "Sports Complex", "ICT Centre"].map((item) => (
              <div key={item} className="card-shadow flex aspect-square items-end rounded-2xl bg-gradient-to-br from-blue-100 to-violet-100 p-5">
                <p className="font-semibold text-slate-800">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="mx-auto max-w-6xl px-4 text-center md:px-6">
          <Award className="mx-auto h-12 w-12 text-blue-200" />
          <h2 className="mt-4 font-display text-3xl font-bold">Admissions Open for 2025/2026</h2>
          <p className="mx-auto mt-2 max-w-lg text-blue-100">Join our community of learners. Applications are now being accepted for all classes.</p>
          <Link href="/admissions" className="mt-8 inline-flex rounded-xl bg-white px-8 py-3.5 font-semibold text-blue-700 hover:bg-blue-50">
            Start Application
          </Link>
        </div>
      </section>
    </>
  );
}
