"use client";

import { useEffect } from "react";
import { ROLE_DASHBOARD_PATH, type UserRole } from "@m-scholar/shared";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { pageHref } from "@/lib/paths";

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const ready = useAuthReady();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rolesKey = allowedRoles?.join(",") ?? "";

  useEffect(() => {
    if (!ready) return;
    const session = useAuthStore.getState();
    if (!session.isAuthenticated || !session.user) {
      session.restore();
    }
    const current = useAuthStore.getState();
    if (!current.isAuthenticated || !current.user) {
      window.location.replace(pageHref("/login"));
      return;
    }
    if (rolesKey && !rolesKey.split(",").includes(current.user.role)) {
      window.location.replace(pageHref(ROLE_DASHBOARD_PATH[current.user.role]));
    }
  }, [ready, isAuthenticated, user, rolesKey]);

  return { user, isAuthenticated, ready };
}
