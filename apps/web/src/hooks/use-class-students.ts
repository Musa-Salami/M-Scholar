"use client";

import { useMemo } from "react";
import { useFinanceStore } from "@/lib/finance-store";
import { TEACHER_CLASS } from "@/lib/academic-store";

/** Stable list of students in a class. Do not filter inside a Zustand selector. */
export function useClassStudents(className = TEACHER_CLASS) {
  const all = useFinanceStore((s) => s.students);
  return useMemo(
    () => (all ?? []).filter((st) => st.className === className),
    [all, className]
  );
}
