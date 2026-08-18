"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import type { UserRole } from "@m-scholar/shared";

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const ready = useAuthReady();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const rolesKey = allowedRoles?.join(",") ?? "";

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user) {
      window.location.replace("/login/");
      return;
    }
    if (rolesKey && allowedRoles && !allowedRoles.includes(user.role)) {
      window.location.replace("/login/");
    }
  }, [ready, isAuthenticated, user, rolesKey, allowedRoles]);

  return { user, isAuthenticated, ready };
}
