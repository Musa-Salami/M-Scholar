"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { SUBJECTS, TEACHER_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { FormField, inputClass, selectClass, btnPrimary, btnSecondary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useClassStudents } from "@/hooks/use-class-students";
import { useAcademicStore, TEACHER_CLASS } from "@/lib/academic-store";

export default function TeacherAssignmentsPage() {
  useRequireAuth(["class_teacher"]);
  const { user } = useAuthStore();
  const students = useClassStudents();
  const assignmentsAll = useAcademicStore((s) => s.assignments);
  const addAssignment = useAcademicStore((s) => s.addAssignment);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subject: SUBJECTS[0] as string,
    title: "",
    details: "",
    dueDate: "",
  });

  const assignments = (assignmentsAll ?? [])
    .filter((a) => a.className === TEACHER_CLASS)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    addAssignment(
      {
        className: TEACHER_CLASS,
        subject: form.subject,
        title: form.title.trim(),
        details: form.details.trim(),
        dueDate: form.dueDate,
        teacherName: `${user.firstName} ${user.lastName}`,
      },
      students.map((s) => s.parentEmail)
    );
    setForm({ subject: SUBJECTS[0], title: "", details: "", dueDate: "" });
    setShowForm(false);
  };

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader
        title="Class assignments"
        description={`Homework and due work for ${TEACHER_CLASS}. Parents and students see this on their dashboard.`}
        action={
          <button type="button" onClick={() => setShowForm(true)} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> New assignment
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Subject">
              <select
                className={selectClass}
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              >
                {SUBJECTS.map((subject) => (
                  <option key={subject}>{subject}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Due date">
              <input
                type="date"
                className={inputClass}
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Title">
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Algebra worksheet"
                required
              />
            </FormField>
          </div>
          <FormField label="Details">
            <textarea
              className={`${inputClass} mt-4 min-h-[100px]`}
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              placeholder="What should students prepare or submit?"
            />
          </FormField>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>
              Post to class
            </button>
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="card-shadow rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No assignments posted for this class yet.</p>
          </div>
        ) : (
          assignments.map((item) => (
            <div key={item.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">{item.subject}</p>
                  <h4 className="mt-1 font-semibold text-slate-900">{item.title}</h4>
                  {item.details && <p className="mt-2 text-sm text-slate-700">{item.details}</p>}
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    item.dueDate < today ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  Due {item.dueDate}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </PortalShell>
  );
}
