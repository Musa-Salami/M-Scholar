"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X, LayoutDashboard } from "lucide-react";
import { PUBLIC_NAV, SCHOOL } from "@m-scholar/shared";
import { useAuthStore } from "@/lib/auth-store";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { pageHref } from "@/lib/paths";

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, dashboardPath, logout } = useAuthStore();
  const portalHref = pageHref(dashboardPath());

  return (
    <header className="sticky top-0 z-40 border-b border-brand/10 bg-white/95 backdrop-blur-md">
      <div className="gold-rule" />
      <div className="mx-auto flex min-w-0 max-w-6xl items-center justify-between gap-2 px-3 py-3 sm:px-4 sm:py-3.5 md:px-6">
        <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5 sm:gap-3.5">
          <BrandLogo size={96} className="h-16 w-16 shrink-0 sm:h-20 sm:w-20 md:h-24 md:w-24" />
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold leading-tight text-brand sm:text-base md:text-lg">{SCHOOL.shortName}</p>
            <p className="mt-0.5 hidden max-w-[18rem] truncate text-xs leading-snug text-muted sm:block md:max-w-[22rem] md:text-sm">{SCHOOL.motto}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map(({ label, href }) => (
            <Link
              key={href}
              href={pageHref(href)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                (pathname ?? "").replace(/\/$/, "") === href.replace(/\/$/, "") || (href === "/" && (pathname === "/" || pathname === ""))
                  ? "bg-cream text-brand"
                  : "text-ink/70 hover:bg-cream hover:text-brand"
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
                className="inline-flex min-h-11 items-center rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:px-4"
              >
                My Portal
              </a>
              <button
                type="button"
                onClick={() => {
                  logout();
                  window.location.href = "/";
                }}
                className="min-h-11 text-sm text-muted hover:text-ink"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login/"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark sm:px-4 sm:py-2.5"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="sm:hidden">Portal</span>
              <span className="hidden sm:inline">School Portal</span>
            </Link>
          )}

          <button type="button" className="min-h-11 min-w-11 shrink-0 rounded-lg p-2 lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-[min(18rem,92vw)] flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <span className="font-display font-bold text-brand">Menu</span>
              <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4">
              {PUBLIC_NAV.map(({ label, href }) => (
                <Link key={href} href={pageHref(href)} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-ink hover:bg-cream">
                  {label}
                </Link>
              ))}
              <div className="my-3 border-t" />
              {isAuthenticated && user ? (
                <>
                  <a href={portalHref} className="rounded-lg px-3 py-3 text-sm font-medium text-brand" onClick={() => setMobileOpen(false)}>
                    My Portal
                  </a>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-3 text-left text-sm font-medium text-ink"
                    onClick={() => {
                      setMobileOpen(false);
                      logout();
                      window.location.href = "/";
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <Link href="/login/" className="rounded-lg px-3 py-3 text-sm font-medium text-brand" onClick={() => setMobileOpen(false)}>
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
