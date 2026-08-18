"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, ShieldCheck, Wallet, ArrowLeft } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";

const PUBLIC_PORTALS = [
  { key: "family" as const, icon: GraduationCap, color: "border-sky-200 hover:border-sky-400 hover:bg-sky-50" },
  { key: "teacher" as const, icon: BookOpen, color: "border-amber-200 hover:border-amber-400 hover:bg-amber-50" },
];

const STAFF_PORTALS = [
  { key: "admin" as const, icon: ShieldCheck, color: "border-violet-200 hover:border-violet-400 hover:bg-violet-50" },
  { key: "finance" as const, icon: Wallet, color: "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50" },
];

export default function LoginChooserPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to {SCHOOL.shortName}
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold text-slate-900 md:text-4xl">School Portal</h1>
        <p className="mt-2 text-slate-500">Choose your portal to sign in</p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PUBLIC_PORTALS.map(({ key, icon: Icon, color }) => {
            const portal = LOGIN_PORTALS[key];
            return (
              <Link
                key={key}
                href={portal.href}
                className={`card-shadow rounded-2xl border-2 bg-white p-8 transition hover:-translate-y-1 ${color}`}
              >
                <Icon className="h-10 w-10 text-slate-700" />
                <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{portal.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{portal.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {STAFF_PORTALS.map(({ key, icon: Icon, color }) => {
            const portal = LOGIN_PORTALS[key];
            return (
              <Link
                key={key}
                href={portal.href}
                className={`card-shadow rounded-2xl border-2 bg-white p-8 transition hover:-translate-y-1 ${color}`}
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
