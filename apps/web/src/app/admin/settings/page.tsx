"use client";

import { useState } from "react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AdminSettingsPage() {
  useRequireAuth(["super_admin"]);
  const [settings, setSettings] = useState({
    schoolName: "M-Scholar Demo Academy",
    motto: "Excellence Through Knowledge",
    address: "12 Education Road, Lagos, Nigeria",
    phone: "+234 801 234 5678",
    email: "info@mscholar.app",
    session: "2025/2026",
    term: "First Term",
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Settings saved (demo mode — will persist to database in Phase 2).");
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="School Settings"
        description="Configure school profile, academic session, and term."
      />

      <form onSubmit={handleSave} className="card-shadow max-w-2xl rounded-2xl border border-slate-100 bg-white p-6">
        <div className="space-y-5">
          {[
            { key: "schoolName", label: "School name" },
            { key: "motto", label: "Motto" },
            { key: "address", label: "Address" },
            { key: "phone", label: "Phone" },
            { key: "email", label: "Contact email" },
            { key: "session", label: "Academic session" },
            { key: "term", label: "Current term" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
              <input
                value={settings[key as keyof typeof settings]}
                onChange={(e) => setSettings({ ...settings, [key]: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="mt-6 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          Save settings
        </button>
      </form>
    </PortalShell>
  );
}
