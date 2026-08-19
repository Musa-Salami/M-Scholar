"use client";

import { useState } from "react";
import { KeyRound, X } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

export function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const changePassword = useAuthStore((s) => s.changePassword);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (next !== confirm) {
      setError("New passwords do not match.");
      return;
    }
    const result = changePassword(current, next);
    if (!result.ok) {
      setError(result.error ?? "Could not change password.");
      return;
    }
    setSaved(true);
    setCurrent("");
    setNext("");
    setConfirm("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-brand">Change password</h3>
            <p className="mt-1 text-sm text-muted">Use at least 6 characters. Your login email or phone number stays the same.</p>
          </div>
          <button type="button" onClick={onClose} className="min-h-11 min-w-11 rounded-lg p-1 text-muted hover:bg-cream hover:text-brand" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Current password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            placeholder="New password"
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold"
          />
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Password updated. Use it the next time you sign in.</p>}
          <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark">
            <KeyRound className="h-4 w-4" /> Save new password
          </button>
        </form>
      </div>
    </div>
  );
}
