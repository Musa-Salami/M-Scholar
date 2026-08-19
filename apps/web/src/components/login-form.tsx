"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { DEMO_USERS, ROLE_DASHBOARD_PATH, SCHOOL, LOGIN_PORTALS, type LoginPortal, type UserRole } from "@m-scholar/shared";
import { BrandLogo } from "@/components/brand-logo";
import { cn } from "@/lib/utils";
import { pageHref } from "@/lib/paths";

const ACCENT: Record<LoginPortal, { badge: string }> = {
  family: { badge: "bg-sky-100 text-sky-800" },
  teacher: { badge: "bg-amber-100 text-amber-900" },
  admin: { badge: "bg-violet-100 text-violet-800" },
  finance: { badge: "bg-emerald-100 text-emerald-800" },
};

interface LoginFormProps {
  portal: LoginPortal;
}

export function LoginForm({ portal }: LoginFormProps) {
  const ready = useAuthReady();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const config = LOGIN_PORTALS[portal];
  const accent = ACCENT[portal];
  const allowedRoles = config.roles as UserRole[];
  const phoneLogin = portal === "family";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && user && allowedRoles.includes(user.role)) {
      const path = ROLE_DASHBOARD_PATH[user.role];
      window.location.replace(pageHref(path));
    }
  }, [ready, isAuthenticated, user, allowedRoles]);

  const demoAccounts = Object.entries(DEMO_USERS).filter(([, { user: u }]) =>
    allowedRoles.includes(u.role)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setError("");
    setLoading(true);
    const result = login(identifier, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? (phoneLogin ? "Invalid phone number or password." : "Invalid email or password."));
      return;
    }
    const loggedInUser = useAuthStore.getState().user;
    if (!loggedInUser || !allowedRoles.includes(loggedInUser.role)) {
      useAuthStore.getState().logout();
      setError(`This account cannot access the ${config.title.toLowerCase()}.`);
      return;
    }
    const path = ROLE_DASHBOARD_PATH[loggedInUser.role];
    window.location.assign(pageHref(path));
  };

  const IdentifierIcon = phoneLogin ? Phone : Mail;

  return (
    <div className="flex min-h-screen bg-cream">
      <div className="hidden w-1/2 flex-col justify-between gradient-brand p-12 text-white lg:flex">
        <div>
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandLogo size={72} className="h-16 w-16 border-2 border-gold/70" />
            <span className="font-display text-xl font-semibold">{SCHOOL.shortName}</span>
          </Link>
          <div className="mt-4 h-0.5 w-24 bg-gold" />
          <h1 className="mt-16 font-display text-4xl font-semibold leading-tight">{config.title}</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">{config.description}</p>
        </div>
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-gold hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to school website
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-brand lg:hidden">
            <BrandLogo size={36} className="h-9 w-9" />
            Back to website
          </Link>
          <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-xs font-medium", accent.badge)}>
            {config.title}
          </span>
          <h2 className="mt-3 font-display text-2xl font-semibold text-brand">{config.title}</h2>
          <p className="mt-1 text-muted">
            {phoneLogin ? "Sign in with your phone number and password" : "Sign in with your email and password"}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">
                {phoneLogin ? "Phone number" : "Email"}
              </label>
              <div className="relative">
                <IdentifierIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type={phoneLogin ? "tel" : "email"}
                  inputMode={phoneLogin ? "tel" : "email"}
                  autoComplete={phoneLogin ? "tel" : "username"}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder={phoneLogin ? "0801 234 5678" : "you@school.edu"}
                  className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-gold"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" aria-label={showPassword ? "Hide password" : "Show password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={loading || !ready} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
              {loading || !ready ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {demoAccounts.length > 0 && (
            <div className="mt-8 rounded-2xl border border-border bg-white p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Demo accounts</p>
              {demoAccounts.map(([demoEmail, { password: demoPass, user: u }]) => {
                const demoId = phoneLogin ? u.phone || demoEmail : demoEmail;
                return (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => {
                      setIdentifier(demoId);
                      setPassword(demoPass);
                    }}
                    className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-cream"
                  >
                    <span className="font-medium text-brand">{u.firstName} {u.lastName}</span>
                    <span className="text-xs text-muted">{demoId}</span>
                  </button>
                );
              })}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted">
            Wrong portal?{" "}
            <Link href="/login/" className="font-medium text-brand hover:underline">Back to School Portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
