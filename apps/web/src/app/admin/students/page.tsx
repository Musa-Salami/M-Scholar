"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  ADMIN_NAV,
  buildAdmissionNo,
  uniqueAdmissionNo,
  classLevelCode,
  describeAdmissionNo,
  type Student,
} from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, btnSecondary } from "@/components/finance-ui";
import { StudentResultButtons } from "@/components/student-record-view";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";

const fieldClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50 disabled:text-slate-600";

const currentYear = new Date().getFullYear();

const EMPTY_FORM = {
  name: "",
  className: "",
  admissionTerm: "1" as "1" | "2" | "3",
  admissionYear: String(currentYear),
  parentEmail: "",
  dateOfBirth: "",
  parentAddress: "",
  parentPhone: "",
  studentPhone: "",
  disability: "None",
  allergy: "None",
  admissionNo: "",
};

type Mode = "closed" | "enroll" | "view" | "edit";

function fromStudent(s: Student) {
  return {
    name: s.name,
    className: s.className,
    admissionTerm: "1" as "1" | "2" | "3",
    admissionYear: String(currentYear),
    parentEmail: s.parentEmail,
    dateOfBirth: s.dateOfBirth ?? "",
    parentAddress: s.parentAddress ?? "",
    parentPhone: s.parentPhone ?? "",
    studentPhone: s.studentPhone ?? "",
    disability: s.disability || "None",
    allergy: s.allergy || "None",
    admissionNo: s.admissionNo,
  };
}

export default function AdminStudentsPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const students = useFinanceStore((s) => s.students);
  const addStudent = useFinanceStore((s) => s.addStudent);
  const updateStudent = useFinanceStore((s) => s.updateStudent);
  const deleteStudent = useFinanceStore((s) => s.deleteStudent);
  const classes = useSchoolStore((s) => s.classes);

  const [mode, setMode] = useState<Mode>("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const classOptions = classes.length
    ? classes.map((c) => c.name)
    : ["Kindergarten", "Nursery 1", "Nursery 2", "Primary 1", "Primary 3"];
  const readOnly = mode === "view";

  const generatedNo = useMemo(() => {
    const year = Number(form.admissionYear) || currentYear;
    const term = Number(form.admissionTerm) as 1 | 2 | 3;
    const base = buildAdmissionNo({
      className: form.className,
      term,
      fullName: form.name,
      year,
    });
    const others = students
      .filter((s) => s.id !== editingId)
      .map((s) => s.admissionNo);
    return uniqueAdmissionNo(base, others);
  }, [form.className, form.admissionTerm, form.admissionYear, form.name, students, editingId]);

  const admissionNo = mode === "enroll" ? generatedNo : form.admissionNo;
  const levelOk = Boolean(classLevelCode(form.className));
  const decoded = admissionNo ? describeAdmissionNo(admissionNo) : "";

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
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
    if (mode === "enroll" && !generatedNo) return;
    const payload = {
      name: form.name.trim(),
      admissionNo: mode === "enroll" ? generatedNo : form.admissionNo,
      className: form.className,
      parentEmail: form.parentEmail.trim(),
      dateOfBirth: form.dateOfBirth,
      parentAddress: form.parentAddress.trim(),
      parentPhone: form.parentPhone.trim(),
      studentPhone: form.studentPhone.trim(),
      disability: form.disability.trim() || "None",
      allergy: form.allergy.trim() || "None",
    };
    if (mode === "edit" && editingId) {
      const existing = students.find((s) => s.id === editingId);
      updateStudent(editingId, { ...payload, studentEmail: existing?.studentEmail });
    } else {
      addStudent(payload);
    }
    useSchoolStore.getState().syncClassCounts(useFinanceStore.getState().students);
    closePanel();
  };

  const handleDelete = (student: Student) => {
    const ok = window.confirm(`Delete ${student.name} (${student.admissionNo})? Fee invoices and class records for this pupil will also be removed.`);
    if (!ok) return;
    deleteStudent(student.id);
    useAcademicStore.getState().removeStudentRecords(student.id);
    useCommsStore.getState().removeStudentRecords(student.id);
    useSchoolStore.getState().syncClassCounts(useFinanceStore.getState().students);
    if (editingId === student.id) closePanel();
  };

  const title =
    mode === "enroll" ? "Enroll student" : mode === "edit" ? "Edit student record" : "Student record";

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Students"
        description="Admission numbers are assigned automatically from class level, term, name initials, and year."
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
              <input className={fieldClass} value={form.name} disabled={readOnly} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Musa Ismaila Salami" />
            </FormField>
            <FormField label="Admission no.">
              <input className={fieldClass} value={admissionNo} disabled readOnly />
              {mode === "enroll" && (
                <p className="mt-1 text-xs text-slate-500">
                  Auto-assigned: N Nursery, P Primary, J Junior Secondary, S Senior Secondary, then term, initials, and year.
                  {decoded ? ` Example reading: ${decoded}.` : ""}
                </p>
              )}
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
              {mode === "enroll" && form.className && !levelOk && (
                <p className="mt-1 text-xs text-amber-700">
                  Class name should start with Kindergarten, Nursery, or Primary so the admission number can be generated.
                </p>
              )}
            </FormField>
            {mode === "enroll" && (
              <>
                <FormField label="Term of admission">
                  <select
                    className={fieldClass}
                    value={form.admissionTerm}
                    onChange={(e) => setForm({ ...form, admissionTerm: e.target.value as "1" | "2" | "3" })}
                  >
                    <option value="1">1st term</option>
                    <option value="2">2nd term</option>
                    <option value="3">3rd term</option>
                  </select>
                </FormField>
                <FormField label="Year of admission">
                  <input
                    type="number"
                    min={2000}
                    max={2100}
                    className={fieldClass}
                    value={form.admissionYear}
                    onChange={(e) => setForm({ ...form, admissionYear: e.target.value })}
                    required
                  />
                </FormField>
              </>
            )}
            <FormField label="Parent email">
              <input type="email" className={fieldClass} value={form.parentEmail} disabled={readOnly} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required />
            </FormField>
            <FormField label="Parent phone (portal login)">
              <input type="tel" className={fieldClass} value={form.parentPhone} disabled={readOnly} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} required />
            </FormField>
            <FormField label="Student phone (portal login)">
              <input type="tel" className={fieldClass} value={form.studentPhone} disabled={readOnly} onChange={(e) => setForm({ ...form, studentPhone: e.target.value })} placeholder="Optional until a student login is created" />
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
                {editingId && <StudentResultButtons studentId={editingId} />}
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      const current = students.find((s) => s.id === editingId);
                      if (current) handleDelete(current);
                    }}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                <button type="button" onClick={closePanel} className={btnSecondary}>Close</button>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={mode === "enroll" && !generatedNo}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
                >
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
              <div className="flex flex-wrap gap-2">
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
                <button
                  type="button"
                  onClick={() => handleDelete(s)}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
                <StudentResultButtons studentId={s.id} compact />
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PortalShell>
  );
}
