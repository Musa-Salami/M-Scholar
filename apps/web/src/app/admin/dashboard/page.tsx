"use client";

import { useState } from "react";
import { Activity, Database, Download, GraduationCap, Shield, UserCheck, Users } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useDataModeStore } from "@/lib/bootstrap-data";

function formatSavedAt(value: string | null) {
  if (!value) return "Not saved yet";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function AdminDashboardPage() {
  const { ready } = useRequireAuth(["super_admin"]);
  const students = useFinanceStore((s) => s.students);
  const payments = useFinanceStore((s) => s.payments);
  const users = useSchoolStore((s) => s.users);
  const classes = useSchoolStore((s) => s.classes);
  const registers = useAcademicStore((s) => s.registers);
  const mode = useDataModeStore((s) => s.mode);
  const savedAt = useDataModeStore((s) => s.savedAt);
  const vaultHealthy = useDataModeStore((s) => s.vaultHealthy);
  const hasRealVault = useDataModeStore((s) => s.hasRealVault);
  const loadDemo = useDataModeStore((s) => s.loadDemo);
  const loadReal = useDataModeStore((s) => s.loadReal);
  const downloadBackup = useDataModeStore((s) => s.downloadBackup);
  const [notice, setNotice] = useState("");

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const staffCount = users.filter((u) => u.role !== "parent" && u.role !== "student").length;
  const latestPayment = [...payments].sort((a, b) => b.paidAt.localeCompare(a.paidAt))[0];
  const latestRegister = [...registers].sort((a, b) => b.date.localeCompare(a.date))[0];
  const parentLinked = students.find((s) => s.parentEmail === "parent@mscholar.app");

  const activity = [
    latestPayment
      ? `Fee payment recorded — ${latestPayment.receiptNo}`
      : "No fee payments recorded yet",
    latestRegister
      ? `${latestRegister.takenBy} submitted ${latestRegister.className} attendance`
      : "No attendance submitted yet",
    parentLinked
      ? `Parent account linked to ${parentLinked.name} (${parentLinked.admissionNo})`
      : "No parent–student link in current records",
  ];

  const handleLoadDemo = () => {
    const ok = window.confirm(
      "Switch to demo data? Saved real records stay in the protected vault and can be loaded again. Any edit while demo is showing will be saved as new real data."
    );
    if (!ok) return;
    loadDemo();
    setNotice("Demo data is now showing across all portals.");
  };

  const handleLoadReal = () => {
    const ok = loadReal();
    setNotice(
      ok
        ? "Saved real data is now showing across all portals."
        : "No saved real data yet. Anything you add now will be stored as real data."
    );
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Dashboard"
        description="Overview of school operations. Figures match the records currently loaded."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={String(students.length)}
          change={mode === "real" ? "From saved real records" : "Demo snapshot"}
          icon={UserCheck}
          accent="violet"
        />
        <StatCard
          title="Staff Members"
          value={String(staffCount)}
          change={`${users.filter((u) => u.role === "class_teacher").length} class teachers`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          title="Active Classes"
          value={String(classes.length)}
          change={`${classes.reduce((n, c) => n + c.studentCount, 0)} enrolled`}
          icon={GraduationCap}
          accent="emerald"
        />
        <StatCard
          title="Records vault"
          value={vaultHealthy ? "Protected" : "Warning"}
          change={mode === "real" ? "Real data mode" : "Demo data mode"}
          icon={Activity}
          accent={vaultHealthy ? "sky" : "red"}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Recent activity</h3>
          <ul className="mt-4 space-y-3">
            {activity.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Add user", href: "/admin/users" },
              { label: "Manage classes", href: "/admin/classes" },
              { label: "School settings", href: "/admin/settings" },
              { label: "View audit log", href: "/admin/audit" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="card-shadow mt-8 rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900">Data source</h3>
            <p className="mt-1 text-sm text-slate-500">
              Currently showing <span className="font-semibold text-slate-700">{mode === "real" ? "real entered data" : "demo data"}</span>
              {" · "}Last real save: {formatSavedAt(savedAt)}
              {hasRealVault ? " · Vault copy on this device" : " · No real vault yet"}
            </p>
            {mode === "demo" && (
              <p className="mt-2 text-sm text-amber-700">
                Edits made while demo is loaded are saved as real data and replace the previous real snapshot.
              </p>
            )}
            {!vaultHealthy && (
              <p className="mt-2 text-sm text-red-700">
                The last save could not be verified. Download a backup before you continue.
              </p>
            )}
            {notice && <p className="mt-2 text-sm text-emerald-700">{notice}</p>}
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              mode === "real" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            {mode === "real" ? "Real records" : "Demo preview"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLoadReal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Database className="h-4 w-4" /> Load real data
          </button>
          <button
            type="button"
            onClick={handleLoadDemo}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Load demo data
          </button>
          <button
            type="button"
            onClick={() => {
              downloadBackup();
              setNotice("Backup file downloaded.");
            }}
            disabled={!hasRealVault}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download backup
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
