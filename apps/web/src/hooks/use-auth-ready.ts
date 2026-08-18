"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/auth-store";

/** Wait until persisted login state is restored from localStorage. */
export function useAuthReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const persist = useAuthStore.persist;
    if (!persist?.hasHydrated) {
      setReady(true);
      return;
    }
    if (persist.hasHydrated()) {
      setReady(true);
      return;
    }
    return persist.onFinishHydration(() => setReady(true));
  }, []);

  return ready;
}
