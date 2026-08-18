"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { TEACHER_NAV, type NotePriority } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { FormField, inputClass, selectClass, btnPrimary, btnSecondary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useClassStudents } from "@/hooks/use-class-students";
import { useCommsStore } from "@/lib/comms-store";
import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<NotePriority, string> = {
  info: "border-l-blue-500 bg-blue-50",
  warning: "border-l-amber-500 bg-amber-50",
  urgent: "border-l-red-500 bg-red-50",
};

export default function TeacherNotesPage() {
  useRequireAuth(["class_teacher"]);
  const { user } = useAuthStore();
  const students = useClassStudents();
  const { notes, addNote } = useCommsStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: students[0]?.id ?? "", title: "", body: "", priority: "info" as NotePriority });

  const classNotes = notes.filter((n) => students.some((s) => s.id === n.studentId));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find((s) => s.id === form.studentId);
    if (!student || !user) return;
    addNote(
      { studentId: form.studentId, teacherName: `${user.firstName} ${user.lastName}`, title: form.title, body: form.body, priority: form.priority },
      student.parentEmail
    );
    setForm({ studentId: students[0]?.id ?? "", title: "", body: "", priority: "info" });
    setShowForm(false);
  };

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader
        title="Parent Notes"
        description="Leave notes for parents about their children."
        action={
          <button onClick={() => setShowForm(true)} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> New note
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Student">
              <select className={selectClass} value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
                {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </FormField>
            <FormField label="Priority">
              <select className={selectClass} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as NotePriority })}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
            </FormField>
            <FormField label="Title">
              <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </FormField>
          </div>
          <FormField label="Message">
            <textarea className={`${inputClass} mt-4 min-h-[100px]`} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          </FormField>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>Send note</button>
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {classNotes.map((note) => {
          const student = students.find((s) => s.id === note.studentId);
          return (
            <div key={note.id} className={cn("card-shadow rounded-2xl border-l-4 p-5", PRIORITY_STYLES[note.priority])}>
              <div className="flex justify-between">
                <div>
                  <p className="text-xs text-slate-500">{student?.name} · {new Date(note.createdAt).toLocaleDateString()}</p>
                  <h4 className="font-semibold text-slate-900">{note.title}</h4>
                </div>
                <span className="text-xs font-medium capitalize">{note.priority}</span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{note.body}</p>
              {note.readAt && <p className="mt-2 text-xs text-emerald-600">Read by parent</p>}
            </div>
          );
        })}
      </div>
    </PortalShell>
  );
}
