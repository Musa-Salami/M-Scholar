"use client";

import { useEffect, useState } from "react";
import { useSchoolStore } from "@/lib/school-store";
import { bootstrapAppData } from "@/lib/bootstrap-data";

export function useSchoolReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await bootstrapAppData();
      useSchoolStore.getState().restore();
      if (!cancelled) setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
