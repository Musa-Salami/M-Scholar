"use client";

import { useState } from "react";
import { Download, X } from "lucide-react";
import type { InvoiceStatus, Payment } from "@m-scholar/shared";
import { PAYMENT_METHOD_LABELS } from "@m-scholar/shared";
import { formatCurrency } from "@/lib/utils";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { SimplePdf, formatPdfMoney } from "@/lib/pdf";
import { DocumentLetterhead } from "@/components/document-letterhead";

interface ReceiptModalProps {
  payment: Payment;
  onClose: () => void;
}

export function receiptStamp(status?: InvoiceStatus, balance?: number): {
  label: "PAID" | "PARTIALLY PAID";
  rgb: [number, number, number];
  tone: string;
} {
  const paid = status === "paid" || (typeof balance === "number" && balance <= 0);
  if (paid) {
    return { label: "PAID", rgb: [5, 150, 105], tone: "text-emerald-600/20" };
  }
  return { label: "PARTIALLY PAID", rgb: [217, 119, 6], tone: "text-amber-600/20" };
}

export function ReceiptModal({ payment, onClose }: ReceiptModalProps) {
  const [busy, setBusy] = useState(false);
  const getStudent = useFinanceStore((s) => s.getStudent);
  const invoices = useFinanceStore((s) => s.invoices);
  const settings = useSchoolStore((s) => s.settings);
  const student = getStudent(payment.studentId);
  const invoice = invoices.find((i) => i.id === payment.invoiceId);
  const stamp = receiptStamp(invoice?.status, invoice?.balance);

  const downloadPdf = async () => {
    setBusy(true);
    try {
      const pdf = new SimplePdf();
      pdf.setBrand({
        schoolName: settings.schoolName,
        motto: settings.motto,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        accent: "emerald",
        documentType: "Fee receipt",
      });
      pdf.setWatermark(stamp.label, stamp.rgb);
      pdf.heading("Official Fee Receipt", stamp.label);
      pdf.keyValues([
        ["Receipt No.", payment.receiptNo],
        ["Invoice No.", invoice?.invoiceNo ?? "—"],
        ["Date", new Date(payment.paidAt).toLocaleString()],
        ["Student", student?.name ?? "—"],
        ["Admission No.", student?.admissionNo ?? "—"],
        ["Class", student?.className ?? "—"],
        ["Payment method", PAYMENT_METHOD_LABELS[payment.method]],
        ["Reference", payment.reference],
        ["Invoice total", formatPdfMoney(invoice?.totalAmount ?? payment.amount)],
        ["Balance remaining", formatPdfMoney(invoice?.balance ?? 0)],
      ]);
      pdf.callout("Amount paid", formatPdfMoney(payment.amount));
      pdf.paragraph(
        `Received by ${payment.recordedBy}. Keep this receipt as an official record of payment.`
      );
      await pdf.save(`${payment.receiptNo}.pdf`);
    } finally {
      setBusy(false);
    }
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

        <div className="relative overflow-hidden p-6">
          <div className={`pointer-events-none absolute inset-0 flex items-center justify-center ${stamp.tone}`}>
            <span className="rotate-[-28deg] text-6xl font-black tracking-[0.35em]">{stamp.label}</span>
          </div>
          <DocumentLetterhead subtitle="Official fee payment receipt" />
          <p
            className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              stamp.label === "PAID" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            }`}
          >
            {stamp.label}
          </p>

          <table className="relative mt-4 w-full text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Receipt No.</td>
                <td className="py-2 text-right font-medium">{payment.receiptNo}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Invoice No.</td>
                <td className="py-2 text-right">{invoice?.invoiceNo ?? "—"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Date</td>
                <td className="py-2 text-right">{new Date(payment.paidAt).toLocaleString()}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Student</td>
                <td className="py-2 text-right">{student?.name ?? "—"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Admission No.</td>
                <td className="py-2 text-right">{student?.admissionNo ?? "—"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Class</td>
                <td className="py-2 text-right">{student?.className ?? "—"}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Payment method</td>
                <td className="py-2 text-right">{PAYMENT_METHOD_LABELS[payment.method]}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Reference</td>
                <td className="py-2 text-right">{payment.reference}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 font-semibold">Amount paid</td>
                <td className="py-2 text-right font-semibold text-emerald-700">{formatCurrency(payment.amount)}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">Balance remaining</td>
                <td className="py-2 text-right">{formatCurrency(invoice?.balance ?? 0)}</td>
              </tr>
            </tbody>
          </table>

          <p className="relative mt-6 text-xs text-slate-500">
            Received by: {payment.recordedBy}
            <br />
            Keep this PDF receipt for your records.
          </p>
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-100 p-4 sm:flex-row">
          <button
            onClick={downloadPdf}
            disabled={busy}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
          <button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function PdfCsvButtons({ onPdf, onCsv }: { onPdf: () => void; onCsv: () => void }) {
  return (
    <div className="flex shrink-0 gap-2">
      <button
        type="button"
        onClick={onPdf}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
      >
        <Download className="h-4 w-4" /> PDF
      </button>
      <button
        type="button"
        onClick={onCsv}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        CSV
      </button>
    </div>
  );
}
