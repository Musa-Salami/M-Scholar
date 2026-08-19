"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { bootstrapAppData } from "@/lib/bootstrap-data";

/** Restore the signed-in session on every page, including the public site. */
export function SessionRestore() {
  useEffect(() => {
    useAuthStore.getState().restore();
    void bootstrapAppData();
  }, []);
  return null;
}
