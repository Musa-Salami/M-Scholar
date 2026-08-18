"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, Shield, Wallet, BookOpen, Users } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, dashboardPath } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(dashboardPath());
    }
  }, [isAuthenticated, dashboardPath, router]);

  const portals = [
    { icon: Shield, title: "Super Admin", desc: "Users, settings, classes", color: "text-violet-600 bg-violet-50" },
    { icon: Wallet, title: "Account Officer", desc: "Fees, income, payroll", color: "text-emerald-600 bg-emerald-50" },
    { icon: BookOpen, title: "Class Teacher", desc: "Attendance, results, notes", color: "text-amber-600 bg-amber-50" },
    { icon: Users, title: "Parent / Student", desc: "Fees, results, messages", color: "text-sky-600 bg-sky-50" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-2xl font-extrabold text-blue-600">M-Scholar</span>
        <Link
          href="/login"
          className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Sign in
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12 text-center">
        <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
          School management,{" "}
          <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            beautifully unified
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-500">
          Four role-based portals for administrators, finance officers, teachers, and parents —
          built for Nigerian primary and secondary schools.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700"
          >
            Get started <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="/M-SCHOLAR_COMPLETE_TECHNICAL_SPECIFICATION.txt"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-700 hover:bg-slate-50"
          >
            Technical spec
          </a>
        </div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {portals.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="card-shadow rounded-2xl border border-slate-100 bg-white p-6 text-left">
              <div className={`mb-4 inline-flex rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-display font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
