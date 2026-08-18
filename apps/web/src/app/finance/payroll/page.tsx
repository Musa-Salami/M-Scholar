"use client";

import { useState } from "react";
import { Play, CheckCircle } from "lucide-react";
import { FINANCE_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, btnPrimary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function PayrollPage() {
  useRequireAuth(["account_officer"]);
  const { staff, payrollRuns, runPayroll, markPayrollPaid } = useFinanceStore();
  const [month, setMonth] = useState(MONTHS[new Date().getMonth()]);
  const [year, setYear] = useState(new Date().getFullYear());

  const totalMonthly = staff.reduce(
    (s, m) => s + m.basicSalary + m.allowances - m.deductions,
    0
  );

  const handleRun = () => {
    runPayroll(month, year);
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Account Officer Portal">
      <PageHeader title="Payroll" description="Manage staff salaries and process monthly payroll." />

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
          <button onClick={handleRun} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Play className="h-4 w-4" /> Run payroll
          </button>
        </div>
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">Staff salary register</h3>
      <DataTable headers={["Employee ID", "Name", "Designation", "Basic", "Allowances", "Deductions", "Net Pay", "Bank"]}>
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
