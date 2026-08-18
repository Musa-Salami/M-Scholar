"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, Users, ArrowLeft } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";

const ICONS = {
  student: GraduationCap,
  teacher: BookOpen,
  parent: Users,
} as const;

const COLORS = {
  student: "border-sky-200 hover:border-sky-400 hover:bg-sky-50",
  teacher: "border-amber-200 hover:border-amber-400 hover:bg-amber-50",
  parent: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50",
} as const;

export default function LoginChooserPage() {
  const portals = ["student", "teacher", "parent"] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to {SCHOOL.shortName}
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold text-slate-900 md:text-4xl">School Portal Login</h1>
        <p className="mt-2 text-slate-500">Select your account type to sign in</p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {portals.map((key) => {
            const portal = LOGIN_PORTALS[key];
            const Icon = ICONS[key];
            return (
              <Link
                key={key}
                href={portal.href}
                className={`card-shadow rounded-2xl border-2 bg-white p-8 transition hover:-translate-y-1 ${COLORS[key]}`}
              >
                <Icon className="h-10 w-10 text-slate-700" />
                <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{portal.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{portal.description}</p>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
