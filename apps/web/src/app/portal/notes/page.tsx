"use client";

import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useCommsStore } from "@/lib/comms-store";
import { cn } from "@/lib/utils";
import type { NotePriority } from "@m-scholar/shared";

const PRIORITY_STYLES: Record<NotePriority, string> = {
  info: "border-l-blue-500",
  warning: "border-l-amber-500",
  urgent: "border-l-red-500",
};

export default function PortalNotesPage() {
  useRequireAuth(["parent", "student"]);
  const { user } = useAuthStore();
  const students = useFinanceStore((s) => (s.students ?? []).filter((st) => st.parentEmail === user?.email || st.studentEmail === user?.email));
  const studentIds = students.map((s) => s.id);
  const { getNotesForParent, markNoteRead } = useCommsStore();
  const notes = getNotesForParent(user?.email ?? "", studentIds);

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader title="Teacher Notes" description="Messages and updates from the class teacher." />

      <div className="space-y-4">
        {notes.length === 0 ? (
          <div className="card-shadow rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No notes from the class teacher yet.</p>
          </div>
        ) : (
          notes.map((note) => {
            const student = students.find((s) => s.id === note.studentId);
            return (
              <div
                key={note.id}
                onClick={() => !note.readAt && markNoteRead(note.id)}
                className={cn("card-shadow cursor-pointer rounded-2xl border-l-4 bg-white p-5 hover:shadow-md transition", PRIORITY_STYLES[note.priority], !note.readAt && "ring-2 ring-sky-100")}
              >
                <div className="flex justify-between">
                  <p className="text-xs text-slate-500">{student?.name} · {note.teacherName} · {new Date(note.createdAt).toLocaleDateString()}</p>
                  {!note.readAt && <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">New</span>}
                </div>
                <h4 className="mt-1 font-semibold text-slate-900">{note.title}</h4>
                <p className="mt-2 text-sm text-slate-700">{note.body}</p>
              </div>
            );
          })
        )}
      </div>
    </PortalShell>
  );
}
