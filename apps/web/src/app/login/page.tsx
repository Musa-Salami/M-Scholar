"use client";

import Link from "next/link";
import { GraduationCap, BookOpen, ArrowLeft } from "lucide-react";
import { SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";
import { BrandLogo } from "@/components/brand-logo";
import { pageHref } from "@/lib/paths";

const PUBLIC_PORTALS = [
  { key: "family" as const, icon: GraduationCap },
  { key: "teacher" as const, icon: BookOpen },
];

export default function LoginChooserPage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="gold-rule" />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-brand">
          <ArrowLeft className="h-4 w-4" /> Back to {SCHOOL.shortName}
        </Link>
        <div className="mt-8 flex items-center gap-4">
          <BrandLogo size={64} />
          <div>
            <h1 className="font-display text-3xl font-semibold text-brand md:text-4xl">School Portal</h1>
            <p className="mt-1 text-muted">Parents, students, and teachers — choose your portal to sign in</p>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {PUBLIC_PORTALS.map(({ key, icon: Icon }) => {
            const portal = LOGIN_PORTALS[key];
            return (
              <Link
                key={key}
                href={pageHref(portal.href)}
                className="card-shadow rounded-2xl border-2 border-transparent bg-white p-8"
              >
                <Icon className="h-10 w-10 text-brand" />
                <h2 className="mt-4 font-display text-xl font-semibold text-brand">{portal.title}</h2>
                <p className="mt-2 text-sm text-muted">{portal.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
