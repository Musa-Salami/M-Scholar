"use client";

import { useRef } from "react";
import { Download, Printer, X } from "lucide-react";
import type { Payment } from "@m-scholar/shared";
import { PAYMENT_METHOD_LABELS } from "@m-scholar/shared";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/lib/finance-store";

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const getStudent = useFinanceStore((s) => s.getStudent);
  const student = getStudent(payment.studentId);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt ${payment.receiptNo}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
        h1 { color: #059669; margin-bottom: 4px; }
        .meta { color: #64748b; font-size: 14px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .total { font-size: 18px; font-weight: bold; }
        .footer { margin-top: 32px; font-size: 12px; color: #64748b; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="font-display font-semibold text-slate-900">Payment Receipt</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div ref={printRef} className="p-6">
          <h1 className="text-xl font-bold text-emerald-700">M-Scholar Demo Academy</h1>
          <p className="meta text-sm text-slate-500">Official Fee Payment Receipt</p>

          <table>
            <tbody>
              <tr><td>Receipt No.</td><td className="text-right font-medium">{payment.receiptNo}</td></tr>
              <tr><td>Date</td><td className="text-right">{new Date(payment.paidAt).toLocaleString()}</td></tr>
              <tr><td>Student</td><td className="text-right">{student?.name ?? "—"}</td></tr>
              <tr><td>Admission No.</td><td className="text-right">{student?.admissionNo ?? "—"}</td></tr>
              <tr><td>Class</td><td className="text-right">{student?.className ?? "—"}</td></tr>
              <tr><td>Payment Method</td><td className="text-right">{PAYMENT_METHOD_LABELS[payment.method]}</td></tr>
              <tr><td>Reference</td><td className="text-right">{payment.reference}</td></tr>
              <tr>
                <td className="total">Amount Paid</td>
                <td className="total text-right text-emerald-700">{formatCurrency(payment.amount)}</td>
              </tr>
            </tbody>
          </table>

          <p className="footer text-xs text-slate-500">
            Received by: {payment.recordedBy}<br />
            Thank you for your payment. Keep this receipt for your records.
          </p>
        </div>

        <div className="flex gap-3 border-t border-slate-100 p-4">
          <button onClick={handlePrint} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function downloadCsv(filename: string, headers: string[], rows: string[][]) {
  const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ onClick, label = "Export CSV" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      <Download className="h-4 w-4" /> {label}
    </button>
  );
}
