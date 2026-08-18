"use client";

import { useState } from "react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, StatusBadge } from "@/components/finance-ui";
import { ReceiptModal } from "@/components/receipt-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@m-scholar/shared";

export default function PortalFeesPage() {
  useRequireAuth(["parent", "student"]);
  const { user } = useAuthStore();
  const { getInvoicesForParent, getPaymentsForParent, getStudent } = useFinanceStore();
  const [receipt, setReceipt] = useState<Payment | null>(null);

  const email = user?.email ?? "";
  const invoices = getInvoicesForParent(email);
  const payments = getPaymentsForParent(email);
  const totalDue = invoices.reduce((s, i) => s + i.balance, 0);

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader
        title="Fees & Payments"
        description="View invoices, outstanding dues, and download payment receipts."
      />

      <div className="card-shadow mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <p className="text-sm text-sky-700">Total outstanding balance</p>
        <p className="font-display text-3xl font-bold text-sky-900">{formatCurrency(totalDue)}</p>
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">Invoices</h3>
      <DataTable headers={["Invoice", "Student", "Term", "Total", "Paid", "Balance", "Status", "Due"]}>
        {invoices.map((inv) => {
          const student = getStudent(inv.studentId);
          return (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 text-slate-500">{inv.term}</td>
              <td className="px-6 py-4">{formatCurrency(inv.totalAmount)}</td>
              <td className="px-6 py-4">{formatCurrency(inv.amountPaid)}</td>
              <td className="px-6 py-4 font-medium">{formatCurrency(inv.balance)}</td>
              <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
            </tr>
          );
        })}
      </DataTable>

      <h3 className="mb-4 mt-8 font-display font-semibold text-slate-900">Payment history & receipts</h3>
      <DataTable headers={["Receipt", "Student", "Amount", "Date", ""]}>
        {payments.map((pay) => {
          const student = getStudent(pay.studentId);
          return (
            <tr key={pay.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{pay.receiptNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 font-medium text-emerald-700">{formatCurrency(pay.amount)}</td>
              <td className="px-6 py-4 text-slate-500">{new Date(pay.paidAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <button onClick={() => setReceipt(pay)} className="text-sm font-medium text-sky-600 hover:underline">
                  Download receipt
                </button>
              </td>
            </tr>
          );
        })}
      </DataTable>

      {receipt && <ReceiptModal payment={receipt} onClose={() => setReceipt(null)} />}
    </PortalShell>
  );
}
