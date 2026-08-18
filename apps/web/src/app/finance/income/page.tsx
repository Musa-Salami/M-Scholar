"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { FINANCE_NAV, INCOME_SOURCE_LABELS, type IncomeSource } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, inputClass, selectClass, btnPrimary, btnSecondary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { formatCurrency } from "@/lib/utils";

export default function IncomePage() {
  useRequireAuth(["account_officer"]);
  const { income, addIncome } = useFinanceStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    source: "other" as IncomeSource,
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
    reference: "",
  });

  const total = income.reduce((s, r) => s + r.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addIncome({
      source: form.source,
      description: form.description,
      amount: Number(form.amount),
      date: form.date,
      reference: form.reference,
    });
    setForm({ source: "other", description: "", amount: "", date: new Date().toISOString().slice(0, 10), reference: "" });
    setShowForm(false);
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Account Officer Portal">
      <PageHeader
        title="Income"
        description="Track all school income sources."
        action={
          <button onClick={() => setShowForm(true)} className={`inline-flex items-center gap-2 ${btnPrimary}`}>
            <Plus className="h-4 w-4" /> Record income
          </button>
        }
      />

      <div className="card-shadow mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
        <p className="text-sm text-emerald-700">Total income recorded</p>
        <p className="font-display text-3xl font-bold text-emerald-800">{formatCurrency(total)}</p>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Source">
              <select className={selectClass} value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value as IncomeSource })}>
                {Object.entries(INCOME_SOURCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Amount">
              <input type="number" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required min={1} />
            </FormField>
            <FormField label="Description">
              <input className={inputClass} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </FormField>
            <FormField label="Date">
              <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </FormField>
            <FormField label="Reference">
              <input className={inputClass} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} required />
            </FormField>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary}>Save</button>
            <button type="button" onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
          </div>
        </form>
      )}

      <DataTable headers={["Date", "Source", "Description", "Reference", "Amount"]}>
        {[...income].reverse().map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className="px-6 py-4 text-slate-500">{r.date}</td>
            <td className="px-6 py-4">{INCOME_SOURCE_LABELS[r.source]}</td>
            <td className="px-6 py-4">{r.description}</td>
            <td className="px-6 py-4 text-slate-500">{r.reference}</td>
            <td className="px-6 py-4 font-medium text-emerald-700">{formatCurrency(r.amount)}</td>
          </tr>
        ))}
      </DataTable>
    </PortalShell>
  );
}
