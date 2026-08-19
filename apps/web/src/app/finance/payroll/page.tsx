"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Pencil, Play, Plus, Trash2, X } from "lucide-react";
import { FINANCE_NAV, type StaffAppointment } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, btnPrimary, btnSecondary, inputClass, selectClass } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { formatCurrency } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayrollPage() {
  useRequireAuth(["account_officer"]);
  const staff = useFinanceStore((s) => s.staff);
  const payrollRuns = useFinanceStore((s) => s.payrollRuns);
  const runPayroll = useFinanceStore((s) => s.runPayroll);
  const markPayrollPaid = useFinanceStore((s) => s.markPayrollPaid);
  const addStaff = useFinanceStore((s) => s.addStaff);
  const updateStaff = useFinanceStore((s) => s.updateStaff);
  const deleteStaff = useFinanceStore((s) => s.deleteStaff);
  const appointments = useSchoolStore((s) => s.appointments ?? []);

  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [appointmentId, setAppointmentId] = useState("");
  const [form, setForm] = useState({
    designation: "",
    basicSalary: "",
    allowances: "0",
    deductions: "0",
    bankAccount: "",
  });
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const issued = appointments.filter((a) => a.status === "issued");
  const unusedAppointments = useMemo(
    () =>
      issued.filter(
        (a) =>
          !staff.some(
            (m) => m.appointmentId === a.id || m.userId === a.userId || m.employeeId === a.employeeId
          )
      ),
    [issued, staff]
  );

  const totalMonthly = staff.reduce((s, m) => s + m.basicSalary + m.allowances - m.deductions, 0);

  const closeForm = () => {
    setMode("closed");
    setEditingId(null);
    setAppointmentId("");
    setError("");
    setForm({ designation: "", basicSalary: "", allowances: "0", deductions: "0", bankAccount: "" });
  };

  const applyAppointment = (appointment: StaffAppointment) => {
    setAppointmentId(appointment.id);
    setForm({
      designation: appointment.designation,
      basicSalary: String(appointment.basicSalary),
      allowances: String(appointment.allowances),
      deductions: String(appointment.deductions),
      bankAccount: appointment.bankAccount,
    });
  };

  const openCreate = () => {
    const first = unusedAppointments[0];
    if (!first) return;
    setEditingId(null);
    applyAppointment(first);
    setError("");
    setNotice("");
    setMode("create");
  };

  const openEdit = (id: string) => {
    const member = staff.find((m) => m.id === id);
    if (!member) return;
    setEditingId(id);
    setAppointmentId(member.appointmentId ?? "");
    setForm({
      designation: member.designation,
      basicSalary: String(member.basicSalary),
      allowances: String(member.allowances),
      deductions: String(member.deductions),
      bankAccount: member.bankAccount,
    });
    setError("");
    setMode("edit");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create") {
      const appointment = issued.find((a) => a.id === appointmentId);
      if (!appointment) {
        setError("Choose a staff member with an issued appointment.");
        return;
      }
      const result = addStaff({
        employeeId: appointment.employeeId,
        name: appointment.name,
        designation: form.designation.trim() || appointment.designation,
        basicSalary: Number(form.basicSalary) || 0,
        allowances: Number(form.allowances) || 0,
        deductions: Number(form.deductions) || 0,
        bankAccount: form.bankAccount.trim(),
        userId: appointment.userId,
        appointmentId: appointment.id,
      });
      if (!result.ok) {
        setError(result.error ?? "Could not add this payroll record.");
        return;
      }
      setNotice(`Added ${appointment.name} to the salary register.`);
      closeForm();
      return;
    }
    if (!editingId) return;
    const result = updateStaff(editingId, {
      designation: form.designation.trim(),
      basicSalary: Number(form.basicSalary) || 0,
      allowances: Number(form.allowances) || 0,
      deductions: Number(form.deductions) || 0,
      bankAccount: form.bankAccount.trim(),
    });
    if (!result.ok) {
      setError(result.error ?? "Could not update this payroll record.");
      return;
    }
    setNotice("Payroll record updated.");
    closeForm();
  };

  const handleDelete = (id: string, name: string) => {
    const ok = window.confirm(`Remove ${name} from the salary register? The appointment letter stays on record.`);
    if (!ok) return;
    const result = deleteStaff(id);
    if (!result.ok) {
      window.alert(result.error ?? "Could not delete this payroll record.");
      return;
    }
    if (editingId === id) closeForm();
    setNotice(`${name} removed from payroll.`);
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Finance Officer Portal">
      <PageHeader
        title="Payroll"
        description="Salary records come from appointments issued by admin. You can add, edit, or remove them, then run monthly payroll."
        action={
          <button type="button" onClick={openCreate} disabled={!unusedAppointments.length} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> Add payroll record
          </button>
        }
      />

      {!issued.length && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No issued appointments yet. Ask the super admin to issue an appointment before payroll can be set.
        </div>
      )}
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      <div className="card-shadow mb-6 flex flex-col gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-amber-800">Estimated monthly payroll</p>
          <p className="font-display text-3xl font-bold text-amber-900">{formatCurrency(totalMonthly)}</p>
          <p className="text-sm text-amber-700">{staff.length} staff members</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-amber-800">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            >
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-amber-800">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <button onClick={() => runPayroll(month, year)} disabled={!staff.length} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Play className="h-4 w-4" /> Run payroll
          </button>
        </div>
      </div>

      {mode !== "closed" && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display font-semibold text-slate-900">
              {mode === "edit" ? "Edit payroll record" : "Add payroll record"}
            </h3>
            <button type="button" onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "create" && (
              <FormField label="Appointed staff">
                <select
                  className={selectClass}
                  value={appointmentId}
                  onChange={(e) => {
                    const next = issued.find((a) => a.id === e.target.value);
                    if (next) applyAppointment(next);
                  }}
                  required
                >
                  {unusedAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} · {a.employeeId}
                    </option>
                  ))}
                </select>
              </FormField>
            )}
            <FormField label="Designation">
              <input className={inputClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required />
            </FormField>
            <FormField label="Basic salary">
              <input type="number" min={1} className={inputClass} value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} required />
            </FormField>
            <FormField label="Allowances">
              <input type="number" min={0} className={inputClass} value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} />
            </FormField>
            <FormField label="Deductions">
              <input type="number" min={0} className={inputClass} value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
            </FormField>
            <FormField label="Bank account / details">
              <input className={inputClass} value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>{mode === "edit" ? "Save payroll" : "Add to register"}</button>
            <button type="button" onClick={closeForm} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <h3 className="mb-4 font-display font-semibold text-slate-900">Staff salary register</h3>
      <DataTable headers={["Employee ID", "Name", "Designation", "Basic", "Allowances", "Deductions", "Net Pay", "Bank", "Actions"]}>
        {staff.map((member) => (
          <tr key={member.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 font-medium">{member.employeeId}</td>
            <td className="px-6 py-4">{member.name}</td>
            <td className="px-6 py-4 text-slate-500">{member.designation}</td>
            <td className="px-6 py-4">{formatCurrency(member.basicSalary)}</td>
            <td className="px-6 py-4">{formatCurrency(member.allowances)}</td>
            <td className="px-6 py-4 text-red-600">{formatCurrency(member.deductions)}</td>
            <td className="px-6 py-4 font-semibold text-emerald-700">
              {formatCurrency(member.basicSalary + member.allowances - member.deductions)}
            </td>
            <td className="px-6 py-4 text-slate-500">{member.bankAccount}</td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => openEdit(member.id)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100">
                  <Pencil className="h-4 w-4" /> Edit
                </button>
                <button type="button" onClick={() => handleDelete(member.id, member.name)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {payrollRuns.length > 0 && (
        <>
          <h3 className="mb-4 mt-8 font-display font-semibold text-slate-900">Payroll runs</h3>
          <div className="space-y-4">
            {payrollRuns.map((run) => (
              <div key={run.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{run.month} {run.year}</h4>
                    <p className="text-sm text-slate-500">
                      {run.payslips.length} payslips · {formatCurrency(run.totalAmount)} ·{" "}
                      <span className={run.status === "paid" ? "text-emerald-600" : "text-amber-600"}>
                        {run.status}
                      </span>
                    </p>
                  </div>
                  {run.status !== "paid" && (
                    <button
                      onClick={() => markPayrollPaid(run.id)}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-4 w-4" /> Mark as paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PortalShell>
  );
}
