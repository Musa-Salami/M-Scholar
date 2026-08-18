"use client";

import { Users, GraduationCap, UserCheck, Activity } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, StatCard } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AdminDashboardPage() {
  const { ready } = useRequireAuth(["super_admin"]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Dashboard"
        description="Overview of school operations and system health."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Students" value="1,248" change="+32 this term" icon={UserCheck} accent="violet" />
        <StatCard title="Staff Members" value="86" change="4 new this month" icon={Users} accent="blue" />
        <StatCard title="Active Classes" value="42" icon={GraduationCap} accent="emerald" />
        <StatCard title="System Uptime" value="99.9%" icon={Activity} accent="sky" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Recent user activity</h3>
          <ul className="mt-4 space-y-3">
            {[
              "Account Officer recorded 12 fee payments",
              "Class Teacher submitted JSS 2A attendance",
              "New parent account linked to student MS-1042",
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-600">
                <span className="h-2 w-2 rounded-full bg-violet-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">Quick actions</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: "Add user", href: "/admin/users" },
              { label: "Manage classes", href: "/admin/classes" },
              { label: "School settings", href: "/admin/settings" },
              { label: "View audit log", href: "/admin/audit" },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:border-violet-200 hover:bg-violet-50"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}
