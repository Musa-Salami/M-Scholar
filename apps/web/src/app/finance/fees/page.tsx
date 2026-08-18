"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FEE_CATEGORIES, type FeeCategory } from "@m-scholar/shared";
import { FINANCE_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, inputClass, selectClass, btnPrimary, btnSecondary, StatusBadge } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";

export default function FeesPage() {
  useRequireAuth(["account_officer"]);
  const { feeStructures, invoices, addFeeStructure, generateInvoices, getStudent } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    className: "JSS 2A",
    term: "First Term",
    session: "2025/2026",
    items: [{ category: "Tuition" as FeeCategory, amount: 0 }],
  });
  const [toast, setToast] = useState("");

  const handleAddItem = () => {
    setForm((f) => ({ ...f, items: [...f.items, { category: "Tuition", amount: 0 }] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addFeeStructure(form);
    setShowForm(false);
    setForm({ name: "", className: "JSS 2A", term: "First Term", session: "2025/2026", items: [{ category: "Tuition", amount: 0 }] });
    setToast("Fee structure created.");
    setTimeout(() => setToast(""), 3000);
  };

  const handleGenerate = (id: string) => {
    const count = generateInvoices(id);
    setToast(count > 0 ? `Generated ${count} invoice(s).` : "All students in this class already have invoices.");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Account Officer Portal">
      <PageHeader
        title="Fees & Invoices"
        description="Define fee structures and generate student invoices."
        action={
          <button onClick={() => setShowForm(true)} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> New fee structure
          </button>
        }
      />

      {toast && (
        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">New fee structure</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Structure name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="JSS 2A — First Term" />
            </FormField>
            <FormField label="Class">
              <select className={selectClass} value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
                {["JSS 1A", "JSS 2A", "SS 1 Science", "SS 2 Arts"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Term">
              <input className={inputClass} value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} required />
            </FormField>
            <FormField label="Session">
              <input className={inputClass} value={form.session} onChange={(e) => setForm({ ...form, session: e.target.value })} required />
            </FormField>
          </div>

          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-slate-700">Fee items</p>
            {form.items.map((item, idx) => (
              <div key={idx} className="mb-2 flex gap-2">
                <select
                  className={selectClass}
                  value={item.category}
                  onChange={(e) => {
                    const items = [...form.items];
                    items[idx] = { ...items[idx], category: e.target.value as FeeCategory };
                    setForm({ ...form, items });
                  }}
                >
                  {FEE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className={inputClass}
                  value={item.amount || ""}
                  onChange={(e) => {
                    const items = [...form.items];
                    items[idx] = { ...items[idx], amount: Number(e.target.value) };
                    setForm({ ...form, items });
                  }}
                  placeholder="Amount"
                  required
                  min={0}
                />
              </div>
            ))}
            <button type="button" onClick={handleAddItem} className="text-sm text-emerald-600 hover:underline">
              + Add fee item
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>Save structure</button>
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <h3 className="mb-4 font-display font-semibold text-slate-900">Fee structures</h3>
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {feeStructures.map((fs) => (
          <div key={fs.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
            <h4 className="font-semibold text-slate-900">{fs.name}</h4>
            <p className="text-sm text-slate-500">{fs.className} · {fs.term}</p>
            <ul className="mt-3 space-y-1 text-sm text-slate-600">
              {fs.items.map((item) => (
                <li key={item.category} className="flex justify-between">
                  <span>{item.category}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold text-emerald-700">Total: {formatCurrency(fs.totalAmount)}</p>
            <button onClick={() => handleGenerate(fs.id)} className={`mt-4 w-full ${btnPrimary}`}>
              Generate invoices
            </button>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">All invoices</h3>
      <DataTable headers={["Invoice", "Student", "Class", "Total", "Paid", "Balance", "Status", "Due"]}>
        {invoices.map((inv) => {
          const student = getStudent(inv.studentId);
          return (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 text-slate-500">{student?.className ?? "—"}</td>
              <td className="px-6 py-4">{formatCurrency(inv.totalAmount)}</td>
              <td className="px-6 py-4">{formatCurrency(inv.amountPaid)}</td>
              <td className="px-6 py-4 font-medium">{formatCurrency(inv.balance)}</td>
              <td className="px-6 py-4"><StatusBadge status={inv.status} /></td>
              <td className="px-6 py-4 text-slate-500">{inv.dueDate}</td>
            </tr>
          );
        })}
      </DataTable>
    </PortalShell>
  );
}
