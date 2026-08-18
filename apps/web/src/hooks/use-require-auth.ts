"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import type { UserRole } from "@m-scholar/shared";

export function useRequireAuth(allowedRoles?: UserRole[]) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace("/login");
    }
  }, [isAuthenticated, user, allowedRoles, router]);

  return { user, isAuthenticated };
}
