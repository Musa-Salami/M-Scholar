"use client";

import type { Student } from "@m-scholar/shared";
import { findSchoolClass, useSchoolStore, type SchoolUser } from "@/lib/school-store";

export function getClassTeacher(className: string): SchoolUser | undefined {
  const cls = findSchoolClass(className);
  if (!cls?.teacherId) return undefined;
  return useSchoolStore
    .getState()
    .users.find((u) => u.id === cls.teacherId && u.role === "class_teacher" && u.status === "Active");
}

export function getClassTeacherForStudent(student?: Pick<Student, "className">) {
  if (!student?.className) return undefined;
  return getClassTeacher(student.className);
}

export function teacherNotifyAddress(teacher?: SchoolUser) {
  if (!teacher) return "";
  return teacher.email?.trim() || teacher.phone?.trim() || "";
}

export function classesAssignedTo(teacherId: string) {
  return useSchoolStore.getState().classes.filter((c) => c.teacherId === teacherId);
}
