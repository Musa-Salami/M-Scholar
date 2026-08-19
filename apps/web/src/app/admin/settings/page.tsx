"use client";

import { useEffect, useState } from "react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolStore, type SchoolSettings } from "@/lib/school-store";

export default function AdminSettingsPage() {
  const { ready } = useRequireAuth(["super_admin"]);
  const settings = useSchoolStore((s) => s.settings);
  const updateSettings = useSchoolStore((s) => s.updateSettings);
  const [form, setForm] = useState<SchoolSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="School Settings"
        description="These details are stored with your school records and used across portals."
      />

      <form onSubmit={handleSave} className="card-shadow max-w-2xl rounded-2xl border border-slate-100 bg-white p-6">
        <div className="space-y-5">
          {(
            [
              { key: "schoolName", label: "School name", type: "text" },
              { key: "motto", label: "Motto", type: "text" },
              { key: "address", label: "Address", type: "text" },
              { key: "phone", label: "Phone", type: "text" },
              { key: "email", label: "Contact email", type: "email" },
              { key: "principalName", label: "Principal's name", type: "text" },
              { key: "session", label: "Academic session", type: "text" },
              { key: "term", label: "Current term", type: "text" },
              { key: "nextTermResumptionDate", label: "Next term resumption date", type: "date" },
            ] as { key: keyof SchoolSettings; label: string; type: string }[]
          ).map(({ key, label, type }) => (
            <div key={key}>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
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
        {saved && <p className="mt-3 text-sm text-emerald-700">Settings saved to the protected records vault.</p>}
        <p className="mt-3 text-xs text-slate-500">Saved settings survive reload and stay aligned across admin, finance, and portals.</p>
      </form>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateSettings(form);
          setSaved(true);
          window.setTimeout(() => setSaved(false), 2500);
        }}
        className="card-shadow mt-6 max-w-2xl rounded-2xl border border-slate-100 bg-white p-6"
      >
        <h3 className="font-display font-semibold text-slate-900">Generic login passwords</h3>
        <p className="mt-1 text-sm text-slate-500">
          These passwords are suggested when you create a new user. You can still type a different password for each person. Share the login details with them after you create the profile.
        </p>
        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Default password for teachers and officers</label>
            <input
              type="text"
              value={form.defaultStaffPassword}
              onChange={(e) => setForm({ ...form, defaultStaffPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="mt-1 text-xs text-slate-500">Used with the user&apos;s email address.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Default password for parents and students</label>
            <input
              type="text"
              value={form.defaultFamilyPassword}
              onChange={(e) => setForm({ ...form, defaultFamilyPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="mt-1 text-xs text-slate-500">Used with the user&apos;s phone number.</p>
          </div>
        </div>
        <button type="submit" className="mt-6 rounded-xl bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
          Save login defaults
        </button>
      </form>
    </PortalShell>
  );
}
