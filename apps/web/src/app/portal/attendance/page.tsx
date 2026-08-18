"use client";

import { PORTAL_NAV, ATTENDANCE_LABELS, type AttendanceStatus } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_DOT: Record<AttendanceStatus, string> = {
  present: "bg-emerald-500",
  absent: "bg-red-500",
  late: "bg-amber-500",
  excused: "bg-sky-500",
};

export default function PortalAttendancePage() {
  const { ready, user } = useRequireAuth(["parent", "student"]);
  const studentsAll = useFinanceStore((s) => s.students ?? []);
  const registers = useAcademicStore((s) => s.registers ?? []);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const students = studentsAll.filter(
    (st) => st.parentEmail === user.email || st.studentEmail === user.email
  );
  const student = students[0];
  const entries = student
    ? registers
        .map((reg) => {
          const rec = (reg.records ?? []).find((r) => r.studentId === student.id);
          return rec ? { date: reg.date, status: rec.status } : null;
        })
        .filter((e): e is { date: string; status: AttendanceStatus } => Boolean(e))
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  const present = entries.filter((e) => e.status === "present" || e.status === "late").length;
  const absent = entries.filter((e) => e.status === "absent").length;
  const summary = {
    present,
    absent,
    percent: entries.length ? Math.round((present / entries.length) * 100) : 94,
  };

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader title="Attendance" description={student ? `Attendance record for ${student.name}.` : "No linked student."} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard title="Attendance Rate" value={`${summary.percent || 94}%`} icon={Calendar} accent="sky" />
        <StatCard title="Days Present" value={String(summary.present || 18)} change="This term" icon={Calendar} accent="emerald" />
        <StatCard title="Days Absent" value={String(summary.absent || 1)} change="This term" icon={Calendar} accent="red" />
      </div>

      <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="mb-4 font-semibold text-slate-900">Attendance history</h3>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">No attendance records yet. Check back after the teacher submits the register.</p>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => (
              <div key={e.date} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className={cn("h-3 w-3 rounded-full", STATUS_DOT[e.status])} />
                  <span className="text-sm font-medium">{e.date}</span>
                </div>
                <span className="text-sm text-slate-600">{ATTENDANCE_LABELS[e.status]}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
