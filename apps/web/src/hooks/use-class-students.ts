"use client";

import { useMemo } from "react";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";

/** Classes assigned to the signed-in class teacher. */
export function useAssignedClassNames() {
  const userId = useAuthStore((s) => s.user?.id);
  const classes = useSchoolStore((s) => s.classes ?? []);
  return useMemo(
    () => (userId ? classes.filter((c) => c.teacherId === userId).map((c) => c.name) : []),
    [userId, classes]
  );
}

export function useAssignedClassName() {
  return useAssignedClassNames()[0] ?? "";
}

/** Stable list of students in the signed-in teacher's classes. Do not filter inside a Zustand selector. */
export function useClassStudents() {
  const classNames = useAssignedClassNames();
  const all = useFinanceStore((s) => s.students);
  return useMemo(
    () => (all ?? []).filter((st) => classNames.includes(st.className)),
    [all, classNames]
  );
}
