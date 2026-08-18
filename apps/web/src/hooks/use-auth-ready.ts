"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Restore login from localStorage after the page has mounted. */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useAuthStore.getState().restore();
    setReady(true);
  }, []);

  return ready;
}
