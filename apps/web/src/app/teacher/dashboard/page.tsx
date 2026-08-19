"use client";

import { ClipboardCheck, BookOpen, StickyNote, MessageSquare } from "lucide-react";
import { TEACHER_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useClassStudents } from "@/hooks/use-class-students";
import { useAcademicStore, TEACHER_CLASS } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";
import { pageHref } from "@/lib/paths";

export default function TeacherDashboardPage() {
  const { ready } = useRequireAuth(["class_teacher"]);
  const students = useClassStudents();
  const registers = useAcademicStore((s) => s.registers);
  const termResults = useAcademicStore((s) => s.termResults);
  const notes = useCommsStore((s) => s.notes);
  const messages = useCommsStore((s) => s.messages);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayReg = (registers ?? []).find((r) => r.className === TEACHER_CLASS && r.date === today);
  const todayRecords = todayReg?.records ?? [];
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;
  const presentToday = todayReg ? todayRecords.length - absentToday : students.length;
  const draftResults = (termResults ?? []).filter((r) => r.status === "draft" && students.some((s) => s.id === r.studentId)).length;
  const classNotes = (notes ?? []).filter((n) => students.some((s) => s.id === n.studentId)).length;
  const unreadMsgs = (messages ?? []).filter((m) => m.senderRole === "parent" && !m.readAt).length;

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader title="Dashboard" description={`Today's overview — ${TEACHER_CLASS}.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="My Class" value={TEACHER_CLASS} change={`${students.length} students`} icon={MessageSquare} accent="amber" />
        <StatCard title="Present Today" value={String(presentToday)} change={`${absentToday} absent`} icon={ClipboardCheck} accent="emerald" />
        <StatCard title="Draft Results" value={String(draftResults)} icon={BookOpen} accent="blue" />
        <StatCard title="Notes / Messages" value={`${classNotes} / ${unreadMsgs}`} icon={StickyNote} accent="violet" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Take attendance", href: "/teacher/attendance" },
          { label: "Enter assessments", href: "/teacher/assessments" },
          { label: "Post assignment", href: "/teacher/assignments" },
          { label: "Write notes", href: "/teacher/notes" },
        ].map(({ label, href }) => (
          <a
            key={href}
            href={pageHref(href)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-amber-200 hover:bg-amber-50"
          >
            {label}
          </a>
        ))}
      </div>
    </PortalShell>
  );
}
