"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Database, Download, GraduationCap, Shield, UserCheck, Users } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { StudentLookupPanel } from "@/components/student-record-view";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useDataModeStore } from "@/lib/bootstrap-data";
import { pageHref } from "@/lib/paths";

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
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
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
      "Switch to highlighted sample (demo) data? Your entered real records stay in the vault and are not shown until you load real data."
    );
    if (!ok) return;
    loadDemo();
    setNotice("Showing highlighted demo sample. These figures are not your school records.");
  };

  const handleLoadReal = () => {
    const entered = loadReal();
    setNotice(
      entered
        ? "Showing only records you entered. Sample students and staff are hidden."
        : "No entered records yet. Students, staff, and classes stay at 0 until you add them."
    );
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Dashboard"
        description={
          mode === "demo"
            ? "You are viewing highlighted DEMO sample data — not your entered school records."
            : "Overview of records you entered. Sample demo students and staff are excluded."
        }
      />
      {mode === "demo" && (
        <div className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-100 px-4 py-3 text-sm font-semibold text-amber-950">
          DEMO DATA is active. The 5 pupils, 5 parent logins, 5 student logins, sample staff, and sample classes below are for illustration only.
          Choose <span className="underline">Load real data</span> to see what you have actually entered.
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Students"
          value={String(students.length)}
          change={mode === "real" ? "Entered records only" : "DEMO sample"}
          icon={UserCheck}
          accent={mode === "demo" ? "amber" : "violet"}
          className={mode === "demo" ? "border-amber-400 bg-amber-50" : undefined}
        />
        <StatCard
          title="Staff Members"
          value={String(staffCount)}
          change={
            mode === "demo"
              ? "DEMO sample staff"
              : `${users.filter((u) => u.role === "class_teacher").length} class teachers`
          }
          icon={Users}
          accent={mode === "demo" ? "amber" : "blue"}
          className={mode === "demo" ? "border-amber-400 bg-amber-50" : undefined}
        />
        <StatCard
          title="Active Classes"
          value={String(classes.length)}
          change={
            mode === "demo"
              ? "DEMO sample classes"
              : `${classes.reduce((n, c) => n + c.studentCount, 0)} enrolled`
          }
          icon={GraduationCap}
          accent={mode === "demo" ? "amber" : "emerald"}
          className={mode === "demo" ? "border-amber-400 bg-amber-50" : undefined}
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
              { label: "Issue appointment", href: "/admin/appointments" },
              { label: "Enroll students", href: "/admin/students" },
              { label: "Manage classes", href: "/admin/classes" },
              { label: "School settings", href: "/admin/settings" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={pageHref(href)}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8" id="student-records">
        <StudentLookupPanel />
      </div>

      <div
        className={`card-shadow mt-8 rounded-2xl border-2 p-6 ${
          mode === "demo" ? "border-amber-400 bg-amber-50" : "border-emerald-200 bg-white"
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display font-semibold text-slate-900">Data source</h3>
            <p className="mt-1 text-sm text-slate-700">
              Currently showing{" "}
              {mode === "real" ? (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800">real entered data</span>
              ) : (
                <mark className="rounded bg-amber-300 px-1.5 py-0.5 font-bold text-amber-950">DEMO data</mark>
              )}
              {" · "}Last real save: {formatSavedAt(savedAt)}
              {hasRealVault ? " · Entered records saved on this device" : " · No entered records saved yet"}
            </p>
            {mode === "demo" && (
              <p className="mt-2 text-sm font-medium text-amber-900">
                Demo stays on screen until you choose Load real data. Editing the sample does not turn it into your school records.
              </p>
            )}
            {mode === "real" && !hasRealVault && (
              <p className="mt-2 text-sm text-slate-600">
                Real data is empty until you enroll students, add staff, or create classes.
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
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              mode === "real" ? "bg-emerald-100 text-emerald-800" : "bg-amber-400 text-amber-950"
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            {mode === "real" ? "Real records" : "DEMO"}
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleLoadReal}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
              mode === "real"
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-violet-600 text-white hover:bg-violet-700"
            }`}
          >
            <Database className="h-4 w-4" /> Load real data
          </button>
          <button
            type="button"
            onClick={handleLoadDemo}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold ${
              mode === "demo"
                ? "bg-amber-400 text-amber-950 ring-2 ring-amber-600 hover:bg-amber-300"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
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
            <Download className="h-4 w-4" /> Download backup (JSON)
          </button>
        </div>
      </div>
    </PortalShell>
  );
}
