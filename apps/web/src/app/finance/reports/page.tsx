"use client";

import { FINANCE_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, StatusBadge } from "@/components/finance-ui";
import { downloadCsv, ExportButton } from "@/components/receipt-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  useRequireAuth(["account_officer"]);
  const { invoices, payments, income, expenditure, staff, payrollRuns, getStudent, stats } = useFinanceStore();
  const s = stats();

  const debtors = invoices.filter((i) => i.balance > 0);

  const exportFeeCollection = () => {
    downloadCsv(
      "fee-collection-report.csv",
      ["Receipt", "Student", "Amount", "Date"],
      payments.map((p) => {
        const student = getStudent(p.studentId);
        return [p.receiptNo, student?.name ?? "", String(p.amount), p.paidAt.slice(0, 10)];
      })
    );
  };

  const exportDebtors = () => {
    downloadCsv(
      "outstanding-fees.csv",
      ["Invoice", "Student", "Class", "Balance", "Status", "Due Date"],
      debtors.map((i) => {
        const student = getStudent(i.studentId);
        return [i.invoiceNo, student?.name ?? "", student?.className ?? "", String(i.balance), i.status, i.dueDate];
      })
    );
  };

  const exportIncomeExpenditure = () => {
    const rows = [
      ...income.map((r) => ["Income", r.date, r.description, String(r.amount)]),
      ...expenditure.map((r) => ["Expenditure", r.date, r.description, String(-r.amount)]),
    ];
    downloadCsv("income-expenditure.csv", ["Type", "Date", "Description", "Amount"], rows);
  };

  const exportPayroll = () => {
    downloadCsv(
      "payroll-summary.csv",
      ["Employee ID", "Name", "Designation", "Net Pay"],
      staff.map((m) => [
        m.employeeId,
        m.name,
        m.designation,
        String(m.basicSalary + m.allowances - m.deductions),
      ])
    );
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Finance Officer Portal">
      <PageHeader title="Financial Reports" description="Generate and export financial reports." />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-sm text-slate-500">Net balance</p>
          <p className={`font-display text-2xl font-bold ${s.netBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            {formatCurrency(s.netBalance)}
          </p>
        </div>
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-sm text-slate-500">Fee collection</p>
          <p className="font-display text-2xl font-bold text-slate-900">{formatCurrency(s.feeCollection)}</p>
        </div>
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-sm text-slate-500">Outstanding fees</p>
          <p className="font-display text-2xl font-bold text-red-700">{formatCurrency(s.outstanding)}</p>
        </div>
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
          <p className="text-sm text-slate-500">Payroll runs</p>
          <p className="font-display text-2xl font-bold text-slate-900">{payrollRuns.length}</p>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        {[
          { title: "Fee Collection Report", desc: "All recorded fee payments", action: exportFeeCollection },
          { title: "Outstanding Balances", desc: "Debtors list by invoice", action: exportDebtors },
          { title: "Income vs Expenditure", desc: "Combined ledger export", action: exportIncomeExpenditure },
          { title: "Payroll Summary", desc: "Staff net pay register", action: exportPayroll },
        ].map(({ title, desc, action }) => (
          <div key={title} className="card-shadow flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5">
            <div>
              <h4 className="font-semibold text-slate-900">{title}</h4>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
            <ExportButton onClick={action} />
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">Outstanding fees (debtors)</h3>
      <DataTable headers={["Invoice", "Student", "Class", "Balance", "Status", "Due"]}>
        {debtors.map((inv) => {
          const student = getStudent(inv.studentId);
          return (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 text-slate-500">{student?.className ?? "—"}</td>
              <td className="px-6 py-4 font-medium text-red-700">{formatCurrency(inv.balance)}</td>
              <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
            </tr>
          );
        })}
      </DataTable>
    </PortalShell>
  );
}
