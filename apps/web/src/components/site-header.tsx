"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { PUBLIC_NAV, SCHOOL } from "@m-scholar/shared";
import { useAuthStore } from "@/lib/auth-store";
import { cn } from "@/lib/utils";
import { pageHref } from "@/lib/paths";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, dashboardPath, logout } = useAuthStore();
  const portalHref = pageHref(dashboardPath());

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
              href={pageHref(href)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                (pathname ?? "").replace(/\/$/, "") === href.replace(/\/$/, "") || (href === "/" && (pathname === "/" || pathname === "")) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <a
                href={portalHref}
                className="inline-flex items-center rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 sm:px-4"
              >
                My Portal
              </a>
              <button
                type="button"
                onClick={() => { logout(); window.location.href = "/"; }}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login/"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              School Portal
            </Link>
          )}

          <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setMobileOpen(true)}>
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
              <button type="button" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex flex-col p-4">
              {PUBLIC_NAV.map(({ label, href }) => (
                <Link key={href} href={pageHref(href)} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  {label}
                </Link>
              ))}
              <div className="my-3 border-t" />
              {isAuthenticated && user ? (
                <>
                  <a href={portalHref} className="rounded-lg px-3 py-3 text-sm font-medium text-blue-700" onClick={() => setMobileOpen(false)}>
                    My Portal
                  </a>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700"
                    onClick={() => { setMobileOpen(false); logout(); window.location.href = "/"; }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login/" className="rounded-lg px-3 py-3 text-sm font-medium text-blue-700" onClick={() => setMobileOpen(false)}>
                  School Portal
                </Link>
              )}
            </nav>
          </aside>
        </div>
      )}
    </header>
  );
}
