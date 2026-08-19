"use client";

import { useState } from "react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, StatusBadge } from "@/components/finance-ui";
import { InvoiceItemsList } from "@/components/invoice-items";
import { ReceiptModal } from "@/components/receipt-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { studentLinkedToUser } from "@/lib/credentials";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@m-scholar/shared";

export default function PortalFeesPage() {
  const { ready, user } = useRequireAuth(["parent", "student"]);
  const students = useFinanceStore((s) => s.students ?? []);
  const invoicesAll = useFinanceStore((s) => s.invoices ?? []);
  const paymentsAll = useFinanceStore((s) => s.payments ?? []);
  const getInvoiceItems = useFinanceStore((s) => s.getInvoiceItems);
  const [receipt, setReceipt] = useState<Payment | null>(null);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const linked = students.filter((st) => studentLinkedToUser(st, user));
  const ids = new Set(linked.map((s) => s.id));
  const invoices = invoicesAll.filter((i) => ids.has(i.studentId));
  const payments = paymentsAll.filter((p) => ids.has(p.studentId));
  const totalDue = invoices.reduce((s, i) => s + (i.balance || 0), 0);

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader
        title="Fees & Payments"
        description="See every fee item on each invoice, outstanding dues, and download receipts that match the bill."
      />

      <div className="card-shadow mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
        <p className="text-sm text-sky-700">Total outstanding balance</p>
        <p className="font-display text-3xl font-bold text-sky-900">{formatCurrency(totalDue)}</p>
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">Invoices</h3>
      <div className="space-y-4">
        {invoices.map((inv) => {
          const student = linked.find((st) => st.id === inv.studentId) ?? students.find((st) => st.id === inv.studentId);
          const items = getInvoiceItems(inv);
          return (
            <div key={inv.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{inv.invoiceNo}</p>
                  <p className="text-sm text-slate-500">
                    {student?.name ?? "—"} · {inv.structureName || inv.term} · {inv.session}
                  </p>
                </div>
                <StatusBadge status={inv.status} />
              </div>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">What this invoice covers</p>
              <InvoiceItemsList items={items} totalAmount={inv.totalAmount} className="mt-2" />
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>Paid {formatCurrency(inv.amountPaid)}</span>
                <span className="font-medium text-slate-900">Balance {formatCurrency(inv.balance)}</span>
                <span>Due {inv.dueDate}</span>
              </div>
            </div>
          );
        })}
        {invoices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
            No invoices yet. Fee items will appear here after the school generates them.
          </div>
        )}
      </div>

      <h3 className="mb-4 mt-8 font-display font-semibold text-slate-900">Payment history & receipts</h3>
      <DataTable headers={["Receipt", "Student", "Amount", "Date", ""]}>
        {payments.map((pay) => {
          const student = students.find((st) => st.id === pay.studentId);
          return (
            <tr key={pay.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{pay.receiptNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 font-medium text-emerald-700">{formatCurrency(pay.amount)}</td>
              <td className="px-6 py-4 text-slate-500">{new Date(pay.paidAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <button onClick={() => setReceipt(pay)} className="text-sm font-medium text-sky-600 hover:underline">
                  View receipt
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
