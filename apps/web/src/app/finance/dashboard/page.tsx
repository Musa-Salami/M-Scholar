"use client";

import { Receipt, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { FINANCE_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { StatusBadge } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";

export default function FinanceDashboardPage() {
  const { ready } = useRequireAuth(["account_officer"]);
  const invoices = useFinanceStore((s) => s.invoices ?? []);
  const payments = useFinanceStore((s) => s.payments ?? []);
  const income = useFinanceStore((s) => s.income ?? []);
  const expenditure = useFinanceStore((s) => s.expenditure ?? []);
  const stats = useFinanceStore((s) => s.stats);
  const getStudent = useFinanceStore((s) => s.getStudent);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const s = stats();

  const collectionRate = invoices.length
    ? Math.round((invoices.filter((i) => i.status === "paid").length / invoices.length) * 100)
    : 0;

  const recentPayments = [...payments].reverse().slice(0, 5);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  return (
    <PortalShell navItems={FINANCE_NAV} title="Finance Officer Portal">
      <PageHeader title="Finance Dashboard" description="Income, expenditure, fees, and payroll overview." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Fee Collection" value={formatCurrency(s.feeCollection)} change={`${collectionRate}% invoices fully paid`} icon={Receipt} accent="emerald" />
        <StatCard title="Outstanding Fees" value={formatCurrency(s.outstanding)} change={`${overdueCount} overdue`} icon={TrendingDown} accent="red" />
        <StatCard title="This Month Income" value={formatCurrency(s.monthlyIncome)} icon={TrendingUp} accent="blue" />
        <StatCard title="Payroll Due" value={formatCurrency(s.payrollDue)} change="Monthly estimate" icon={Wallet} accent="amber" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Recent payments</h3>
          <div className="mt-4 space-y-3">
            {recentPayments.map((pay) => {
              const student = getStudent(pay.studentId);
              return (
                <div key={pay.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{student?.name}</p>
                    <p className="text-xs text-slate-500">{pay.receiptNo}</p>
                  </div>
                  <span className="font-semibold text-emerald-700">{formatCurrency(pay.amount)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Financial summary</h3>
          <div className="mt-4 space-y-4">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total income</span>
              <span className="font-medium text-emerald-700">{formatCurrency(income.reduce((a, r) => a + r.amount, 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Total expenditure</span>
              <span className="font-medium text-red-700">{formatCurrency(expenditure.reduce((a, r) => a + r.amount, 0))}</span>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between">
              <span className="font-medium text-slate-900">Net balance</span>
              <span className={`font-bold ${s.netBalance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                {formatCurrency(s.netBalance)}
              </span>
            </div>
          </div>

          <h4 className="mt-6 mb-3 text-sm font-semibold text-slate-700">Invoices by status</h4>
          <div className="flex flex-wrap gap-2">
            {(["pending", "partial", "paid", "overdue"] as const).map((status) => {
              const count = invoices.filter((i) => i.status === status).length;
              return (
                <div key={status} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                  <StatusBadge status={status} />
                  <span className="text-sm font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
