"use client";

import { useState } from "react";
import { Eye, Pencil, Plus, X } from "lucide-react";
import { ADMIN_NAV, type Student } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, btnSecondary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";

const fieldClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 disabled:text-slate-600";

const EMPTY_FORM = {
  name: "",
  admissionNo: "",
  className: "",
  parentEmail: "",
  dateOfBirth: "",
  parentAddress: "",
  parentPhone: "",
  disability: "None",
  allergy: "None",
};

type Mode = "closed" | "enroll" | "view" | "edit";

function fromStudent(s: Student) {
  return {
    name: s.name,
    admissionNo: s.admissionNo,
    className: s.className,
    parentEmail: s.parentEmail,
    dateOfBirth: s.dateOfBirth ?? "",
    parentAddress: s.parentAddress ?? "",
    parentPhone: s.parentPhone ?? "",
    disability: s.disability || "None",
    allergy: s.allergy || "None",
  };
}

export default function AdminStudentsPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const students = useFinanceStore((s) => s.students);
  const addStudent = useFinanceStore((s) => s.addStudent);
  const updateStudent = useFinanceStore((s) => s.updateStudent);
  const classes = useSchoolStore((s) => s.classes);

  const [mode, setMode] = useState<Mode>("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const classOptions = classes.length
    ? classes.map((c) => c.name)
    : ["JSS 1A", "JSS 1B", "JSS 2A", "SS 1 Science", "SS 2 Arts"];
  const readOnly = mode === "view";

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const closePanel = () => {
    setMode("closed");
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const openEnroll = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, className: classOptions[0] ?? "" });
    setMode("enroll");
  };

  const openView = (student: Student) => {
    setEditingId(student.id);
    setForm(fromStudent(student));
    setMode("view");
  };

  const openEdit = (student: Student) => {
    setEditingId(student.id);
    setForm(fromStudent(student));
    setMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "view") return;
    const payload = {
      name: form.name.trim(),
      admissionNo: form.admissionNo.trim(),
      className: form.className,
      parentEmail: form.parentEmail.trim(),
      dateOfBirth: form.dateOfBirth,
      parentAddress: form.parentAddress.trim(),
      parentPhone: form.parentPhone.trim(),
      disability: form.disability.trim() || "None",
      allergy: form.allergy.trim() || "None",
    };
    if (mode === "edit" && editingId) {
      const existing = students.find((s) => s.id === editingId);
      updateStudent(editingId, { ...payload, studentEmail: existing?.studentEmail });
    } else {
      addStudent(payload);
    }
    closePanel();
  };

  const title =
    mode === "enroll" ? "Enroll student" : mode === "edit" ? "Edit student record" : "Student record";

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Students"
        description="Enroll students and open any record to view or edit."
        action={
          <button
            onClick={openEnroll}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Enroll student
          </button>
        }
      />

      {mode !== "closed" && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display font-semibold text-slate-900">{title}</h3>
            <button type="button" onClick={closePanel} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name">
              <input className={fieldClass} value={form.name} disabled={readOnly} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </FormField>
            <FormField label="Admission no.">
              <input className={fieldClass} value={form.admissionNo} disabled={readOnly} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} required />
            </FormField>
            <FormField label="Date of birth">
              <input type="date" className={fieldClass} value={form.dateOfBirth} disabled={readOnly} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
            </FormField>
            <FormField label="Class">
              <select className={fieldClass} value={form.className} disabled={readOnly} onChange={(e) => setForm({ ...form, className: e.target.value })} required>
                {classOptions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Parent email">
              <input type="email" className={fieldClass} value={form.parentEmail} disabled={readOnly} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
            </FormField>
            <FormField label="Parent phone number">
              <input type="tel" className={fieldClass} value={form.parentPhone} disabled={readOnly} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
            </FormField>
            <FormField label="Parent address">
              <input className={fieldClass} value={form.parentAddress} disabled={readOnly} onChange={(e) => setForm({ ...form, parentAddress: e.target.value })} required />
            </FormField>
            <FormField label="Disability">
              <input className={fieldClass} value={form.disability} disabled={readOnly} onChange={(e) => setForm({ ...form, disability: e.target.value })} placeholder="None" />
            </FormField>
            <FormField label="Allergy">
              <input className={fieldClass} value={form.allergy} disabled={readOnly} onChange={(e) => setForm({ ...form, allergy: e.target.value })} placeholder="None" />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            {mode === "view" ? (
              <>
                <button type="button" onClick={() => setMode("edit")} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                  Edit record
                </button>
                <button type="button" onClick={closePanel} className={btnSecondary}>Close</button>
              </>
            ) : (
              <>
                <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
                  {mode === "edit" ? "Save changes" : "Enroll"}
                </button>
                <button type="button" onClick={closePanel} className={btnSecondary}>Cancel</button>
              </>
            )}
          </div>
        </form>
      )}

      <DataTable headers={["Admission No.", "Name", "Class", "Parent Email", "Actions"]}>
        {students.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 font-medium">{s.admissionNo}</td>
            <td className="px-6 py-4">{s.name}</td>
            <td className="px-6 py-4 text-slate-500">{s.className}</td>
            <td className="px-6 py-4 text-slate-500">{s.parentEmail}</td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openView(s)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50"
                >
                  <Eye className="h-4 w-4" /> View
                </button>
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Pencil className="h-4 w-4" /> Edit
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PortalShell>
  );
}
