import type { InvoiceStatus } from "@m-scholar/shared";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  pending: "bg-slate-100 text-slate-700",
  partial: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-700",
  overdue: "bg-red-100 text-red-700",
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", STATUS_STYLES[status])}>
      {status}
    </span>
  );
}

export function DataTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="card-shadow overflow-hidden rounded-2xl border border-border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              {headers.map((h) => (
                <th key={h} className="px-6 py-3 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-gold";

export const selectClass = inputClass;

export const btnPrimary =
  "min-h-11 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60";

export const btnSecondary =
  "min-h-11 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-ink hover:bg-cream";
