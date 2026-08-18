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
  BookOpen,
  StickyNote,
  MessageSquare,
  Calendar,
  Award,
  LogOut,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import type { NavItem, UserRole } from "@m-scholar/shared";
import { ROLE_LABELS } from "@m-scholar/shared";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import { NotificationBell } from "@/components/notification-bell";
import { useAuthReady } from "@/hooks/use-auth-ready";

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
  BookOpen,
  StickyNote,
  MessageSquare,
  Calendar,
  Award,
};

const ACCENT_STYLES: Record<UserRole, { sidebar: string; badge: string; active: string }> = {
  super_admin: {
    sidebar: "from-violet-600 to-violet-800",
    badge: "bg-violet-100 text-violet-700",
    active: "bg-violet-50 text-violet-700 border-violet-200",
  },
  account_officer: {
    sidebar: "from-emerald-600 to-emerald-800",
    badge: "bg-emerald-100 text-emerald-700",
    active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  class_teacher: {
    sidebar: "from-amber-500 to-amber-700",
    badge: "bg-amber-100 text-amber-800",
    active: "bg-amber-50 text-amber-800 border-amber-200",
  },
  parent: {
    sidebar: "from-sky-500 to-sky-700",
    badge: "bg-sky-100 text-sky-700",
    active: "bg-sky-50 text-sky-700 border-sky-200",
  },
  student: {
    sidebar: "from-sky-500 to-sky-700",
    badge: "bg-sky-100 text-sky-700",
    active: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

interface PortalShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
  title: string;
}

export function PortalShell({ navItems, children, title }: PortalShellProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const ready = useAuthReady();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = (pathname ?? "").replace(/\/$/, "") || "/";

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const accent = ACCENT_STYLES[user.role] ?? ACCENT_STYLES.parent;

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 flex-col lg:flex">
        <div className={cn("gradient-brand bg-gradient-to-b p-6 text-white", accent.sidebar)}>
            <Link href="/" className="block">
              <span className="font-display text-xl font-extrabold tracking-tight">
                Portal
              </span>
            </Link>
            <Link href="/" className="mt-1 block text-xs text-white/70 hover:text-white">
              ← School website
            </Link>
          <p className="mt-1 text-sm text-white/80">{title}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 border-r border-slate-200 bg-white p-4">
          {navItems.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = current === item.href.replace(/\/$/, "");
            return (
              <a
                key={item.href}
                href={item.href.endsWith("/") ? item.href : `${item.href}/`}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50",
                  active && accent.active
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-r border-t border-slate-200 bg-white p-4">
          <div className="mb-3 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </p>
            <span className={cn("mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium", accent.badge)}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
          <button
            onClick={() => {
              logout();
              window.location.href = "/login/";
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-slate-100">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-display font-bold text-slate-900">M-Scholar</span>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", accent.badge)}>
              {ROLE_LABELS[user.role]}
            </span>
          </div>
        </header>

        <header className="hidden items-center justify-end gap-3 border-b border-slate-200 bg-white px-8 py-3 lg:flex">
          <NotificationBell />
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-xl">
              <div className="flex items-center justify-between p-4">
                <span className="font-display font-bold">Menu</span>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const Icon = ICONS[item.icon] ?? LayoutDashboard;
                  return (
                    <a
                      key={item.href}
                      href={item.href.endsWith("/") ? item.href : `${item.href}/`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </a>
                  );
                })}
              </nav>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
