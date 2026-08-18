"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Restore login from localStorage only in the browser, after first paint. */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restore() {
      try {
        await useAuthStore.persist.rehydrate();
      } catch {
        useAuthStore.setState({ user: null, isAuthenticated: false });
      }
      if (!cancelled) setReady(true);
    }

    void restore();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
