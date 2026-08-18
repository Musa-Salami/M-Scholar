"use client";

import { useEffect, useState } from "react";
import { useSchoolStore } from "@/lib/school-store";

export function useSchoolReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useSchoolStore.getState().restore();
    setReady(true);
  }, []);

  return ready;
}
