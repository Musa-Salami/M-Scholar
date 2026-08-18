"use client";

import Link from "next/link";
import { ShieldCheck, Wallet, ArrowLeft } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/login/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to School Portal
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold text-slate-900">Staff sign in</h1>
        <p className="mt-2 text-slate-500">Choose Admin or Finance Officer</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href={LOGIN_PORTALS.admin.href}
            className="card-shadow rounded-2xl border-2 border-violet-200 bg-white p-8 transition hover:-translate-y-1 hover:border-violet-400 hover:bg-violet-50"
          >
            <ShieldCheck className="h-10 w-10 text-violet-700" />
            <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{LOGIN_PORTALS.admin.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{LOGIN_PORTALS.admin.description}</p>
          </Link>
          <Link
            href={LOGIN_PORTALS.finance.href}
            className="card-shadow rounded-2xl border-2 border-emerald-200 bg-white p-8 transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-emerald-50"
          >
            <Wallet className="h-10 w-10 text-emerald-700" />
            <h2 className="mt-4 font-display text-xl font-bold text-slate-900">{LOGIN_PORTALS.finance.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{LOGIN_PORTALS.finance.description}</p>
          </Link>
        </div>
        <Link href="/" className="mt-10 inline-block text-sm text-slate-500 hover:text-slate-800">
          ← {SCHOOL.shortName}
        </Link>
      </div>
    </div>
  );
}
