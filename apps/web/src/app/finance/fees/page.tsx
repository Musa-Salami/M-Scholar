"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { FEE_CATEGORIES, feeItemLabel, type FeeCategory, type FeeItem, type FeeStructure } from "@m-scholar/shared";
import { FINANCE_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { DataTable, FormField, inputClass, selectClass, btnPrimary, btnSecondary, StatusBadge } from "@/components/finance-ui";
import { InvoiceItemsList } from "@/components/invoice-items";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { formatCurrency } from "@/lib/utils";

const emptyItem = (): FeeItem => ({ category: "Tuition", name: "", amount: 0 });

export default function FeesPage() {
  useRequireAuth(["account_officer"]);
  const feeStructures = useFinanceStore((s) => s.feeStructures);
  const invoices = useFinanceStore((s) => s.invoices);
  const addFeeStructure = useFinanceStore((s) => s.addFeeStructure);
  const updateFeeStructure = useFinanceStore((s) => s.updateFeeStructure);
  const deleteFeeStructure = useFinanceStore((s) => s.deleteFeeStructure);
  const generateInvoices = useFinanceStore((s) => s.generateInvoices);
  const getStudent = useFinanceStore((s) => s.getStudent);
  const getInvoiceItems = useFinanceStore((s) => s.getInvoiceItems);
  const classes = useSchoolStore((s) => s.classes);
  const settings = useSchoolStore((s) => s.settings);
  const classNames = classes.map((c) => c.name);
  const [mode, setMode] = useState<"closed" | "create" | "edit">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    className: "",
    term: settings.term,
    session: settings.session,
    items: [emptyItem()],
  });
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null);

  const resetForm = () => {
    setForm({
      name: "",
      className: classNames[0] ?? "",
      term: settings.term,
      session: settings.session,
      items: [emptyItem()],
    });
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setMode("create");
  };

  const openEdit = (structure: FeeStructure) => {
    setEditingId(structure.id);
    setForm({
      name: structure.name,
      className: structure.className,
      term: structure.term,
      session: structure.session,
      items: structure.items.length
        ? structure.items.map((item) => ({ ...item, name: item.name ?? "" }))
        : [emptyItem()],
    });
    setError("");
    setMode("edit");
  };

  const closeForm = () => {
    setMode("closed");
    resetForm();
  };

  const setItem = (index: number, patch: Partial<FeeItem>) => {
    const items = form.items.map((item, i) => (i === index ? { ...item, ...patch } : item));
    setForm({ ...form, items });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      className: form.className,
      term: form.term.trim(),
      session: form.session.trim(),
      items: form.items,
    };
    const result =
      mode === "edit" && editingId ? updateFeeStructure(editingId, payload) : addFeeStructure(payload);
    if (!result.ok) {
      setError(result.error ?? "Could not save this fee structure.");
      return;
    }
    setToast(mode === "edit" ? "Fee structure updated. Unpaid invoices for this structure were aligned." : "Fee structure created.");
    closeForm();
    window.setTimeout(() => setToast(""), 3000);
  };

  const handleGenerate = (id: string) => {
    const count = generateInvoices(id);
    setToast(count > 0 ? `Generated ${count} invoice(s) with every fee item listed.` : "All students in this class already have invoices.");
    window.setTimeout(() => setToast(""), 3000);
  };

  const handleDelete = (structure: FeeStructure) => {
    const ok = window.confirm(
      `Delete ${structure.name}? Existing invoices keep the fee items already billed.`
    );
    if (!ok) return;
    const result = deleteFeeStructure(structure.id);
    if (!result.ok) {
      window.alert(result.error ?? "Could not delete this fee structure.");
      return;
    }
    if (editingId === structure.id) closeForm();
    setToast("Fee structure deleted.");
    window.setTimeout(() => setToast(""), 3000);
  };

  return (
    <PortalShell navItems={FINANCE_NAV} title="Finance Officer Portal">
      <PageHeader
        title="Fees & Invoices"
        description="Build fee structures from named items, then generate invoices that list what each family is paying for."
        action={
          <button
            onClick={openCreate}
            disabled={!classNames.length}
            className={`inline-flex items-center gap-2 ${btnPrimary}`}
          >
            <Plus className="h-4 w-4" /> New fee structure
          </button>
        }
      />

      {!classNames.length && (
        <div className="mb-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Create a class on Classes before you can add a fee structure.
        </div>
      )}
      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}

      {mode !== "closed" && (
        <form onSubmit={handleSubmit} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h3 className="font-display font-semibold text-slate-900">
              {mode === "edit" ? "Edit fee structure" : "New fee structure"}
            </h3>
            <button type="button" onClick={closeForm} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" />
            </button>
          </div>
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Structure name">
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Primary 1 — First Term" />
            </FormField>
            <FormField label="Class">
              <select className={selectClass} value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} required>
                <option value="">{classNames.length ? "Select a class" : "No classes yet"}</option>
                {classNames.map((c) => (
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
              <div key={idx} className="mb-2 grid gap-2 sm:grid-cols-[8rem_1fr_8rem_auto]">
                <select
                  className={selectClass}
                  value={item.category}
                  onChange={(e) => setItem(idx, { category: e.target.value as FeeCategory })}
                >
                  {FEE_CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  className={inputClass}
                  value={item.name ?? ""}
                  onChange={(e) => setItem(idx, { name: e.target.value })}
                  placeholder="What this covers (e.g. Registration, workbooks)"
                />
                <input
                  type="number"
                  className={inputClass}
                  value={item.amount || ""}
                  onChange={(e) => setItem(idx, { amount: Number(e.target.value) })}
                  placeholder="Amount"
                  required
                  min={0}
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = form.items.filter((_, i) => i !== idx);
                    setForm({ ...form, items: next.length ? next : [emptyItem()] });
                  }}
                  className="rounded-xl border border-red-100 px-3 text-red-600 hover:bg-red-50"
                  aria-label="Remove fee item"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }))}
              className="text-sm font-medium text-emerald-600 hover:underline"
            >
              + Add fee item
            </button>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className={btnPrimary} disabled={!classNames.length}>
              {mode === "edit" ? "Save changes" : "Save structure"}
            </button>
            <button type="button" onClick={closeForm} className={btnSecondary}>Cancel</button>
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
              {fs.items.map((item, index) => (
                <li key={`${item.category}-${index}`} className="flex justify-between gap-3">
                  <span>{feeItemLabel(item)}</span>
                  <span>{formatCurrency(item.amount)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 font-semibold text-emerald-700">Total: {formatCurrency(fs.totalAmount)}</p>
            <button onClick={() => handleGenerate(fs.id)} className={`mt-4 w-full ${btnPrimary}`}>
              Generate invoices
            </button>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => openEdit(fs)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                <Pencil className="h-4 w-4" /> Edit
              </button>
              <button type="button" onClick={() => handleDelete(fs)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <h3 className="mb-4 font-display font-semibold text-slate-900">All invoices</h3>
      <DataTable headers={["Invoice", "Student", "Class", "Items", "Total", "Paid", "Balance", "Status", "Due"]}>
        {invoices.map((inv) => {
          const student = getStudent(inv.studentId);
          const items = getInvoiceItems(inv);
          const open = openInvoiceId === inv.id;
          return (
            <tr key={inv.id} className="hover:bg-slate-50">
              <td className="px-6 py-4 font-medium">{inv.invoiceNo}</td>
              <td className="px-6 py-4">{student?.name ?? "—"}</td>
              <td className="px-6 py-4 text-slate-500">{student?.className ?? "—"}</td>
              <td className="px-6 py-4">
                <button type="button" onClick={() => setOpenInvoiceId(open ? null : inv.id)} className="text-left text-sm font-medium text-emerald-700 hover:underline">
                  {open ? "Hide" : `${items.length} item${items.length === 1 ? "" : "s"}`}
                </button>
                {open && <InvoiceItemsList items={items} totalAmount={inv.totalAmount} className="mt-2 min-w-[12rem]" />}
              </td>
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
