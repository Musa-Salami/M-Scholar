import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  accent?: "blue" | "violet" | "emerald" | "amber" | "sky" | "red";
  className?: string;
}

const ACCENT_MAP = {
  blue: "bg-cream text-brand",
  violet: "bg-violet-50 text-violet-700",
  emerald: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  red: "bg-red-50 text-red-700",
};

export function StatCard({ title, value, change, icon: Icon, accent = "blue", className }: StatCardProps) {
  return (
    <div className={cn("card-shadow rounded-2xl border border-border bg-white p-5", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted">{title}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-brand">{value}</p>
          {change && <p className="mt-1 text-xs text-muted">{change}</p>}
        </div>
        <div className={cn("rounded-xl p-3", ACCENT_MAP[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-brand md:text-3xl">
          {title}
        </h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

interface PlaceholderPanelProps {
  title: string;
  description: string;
}

export function PlaceholderPanel({ title, description }: PlaceholderPanelProps) {
  return (
    <div className="card-shadow rounded-2xl border border-dashed border-border bg-white p-12 text-center">
      <h3 className="font-display text-lg font-semibold text-brand">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      <span className="mt-4 inline-block rounded-full bg-cream px-3 py-1 text-xs font-medium text-muted">
        Coming in next phase
      </span>
    </div>
  );
}
