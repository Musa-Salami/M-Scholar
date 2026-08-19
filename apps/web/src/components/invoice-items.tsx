import type { FeeItem } from "@m-scholar/shared";
import { feeItemLabel } from "@m-scholar/shared";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function InvoiceItemsList({
  items,
  totalAmount,
  className,
}: {
  items: FeeItem[];
  totalAmount?: number;
  className?: string;
}) {
  const total = totalAmount ?? items.reduce((sum, item) => sum + item.amount, 0);
  if (!items.length) {
    return <p className={cn("text-sm text-slate-500", className)}>No fee items on this invoice.</p>;
  }
  return (
    <ul className={cn("space-y-1 text-sm", className)}>
      {items.map((item, index) => (
        <li key={`${item.category}-${item.name ?? ""}-${index}`} className="flex justify-between gap-3 text-slate-600">
          <span>
            {feeItemLabel(item)}
            {item.name?.trim() && item.name.trim().toLowerCase() !== item.category.toLowerCase() ? (
              <span className="text-slate-400"> · {item.category}</span>
            ) : null}
          </span>
          <span className="shrink-0 font-medium text-slate-800">{formatCurrency(item.amount)}</span>
        </li>
      ))}
      <li className="flex justify-between gap-3 border-t border-slate-100 pt-1 font-semibold text-slate-900">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </li>
    </ul>
  );
}
