"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { bootstrapAppData } from "@/lib/bootstrap-data";

/** Restore login and the protected data vault after the page has mounted. */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      useAuthStore.getState().restore();
      await bootstrapAppData();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
