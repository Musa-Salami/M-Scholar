"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { useAuthReady } from "@/hooks/use-auth-ready";
import type { UserRole } from "@m-scholar/shared";

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const ready = useAuthReady();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!ready) return;
    if (!isAuthenticated || !user) {
      router.replace("/login/");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login/");
    }
  }, [ready, isAuthenticated, user, allowedRoles, router]);

  return { user, isAuthenticated, ready };
}
