"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, ArrowLeft } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { DEMO_USERS, ROLE_DASHBOARD_PATH, SCHOOL, LOGIN_PORTALS, type LoginPortal, type UserRole } from "@m-scholar/shared";
import { cn } from "@/lib/utils";

const ACCENT: Record<LoginPortal, { btn: string; ring: string; bg: string }> = {
  student: { btn: "bg-sky-600 hover:bg-sky-700", ring: "focus:ring-sky-500", bg: "from-sky-600 to-sky-800" },
  teacher: { btn: "bg-amber-600 hover:bg-amber-700", ring: "focus:ring-amber-500", bg: "from-amber-500 to-amber-700" },
  parent: { btn: "bg-emerald-600 hover:bg-emerald-700", ring: "focus:ring-emerald-500", bg: "from-emerald-600 to-emerald-800" },
  staff: { btn: "bg-violet-600 hover:bg-violet-700", ring: "focus:ring-violet-500", bg: "from-violet-600 to-violet-800" },
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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (isAuthenticated && user && allowedRoles.includes(user.role)) {
      const path = ROLE_DASHBOARD_PATH[user.role];
      window.location.replace(path.endsWith("/") ? path : `${path}/`);
    }
  }, [ready, isAuthenticated, user, allowedRoles]);

  const demoAccounts = Object.entries(DEMO_USERS).filter(([, { user: u }]) =>
    allowedRoles.includes(u.role)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Invalid email or password.");
      return;
    }
    const loggedInUser = useAuthStore.getState().user;
    if (!loggedInUser || !allowedRoles.includes(loggedInUser.role)) {
      useAuthStore.getState().logout();
      setError(`This account cannot access the ${config.title.toLowerCase()}.`);
      return;
    }
    const path = ROLE_DASHBOARD_PATH[loggedInUser.role];
    window.location.assign(path.endsWith("/") ? path : `${path}/`);
  };

  return (
    <div className="flex min-h-screen">
      <div className={cn("hidden w-1/2 flex-col justify-between bg-gradient-to-br p-12 text-white lg:flex", accent.bg)}>
        <div>
          <Link href="/" className="font-display text-2xl font-extrabold">{SCHOOL.shortName}</Link>
          <h1 className="mt-16 font-display text-4xl font-bold leading-tight">{config.title}</h1>
          <p className="mt-4 max-w-md text-lg text-white/80">{config.description}</p>
        </div>
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to school website
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <h2 className="font-display text-2xl font-bold text-slate-900">{config.title}</h2>
          <p className="mt-1 text-slate-500">Sign in with your school credentials</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email or ID</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className={cn("w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-2", accent.ring)} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className={cn("w-full rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-sm outline-none focus:ring-2", accent.ring)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
            <button type="submit" disabled={loading} className={cn("flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60", accent.btn)}>
              {loading ? "Signing in…" : "Sign in"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {demoAccounts.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Demo account</p>
              {demoAccounts.map(([demoEmail, { password: demoPass, user: u }]) => (
                <button key={demoEmail} type="button" onClick={() => { setEmail(demoEmail); setPassword(demoPass); }}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm hover:bg-slate-100">
                  <span className="font-medium">{u.firstName} {u.lastName}</span>
                  <span className="text-xs text-slate-400">{demoEmail}</span>
                </button>
              ))}
            </div>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Wrong portal?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">Choose another login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
