"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, inputClass, selectClass, btnSecondary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";

export default function AdminStudentsPage() {
  useRequireAuth(["super_admin"]);
  const { students } = useFinanceStore();
  const [localStudents, setLocalStudents] = useState(students);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", admissionNo: "", className: "JSS 1A", parentEmail: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalStudents((prev) => [
      ...prev,
      { id: `s${Date.now()}`, name: form.name, admissionNo: form.admissionNo, className: form.className, parentEmail: form.parentEmail },
    ]);
    setForm({ name: "", admissionNo: "", className: "JSS 1A", parentEmail: "" });
    setShowForm(false);
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Students"
        description="Enroll and manage student records."
        action={
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Enroll student
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Full name"><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></FormField>
            <FormField label="Admission no."><input className={inputClass} value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} required /></FormField>
            <FormField label="Class">
              <select className={selectClass} value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
                {["JSS 1A", "JSS 2A", "SS 1 Science", "SS 2 Arts"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </FormField>
            <FormField label="Parent email"><input type="email" className={inputClass} value={form.parentEmail} onChange={(e) => setForm({ ...form, parentEmail: e.target.value })} required /></FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">Enroll</button>
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <DataTable headers={["Admission No.", "Name", "Class", "Parent Email"]}>
        {localStudents.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 font-medium">{s.admissionNo}</td>
            <td className="px-6 py-4">{s.name}</td>
            <td className="px-6 py-4 text-slate-500">{s.className}</td>
            <td className="px-6 py-4 text-slate-500">{s.parentEmail}</td>
          </tr>
        ))}
      </DataTable>
    </PortalShell>
  );
}
