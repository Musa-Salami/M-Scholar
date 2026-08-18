"use client";

import { useState } from "react";
import { FINANCE_NAV, PAYMENT_METHOD_LABELS, type PaymentMethod } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, inputClass, selectClass, btnPrimary } from "@/components/finance-ui";
import { ReceiptModal } from "@/components/receipt-modal";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";
import type { Payment } from "@m-scholar/shared";

export default function PaymentsPage() {
  useRequireAuth(["account_officer"]);
  const { user } = useAuthStore();
  const { invoices, payments, recordPayment, getStudent } = useFinanceStore();
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("transfer");
  const [reference, setReference] = useState("");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [error, setError] = useState("");

  const unpaid = invoices.filter((i) => i.balance > 0);
  const selected = invoices.find((i) => i.id === selectedInvoice);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const payment = recordPayment({
      invoiceId: selectedInvoice,
      amount: Number(amount),
      method,
      reference,
      recordedBy: user ? `${user.firstName} ${user.lastName}` : "Account Officer",
    });
    if (!payment) {
      setError("Invalid payment amount or invoice.");
      return;
    }
    setReceipt(payment);
    setAmount("");
    setReference("");
    setSelectedInvoice("");
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Finance Officer Portal">
      <PageHeader title="Payments" description="Record fee payments and issue receipts." />

      <form onSubmit={handleSubmit} className="card-shadow mb-8 rounded-2xl border border-slate-100 bg-white p-6">
        <h3 className="font-display font-semibold text-slate-900">Record payment</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <FormField label="Invoice">
            <select className={selectClass} value={selectedInvoice} onChange={(e) => setSelectedInvoice(e.target.value)} required>
              <option value="">Select invoice…</option>
              {unpaid.map((inv) => {
                const student = getStudent(inv.studentId);
                return (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNo} — {student?.name} (Balance: {formatCurrency(inv.balance)})
                  </option>
                );
              })}
            </select>
          </FormField>
          <FormField label="Amount">
            <input
              type="number"
              className={inputClass}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={selected?.balance}
              min={1}
              required
              placeholder={selected ? `Max ${selected.balance}` : ""}
            />
          </FormField>
          <FormField label="Payment method">
            <select className={selectClass} value={method} onChange={(e) => setMethod(e.target.value as PaymentMethod)}>
              {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Reference">
            <input className={inputClass} value={reference} onChange={(e) => setReference(e.target.value)} required placeholder="TXN-12345" />
          </FormField>
        </div>
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button type="submit" className={`mt-4 ${btnPrimary}`} disabled={!selectedInvoice}>
          Record payment & generate receipt
        </button>
      </form>

      <h3 className="mb-4 font-display font-semibold text-slate-900">Payment history</h3>
      <DataTable headers={["Receipt", "Student", "Amount", "Method", "Reference", "Date", ""]}>
        {[...payments].reverse().map((pay) => {
          const student = getStudent(pay.studentId);
          return (
            <tr key={pay.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{pay.receiptNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 font-medium text-emerald-700">{formatCurrency(pay.amount)}</td>
              <td className="px-6 py-4">{PAYMENT_METHOD_LABELS[pay.method]}</td>
              <td className="px-6 py-4 text-slate-500">{pay.reference}</td>
              <td className="px-6 py-4 text-slate-500">{new Date(pay.paidAt).toLocaleDateString()}</td>
              <td className="px-6 py-4">
                <button onClick={() => setReceipt(pay)} className="text-sm font-medium text-emerald-600 hover:underline">
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
