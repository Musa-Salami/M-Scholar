"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";

/** Restore login from localStorage after the page has mounted. */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().restore();
    useFinanceStore.getState().restoreStudents();
    setReady(true);
  }, []);

  return ready;
}
