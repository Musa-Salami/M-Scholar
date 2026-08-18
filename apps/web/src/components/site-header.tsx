"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, ChevronDown, LogIn } from "lucide-react";
import { PUBLIC_NAV, SCHOOL, LOGIN_PORTALS } from "@m-scholar/shared";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const { isAuthenticated, user, dashboardPath, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-display text-lg font-bold text-white">
            M
          </div>
          <div className="hidden sm:block">
            <p className="font-display text-sm font-bold leading-tight text-slate-900">{SCHOOL.shortName}</p>
            <p className="text-[10px] text-slate-500">{SCHOOL.motto}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                (pathname ?? "").replace(/\/$/, "") === href || (href === "/" && (pathname === "/" || pathname === "")) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href={dashboardPath()}
                className="hidden rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:inline-flex"
              >
                My Portal
              </Link>
              <button
                onClick={() => { logout(); window.location.href = "/"; }}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setLoginOpen(!loginOpen)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <LogIn className="h-4 w-4" />
                Login
                <ChevronDown className="h-4 w-4" />
              </button>
              {loginOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLoginOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                    <Link href="/login/student" className="block px-4 py-2.5 text-sm hover:bg-sky-50" onClick={() => setLoginOpen(false)}>
                      {LOGIN_PORTALS.student.title}
                    </Link>
                    <Link href="/login/teacher" className="block px-4 py-2.5 text-sm hover:bg-amber-50" onClick={() => setLoginOpen(false)}>
                      {LOGIN_PORTALS.teacher.title}
                    </Link>
                    <Link href="/login/parent" className="block px-4 py-2.5 text-sm hover:bg-emerald-50" onClick={() => setLoginOpen(false)}>
                      {LOGIN_PORTALS.parent.title}
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

          <button className="rounded-lg p-2 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-display font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col p-4">
              {PUBLIC_NAV.map(({ label, href }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {label}
                </Link>
              ))}
              <div className="my-3 border-t" />
              <Link href="/login/student" className="rounded-lg px-3 py-3 text-sm font-medium text-sky-700">Student Login</Link>
              <Link href="/login/teacher" className="rounded-lg px-3 py-3 text-sm font-medium text-amber-700">Teacher Login</Link>
              <Link href="/login/parent" className="rounded-lg px-3 py-3 text-sm font-medium text-emerald-700">Parent Login</Link>
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
