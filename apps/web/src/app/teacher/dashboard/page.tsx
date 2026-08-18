"use client";

import { ClipboardCheck, BookOpen, StickyNote, MessageSquare } from "lucide-react";
import { TEACHER_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore, TEACHER_CLASS } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";

export default function TeacherDashboardPage() {
  useRequireAuth(["class_teacher"]);
  const students = useFinanceStore((s) => s.students.filter((st) => st.className === TEACHER_CLASS));
  const { registers, termResults } = useAcademicStore();
  const { notes, messages } = useCommsStore();

  const today = new Date().toISOString().slice(0, 10);
  const todayReg = registers.find((r) => r.className === TEACHER_CLASS && r.date === today);
  const absentToday = todayReg?.records.filter((r) => r.status === "absent").length ?? 0;
  const presentToday = todayReg ? todayReg.records.length - absentToday : students.length;
  const draftResults = termResults.filter((r) => r.status === "draft" && students.some((s) => s.id === r.studentId)).length;
  const classNotes = notes.filter((n) => students.some((s) => s.id === n.studentId)).length;
  const unreadMsgs = messages.filter((m) => m.senderRole === "parent" && !m.readAt).length;

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader title="Dashboard" description={`Today's overview — ${TEACHER_CLASS}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Class" value={TEACHER_CLASS} change={`${students.length} students`} icon={MessageSquare} accent="amber" />
        <StatCard title="Present Today" value={String(presentToday)} change={`${absentToday} absent`} icon={ClipboardCheck} accent="emerald" />
        <StatCard title="Draft Results" value={String(draftResults)} icon={BookOpen} accent="blue" />
        <StatCard title="Notes / Messages" value={`${classNotes} / ${unreadMsgs}`} icon={StickyNote} accent="violet" />
      </div>
    </PortalShell>
  );
}
