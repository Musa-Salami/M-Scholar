"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { DEMO_USERS, ROLE_DASHBOARD_PATH, ROLE_LABELS } from "@m-scholar/shared";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, user, dashboardPath } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_DASHBOARD_PATH[user.role]);
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = login(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      return;
    }
    router.push(dashboardPath());
  };

  const demoAccounts = Object.entries(DEMO_USERS).map(([email, { user }]) => ({
    email,
    role: ROLE_LABELS[user.role],
  }));

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-gradient-to-br from-blue-600 via-violet-600 to-violet-800 p-12 text-white lg:flex">
        <div>
          <Link href="/" className="font-display text-2xl font-extrabold">
            M-Scholar
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 font-display text-4xl font-bold leading-tight"
          >
            Manage your school<br />with confidence
          </motion.h1>
          <p className="mt-4 max-w-md text-lg text-white/80">
            One platform for administrators, finance, teachers, and parents —
            attendance, fees, assessments, and communication.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {["Super Admin", "Account Officer", "Class Teacher", "Parent Portal"].map((label) => (
            <div key={label} className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="font-display text-xl font-extrabold text-blue-600">
              M-Scholar
            </Link>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-1 text-slate-500">Sign in to your portal</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@school.edu"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none ring-blue-500 transition focus:ring-2"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm outline-none ring-blue-500 transition focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Demo accounts
            </p>
            <div className="space-y-2">
              {demoAccounts.map(({ email, role }) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => {
                    setEmail(email);
                    setPassword(DEMO_USERS[email].password);
                  }}
                  className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-left text-sm hover:bg-blue-50"
                >
                  <span className="font-medium text-slate-700">{role}</span>
                  <span className="text-xs text-slate-400">{email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
