"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  GraduationCap,
  UserCheck,
  ScrollText,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileBarChart,
  ClipboardCheck,
  ClipboardList,
  BookOpen,
  StickyNote,
  MessageSquare,
  Calendar,
  Award,
  LogOut,
  KeyRound,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { NavItem, UserRole } from "@m-scholar/shared";
import { ROLE_LABELS, SCHOOL } from "@m-scholar/shared";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { NotificationBell } from "@/components/notification-bell";
import { ChangePasswordModal } from "@/components/change-password-modal";
import { BrandLogo } from "@/components/brand-logo";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { pageHref } from "@/lib/paths";

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Users,
  Settings,
  GraduationCap,
  UserCheck,
  ScrollText,
  Receipt,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Wallet,
  FileBarChart,
  ClipboardCheck,
  ClipboardList,
  BookOpen,
  StickyNote,
  MessageSquare,
  Calendar,
  Award,
};

const ACCENT_STYLES: Record<UserRole, { badge: string; active: string }> = {
  super_admin: {
    badge: "bg-violet-100 text-violet-800",
    active: "bg-cream text-brand border-gold/40",
  },
  account_officer: {
    badge: "bg-emerald-100 text-emerald-800",
    active: "bg-cream text-brand border-gold/40",
  },
  class_teacher: {
    badge: "bg-amber-100 text-amber-900",
    active: "bg-cream text-brand border-gold/40",
  },
  parent: {
    badge: "bg-sky-100 text-sky-800",
    active: "bg-cream text-brand border-gold/40",
  },
  student: {
    badge: "bg-sky-100 text-sky-800",
    active: "bg-cream text-brand border-gold/40",
  },
};

interface PortalShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
  title: string;
}

function SidebarBrand({ title }: { title: string }) {
  return (
    <div className="gradient-brand p-5 text-white">
      <Link href="/" className="flex items-center gap-3">
        <BrandLogo size={48} className="h-12 w-12 border-2 border-gold/70 shadow-sm" />
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold leading-tight">{SCHOOL.shortName}</p>
          <p className="mt-0.5 text-xs text-white/70">{title}</p>
        </div>
      </Link>
      <Link href="/" className="mt-3 inline-flex min-h-11 items-center text-xs font-medium text-gold hover:text-white">
        ← School website
      </Link>
    </div>
  );
}

export function PortalShell({ navItems, children, title }: PortalShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ready = useAuthReady();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const current = (pathname ?? "").replace(/\/$/, "") || "/";

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const accent = ACCENT_STYLES[user.role] ?? ACCENT_STYLES.parent;

  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden w-64 flex-col lg:flex">
        <SidebarBrand title={title} />
        <div className="gold-rule" />
        <nav className="flex flex-1 flex-col gap-1 border-r border-border bg-white p-3">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = current === item.href.replace(/\/$/, "");
            return (
              <a
                key={item.href}
                href={pageHref(item.href)}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:bg-cream hover:text-brand",
                  active && accent.active
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-r border-t border-border bg-white p-4">
          <div className="mb-3 rounded-xl border border-border bg-cream p-3">
            <p className="text-sm font-semibold text-brand">
              {user.firstName} {user.lastName}
            </p>
            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", accent.badge)}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPasswordOpen(true)}
            className="mb-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-cream hover:text-brand"
          >
            <KeyRound className="h-4 w-4" />
            Change password
          </button>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login/";
            }}
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-muted hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-white px-3 py-2 lg:hidden">
          <button type="button" onClick={() => setMobileOpen(true)} className="min-h-11 min-w-11 rounded-lg p-2 hover:bg-cream" aria-label="Open menu">
            <Menu className="h-5 w-5 text-brand" />
          </button>
          <Link href="/" className="flex min-w-0 items-center gap-2">
            <BrandLogo size={36} className="h-9 w-9" />
            <span className="truncate font-display text-sm font-semibold text-brand">{SCHOOL.shortName}</span>
          </Link>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className={cn("hidden rounded-full px-2 py-0.5 text-xs font-medium sm:inline", accent.badge)}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </header>

        <header className="hidden items-center justify-between border-b border-border bg-white px-8 py-3 lg:flex">
          <p className="text-sm text-muted">{title}</p>
          <NotificationBell />
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-brand/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
              <SidebarBrand title={title} />
              <div className="gold-rule" />
              <div className="flex items-center justify-between border-b border-border px-4 py-2">
                <span className="font-display text-sm font-semibold text-brand">Menu</span>
                <button type="button" onClick={() => setMobileOpen(false)} className="min-h-11 min-w-11" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto p-3">
                {navItems.map((item) => {
                  const Icon = ICONS[item.icon] ?? LayoutDashboard;
                  const active = current === item.href.replace(/\/$/, "");
                  return (
                    <a
                      key={item.href}
                      href={pageHref(item.href)}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex min-h-11 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-muted hover:bg-cream",
                        active && accent.active
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  );
                })}
                <Link href="/" className="mt-3 flex min-h-11 items-center rounded-xl px-3 py-2 text-sm font-medium text-muted hover:bg-cream">
                  School website
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setPasswordOpen(true);
                  }}
                  className="flex min-h-11 items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-muted hover:bg-cream"
                >
                  Change password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    window.location.href = "/login/";
                  }}
                  className="flex min-h-11 items-center rounded-xl px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sign out
                </button>
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
      {passwordOpen && <ChangePasswordModal onClose={() => setPasswordOpen(false)} />}
    </div>
  );
}
