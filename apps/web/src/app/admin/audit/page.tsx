"use client";

import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader, PlaceholderPanel } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function AdminAuditPage() {
  useRequireAuth(["super_admin"]);
  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader title="Audit Log" description="Track all critical system changes." />
      <PlaceholderPanel title="Audit trail" description="Filterable timeline of user actions with before/after snapshots." />
    </PortalShell>
  );
}
