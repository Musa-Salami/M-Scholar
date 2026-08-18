"use client";

import { Award, BookOpen, Calendar, ClipboardList, MessageSquare, Receipt, StickyNote } from "lucide-react";
import { PORTAL_NAV, type NotePriority } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";
import { useNotificationStore } from "@/lib/notification-store";
import { formatCurrency } from "@/lib/utils";
import { pageHref } from "@/lib/paths";

const NOTE_TONE: Record<NotePriority, string> = {
  info: "border-sky-300 bg-sky-50",
  warning: "border-amber-300 bg-amber-50",
  urgent: "border-red-300 bg-red-50",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ageFromDob(dob: string) {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const month = today.getMonth() - birth.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function formatDue(dueDate: string) {
  try {
    return new Date(`${dueDate}T12:00:00`).toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dueDate;
  }
}

export default function PortalDashboardPage() {
  const { ready } = useRequireAuth(["parent", "student"]);
  const user = useAuthStore((s) => s.user);
  const students = useFinanceStore((s) => s.students ?? []);
  const invoices = useFinanceStore((s) => s.invoices ?? []);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);
  const termResults = useAcademicStore((s) => s.termResults ?? []);
  const assignments = useAcademicStore((s) => s.assignments ?? []);
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
  const latest = [...results].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))[0];
  const attendance = student ? getAttendanceSummary(student.id) : null;
  const studentNotes = notes
    .filter((n) => student && n.studentId === student.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const latestNote = studentNotes[0];
  const unreadNotes = studentNotes.filter((n) => !n.readAt).length;
  const unreadNotifs = notifications.filter((n) => n.userEmail === user.email && !n.read).length;
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = student
    ? assignments
        .filter((a) => a.className === student.className)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
        .filter((a) => a.dueDate >= today)
        .slice(0, 3)
    : [];
  const overdue = student
    ? assignments
        .filter((a) => a.className === student.className && a.dueDate < today)
        .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
        .slice(0, 1)
    : [];
  const glanceWork = upcoming.length > 0 ? upcoming : overdue;
  const age = student ? ageFromDob(student.dateOfBirth) : null;

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader
        title="Dashboard"
        description={student ? `Overview for ${student.name} — ${student.className}.` : "Parent / student portal"}
      />

      {student && (
        <div className="card-shadow mb-6 rounded-2xl border border-sky-100 bg-white p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-600 font-display text-xl font-bold text-white">
              {initials(student.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Student at a glance</p>
              <h2 className="font-display text-xl font-bold text-slate-900">{student.name}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {student.className} · Admission {student.admissionNo}
                {age != null ? ` · ${age} years` : ""}
              </p>
              {(student.allergy && student.allergy !== "None") || (student.disability && student.disability !== "None") ? (
                <p className="mt-2 text-xs font-medium text-amber-800">
                  {student.allergy && student.allergy !== "None" ? `Allergy: ${student.allergy}` : ""}
                  {student.allergy && student.allergy !== "None" && student.disability && student.disability !== "None"
                    ? " · "
                    : ""}
                  {student.disability && student.disability !== "None" ? `Support need: ${student.disability}` : ""}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      )}

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

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-sky-600" />
              <h3 className="font-display font-semibold text-slate-900">Upcoming assignments</h3>
            </div>
            {upcoming.length === 0 && overdue.length > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Overdue</span>
            )}
          </div>
          {glanceWork.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No class assignments posted yet. Homework and due dates from the class teacher will appear here.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {glanceWork.map((item) => {
                const isOverdue = item.dueDate < today;
                return (
                  <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">{item.subject}</p>
                        <p className="mt-0.5 font-medium text-slate-900">{item.title}</p>
                        {item.details && <p className="mt-1 text-sm text-slate-600">{item.details}</p>}
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isOverdue ? "bg-red-100 text-red-700" : "bg-sky-100 text-sky-800"
                        }`}
                      >
                        {isOverdue ? "Overdue" : "Due"} {formatDue(item.dueDate)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.teacherName}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-sky-600" />
              <h3 className="font-display font-semibold text-slate-900">Teacher note</h3>
            </div>
            {latestNote && (
              <a href={pageHref("/portal/notes")} className="text-xs font-semibold text-sky-700 hover:underline">
                All notes
              </a>
            )}
          </div>
          {!latestNote ? (
            <p className="mt-4 text-sm text-slate-500">
              No notes from the class teacher yet. Comments about this student will show here.
            </p>
          ) : (
            <div className={`mt-4 rounded-xl border-l-4 p-4 ${NOTE_TONE[latestNote.priority] ?? NOTE_TONE.info}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-slate-600">
                  {latestNote.teacherName} · {new Date(latestNote.createdAt).toLocaleDateString()}
                </p>
                {!latestNote.readAt && (
                  <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-semibold text-sky-800">New</span>
                )}
              </div>
              <h4 className="mt-1 font-semibold text-slate-900">{latestNote.title}</h4>
              <p className="mt-2 text-sm text-slate-700">{latestNote.body}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Attendance", href: "/portal/attendance", icon: Calendar },
          { label: "Fees & receipts", href: "/portal/fees", icon: Receipt },
          { label: "Results", href: "/portal/results", icon: Award },
          { label: "Teacher notes", href: "/portal/notes", icon: BookOpen },
          { label: "Messages", href: "/portal/messages", icon: MessageSquare },
        ].map(({ label, href, icon: Icon }) => (
          <a
            key={href}
            href={pageHref(href)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-50"
          >
            <Icon className="h-4 w-4 text-sky-600" />
            {label}
          </a>
        ))}
      </div>
    </PortalShell>
  );
}
