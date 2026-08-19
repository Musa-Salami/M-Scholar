"use client";

import { useMemo, useState } from "react";
import { FileDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { ADMIN_NAV, ROLE_LABELS, type StaffAppointment } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, btnPrimary, btnSecondary, inputClass, selectClass } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { isStaffRole } from "@/lib/credentials";
import { downloadAppointmentLetter } from "@/lib/appointment-letter";
import { addNotification } from "@/lib/notification-store";
import { useFinanceStore } from "@/lib/finance-store";
import { nextEmployeeId, useSchoolStore } from "@/lib/school-store";
import { formatCurrency } from "@/lib/utils";

const fieldClass = inputClass;

const EMPTY_FORM = {
  userId: "",
  employeeId: "",
  designation: "",
  jobDescription: "",
  appointmentDate: new Date().toISOString().slice(0, 10),
  startDate: new Date().toISOString().slice(0, 10),
  basicSalary: "",
  allowances: "0",
  deductions: "0",
  bankAccount: "",
};

export default function AdminAppointmentsPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const users = useSchoolStore((s) => s.users);
  const appointments = useSchoolStore((s) => s.appointments);
  const settings = useSchoolStore((s) => s.settings);
  const issueAppointment = useSchoolStore((s) => s.issueAppointment);
  const updateAppointment = useSchoolStore((s) => s.updateAppointment);
  const withdrawAppointment = useSchoolStore((s) => s.withdrawAppointment);
  const upsertStaffFromAppointment = useFinanceStore((s) => s.upsertStaffFromAppointment);
  const deleteStaffByAppointment = useFinanceStore((s) => s.deleteStaffByAppointment);

  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const staffUsers = useMemo(
    () => (users ?? []).filter((u) => isStaffRole(u.role) && u.status === "Active"),
    [users]
  );
  const issued = (appointments ?? []).filter((a) => a.status === "issued");
  const availableUsers = staffUsers.filter(
    (u) => mode === "edit" || !issued.some((a) => a.userId === u.id)
  );

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const closeForm = () => {
    setMode("closed");
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      userId: availableUsers[0]?.id ?? "",
      employeeId: nextEmployeeId(appointments ?? []),
    });
    setError("");
    setNotice("");
    setMode("create");
  };

  const openEdit = (appointment: StaffAppointment) => {
    setEditingId(appointment.id);
    setForm({
      userId: appointment.userId,
      employeeId: appointment.employeeId,
      designation: appointment.designation,
      jobDescription: appointment.jobDescription,
      appointmentDate: appointment.appointmentDate,
      startDate: appointment.startDate,
      basicSalary: String(appointment.basicSalary),
      allowances: String(appointment.allowances),
      deductions: String(appointment.deductions),
      bankAccount: appointment.bankAccount,
    });
    setError("");
    setMode("edit");
  };

  const notifyFinance = (appointment: StaffAppointment) => {
    const officers = (users ?? []).filter((u) => u.role === "account_officer" && u.status === "Active");
    officers.forEach((officer) => {
      if (!officer.email) return;
      addNotification({
        userEmail: officer.email,
        title: `Appointment issued: ${appointment.name}`,
        body: `${appointment.designation} · net ${formatCurrency(appointment.basicSalary + appointment.allowances - appointment.deductions)}`,
        href: "/finance/payroll",
      });
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      userId: form.userId,
      employeeId: form.employeeId.trim(),
      designation: form.designation.trim(),
      jobDescription: form.jobDescription.trim(),
      appointmentDate: form.appointmentDate,
      startDate: form.startDate,
      basicSalary: Number(form.basicSalary) || 0,
      allowances: Number(form.allowances) || 0,
      deductions: Number(form.deductions) || 0,
      bankAccount: form.bankAccount.trim(),
    };
    const result =
      mode === "edit" && editingId
        ? updateAppointment(editingId, payload)
        : issueAppointment(payload);
    if (!result.ok || !result.appointment) {
      setError(result.error ?? "Could not save this appointment.");
      return;
    }
    upsertStaffFromAppointment(result.appointment);
    if (mode === "create") notifyFinance(result.appointment);
    setNotice(
      mode === "edit"
        ? `Updated appointment for ${result.appointment.name}. Payroll has been aligned.`
        : `Issued appointment for ${result.appointment.name}. Finance can now manage this salary on Payroll.`
    );
    closeForm();
  };

  const handleWithdraw = (appointment: StaffAppointment) => {
    const ok = window.confirm(
      `Withdraw the appointment for ${appointment.name}? They will be removed from the salary register.`
    );
    if (!ok) return;
    const result = withdrawAppointment(appointment.id);
    if (!result.ok) {
      window.alert(result.error ?? "Could not withdraw this appointment.");
      return;
    }
    deleteStaffByAppointment(appointment.id);
    if (editingId === appointment.id) closeForm();
    setNotice(`Appointment for ${appointment.name} withdrawn.`);
  };

  const handleLetter = async (appointment: StaffAppointment) => {
    setBusyId(appointment.id);
    try {
      const user = users.find((u) => u.id === appointment.userId);
      await downloadAppointmentLetter(appointment, settings, user);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Staff appointments"
        description="Issue an appointment before payroll can be set. The letter includes terms of service, school rules, job description, and remuneration."
        action={
          <button type="button" onClick={openCreate} disabled={!availableUsers.length} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> Issue appointment
          </button>
        }
      />

      {!availableUsers.length && mode === "closed" && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add an active teacher or officer on Users before you can issue an appointment.
        </div>
      )}
      {notice && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}

      {mode !== "closed" && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display font-semibold text-slate-900">
              {mode === "edit" ? "Edit appointment" : "Issue appointment"}
            </h3>
            <button type="button" onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Staff member">
              <select
                className={selectClass}
                value={form.userId}
                disabled={mode === "edit"}
                onChange={(e) => setForm({ ...form, userId: e.target.value })}
                required
              >
                <option value="">Select staff</option>
                {(mode === "edit" ? staffUsers : availableUsers).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {ROLE_LABELS[u.role]}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Employee ID">
              <input className={fieldClass} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} required />
            </FormField>
            <FormField label="Designation / job title">
              <input className={fieldClass} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} required placeholder="Class Teacher, Primary 1" />
            </FormField>
            <FormField label="Appointment date">
              <input type="date" className={fieldClass} value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} required />
            </FormField>
            <FormField label="Start date">
              <input type="date" className={fieldClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            </FormField>
            <FormField label="Basic salary (monthly)">
              <input type="number" min={1} className={fieldClass} value={form.basicSalary} onChange={(e) => setForm({ ...form, basicSalary: e.target.value })} required />
            </FormField>
            <FormField label="Allowances">
              <input type="number" min={0} className={fieldClass} value={form.allowances} onChange={(e) => setForm({ ...form, allowances: e.target.value })} />
            </FormField>
            <FormField label="Deductions">
              <input type="number" min={0} className={fieldClass} value={form.deductions} onChange={(e) => setForm({ ...form, deductions: e.target.value })} />
            </FormField>
            <FormField label="Bank account / details">
              <input className={fieldClass} value={form.bankAccount} onChange={(e) => setForm({ ...form, bankAccount: e.target.value })} placeholder="Bank name and account number" />
            </FormField>
          </div>
          <FormField label="Job description">
            <textarea
              className={`${fieldClass} mt-4 min-h-[110px]`}
              value={form.jobDescription}
              onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
              required
            />
          </FormField>
          <p className="mt-3 text-xs text-slate-500">
            Terms of service and school rules from School Settings are printed on the appointment letter.
          </p>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>
              {mode === "edit" ? "Save appointment" : "Issue appointment"}
            </button>
            <button type="button" onClick={closeForm} className={btnSecondary}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <DataTable headers={["Employee ID", "Name", "Designation", "Net pay", "Status", "Actions"]}>
        {(appointments ?? []).map((appointment) => (
          <tr key={appointment.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 font-medium">{appointment.employeeId}</td>
            <td className="px-6 py-4">{appointment.name}</td>
            <td className="px-6 py-4 text-slate-500">{appointment.designation}</td>
            <td className="px-6 py-4 font-semibold text-emerald-700">
              {formatCurrency(appointment.basicSalary + appointment.allowances - appointment.deductions)}
            </td>
            <td className="px-6 py-4">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${appointment.status === "issued" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {appointment.status}
              </span>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void handleLetter(appointment)}
                  disabled={busyId === appointment.id}
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50"
                >
                  <FileDown className="h-4 w-4" /> Letter
                </button>
                {appointment.status === "issued" && (
                  <>
                    <button type="button" onClick={() => openEdit(appointment)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100">
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button type="button" onClick={() => handleWithdraw(appointment)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Withdraw
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </DataTable>
    </PortalShell>
  );
}
