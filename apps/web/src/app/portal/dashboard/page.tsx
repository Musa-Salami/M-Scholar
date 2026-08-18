"use client";

import { Calendar, Receipt, Award, MessageSquare } from "lucide-react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";
import { useNotificationStore } from "@/lib/notification-store";
import { formatCurrency } from "@/lib/utils";

export default function PortalDashboardPage() {
  const { ready } = useRequireAuth(["parent", "student"]);
  const user = useAuthStore((s) => s.user);
  const students = useFinanceStore((s) => s.students ?? []);
  const invoices = useFinanceStore((s) => s.invoices ?? []);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);
  const termResults = useAcademicStore((s) => s.termResults ?? []);
  const notes = useCommsStore((s) => s.notes ?? []);
  const notifications = useNotificationStore((s) => s.notifications ?? []);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const mine = students.filter(
    (st) => st.parentEmail === user.email || st.studentEmail === user.email
  );
  const student = mine[0];
  const ids = new Set(mine.map((s) => s.id));
  const myInvoices = invoices.filter((i) => ids.has(i.studentId));
  const feeBalance = myInvoices.reduce((sum, i) => sum + (i.balance || 0), 0);
  const results = termResults.filter((r) => student && r.studentId === student.id && r.status === "published");
  const latest = results[0];
  const attendance = student ? getAttendanceSummary(student.id) : null;
  const unreadNotes = notes.filter((n) => ids.has(n.studentId) && !n.readAt).length;
  const unreadNotifs = notifications.filter((n) => n.userEmail === user.email && !n.read).length;

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader
        title="Dashboard"
        description={student ? `Overview for ${student.name} — ${student.className}.` : "Parent / student portal"}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Attendance"
          value={attendance ? `${attendance.percent}%` : "—"}
          change={attendance ? `${attendance.present} present of ${attendance.total} days` : "No register yet"}
          icon={Calendar}
          accent="sky"
        />
        <StatCard title="Fee Balance" value={formatCurrency(feeBalance)} change="Outstanding dues" icon={Receipt} accent="amber" />
        <StatCard title="Latest Grade" value={latest?.grade ?? "—"} change={latest?.subject ?? "Results"} icon={Award} accent="emerald" />
        <StatCard title="Alerts" value={String(unreadNotes + unreadNotifs)} change="Notes & notifications" icon={MessageSquare} accent="violet" />
      </div>
    </PortalShell>
  );
}
