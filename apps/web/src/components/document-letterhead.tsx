"use client";

import { BrandLogo } from "@/components/brand-logo";
import { useSchoolStore } from "@/lib/school-store";

export function DocumentLetterhead({ subtitle }: { subtitle: string }) {
  const settings = useSchoolStore((s) => s.settings);
  return (
    <div className="flex items-start gap-3 border-b border-[#C9A227]/40 pb-4">
      <BrandLogo size={64} className="h-16 w-16 border border-[#C9A227]/60 shadow-sm" />
      <div className="min-w-0">
        <h1 className="font-display text-xl font-semibold text-brand">{settings.schoolName}</h1>
        {settings.motto ? <p className="text-sm text-muted">{settings.motto}</p> : null}
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}
