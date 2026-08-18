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
  useRequireAuth(["parent", "student"]);
  const { user } = useAuthStore();
  const students = useFinanceStore((s) =>
    (s.students ?? []).filter((st) => st.parentEmail === user?.email || st.studentEmail === user?.email)
  );
  const student = students[0];
  const { getInvoicesForParent } = useFinanceStore();
  const { getAttendanceSummary, getResultsForStudent } = useAcademicStore();
  const { getNotesForParent } = useCommsStore();
  const unreadCount = useNotificationStore((s) => s.unreadCount(user?.email ?? ""));

  const invoices = getInvoicesForParent(user?.email ?? "");
  const feeBalance = invoices.reduce((s, i) => s + i.balance, 0);
  const attendance = student ? getAttendanceSummary(student.id) : { percent: 94 };
  const results = student ? getResultsForStudent(student.id).filter((r) => r.status === "published") : [];
  const latestGrade = results[0]?.grade ?? "—";
  const notes = getNotesForParent(user?.email ?? "", students.map((s) => s.id));
  const unreadNotes = notes.filter((n) => !n.readAt).length;

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader title="Dashboard" description={student ? `Overview for ${student.name} — ${student.className}.` : "Parent portal"} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Attendance" value={`${attendance.percent || 94}%`} change="This term" icon={Calendar} accent="sky" />
        <StatCard title="Fee Balance" value={formatCurrency(feeBalance)} change="Outstanding dues" icon={Receipt} accent="amber" />
        <StatCard title="Latest Grade" value={latestGrade} change={results[0]?.subject ?? "Results"} icon={Award} accent="emerald" />
        <StatCard title="Alerts" value={String(unreadNotes + unreadCount)} change="Notes & notifications" icon={MessageSquare} accent="violet" />
      </div>
    </PortalShell>
  );
}
