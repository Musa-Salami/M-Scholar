"use client";

import Link from "next/link";
import { ShieldCheck, Wallet, ArrowLeft } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";
import { BrandLogo } from "@/components/brand-logo";
import { pageHref } from "@/lib/paths";

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="gold-rule" />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Link href="/login/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to School Portal
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <BrandLogo size={64} />
          <div>
            <h1 className="font-display text-3xl font-semibold text-brand">Staff sign in</h1>
            <p className="mt-1 text-muted">Choose Admin or Finance Officer</p>
          </div>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Link
            href={pageHref(LOGIN_PORTALS.admin.href)}
            className="card-shadow rounded-2xl border-2 border-transparent bg-white p-8"
          >
            <ShieldCheck className="h-10 w-10 text-brand" />
            <h2 className="mt-4 font-display text-xl font-semibold text-brand">{LOGIN_PORTALS.admin.title}</h2>
            <p className="mt-2 text-sm text-muted">{LOGIN_PORTALS.admin.description}</p>
          </Link>
          <Link
            href={pageHref(LOGIN_PORTALS.finance.href)}
            className="card-shadow rounded-2xl border-2 border-transparent bg-white p-8"
          >
            <Wallet className="h-10 w-10 text-brand" />
            <h2 className="mt-4 font-display text-xl font-semibold text-brand">{LOGIN_PORTALS.finance.title}</h2>
            <p className="mt-2 text-sm text-muted">{LOGIN_PORTALS.finance.description}</p>
          </Link>
        </div>
        <Link href="/" className="mt-10 inline-flex min-h-11 items-center text-sm text-muted hover:text-brand">
          ← {SCHOOL.shortName}
        </Link>
      </div>
    </div>
  );
}
