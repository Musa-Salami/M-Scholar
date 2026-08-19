"use client";

import type { Student } from "@m-scholar/shared";
import { emailsMatch, phonesMatch } from "@/lib/credentials";
import { useSchoolStore } from "@/lib/school-store";

function studentLoginMatch(student: Pick<Student, "studentPhone" | "studentEmail">) {
  return (user: { role: string; phone: string; email: string }) =>
    user.role === "student" &&
    (phonesMatch(user.phone, student.studentPhone) || emailsMatch(user.email, student.studentEmail));
}

export function ensureLoginsForEnrolment(student: Student) {
  const school = useSchoolStore.getState();
  const password = school.settings.defaultFamilyPassword || "Family2026";
  const users = school.users ?? [];
  const created: { student?: boolean; parent?: boolean } = {};

  if (student.studentPhone?.trim() && !users.some(studentLoginMatch(student))) {
    const result = school.addUser(
      {
        name: student.name,
        email: student.studentEmail ?? "",
        phone: student.studentPhone,
        password,
        role: "student",
      },
      { fromEnrolment: true }
    );
    created.student = Boolean(result.ok);
  }

  if (student.parentPhone?.trim()) {
    const parentExists = users.some(
      (u) => u.role === "parent" && (phonesMatch(u.phone, student.parentPhone) || emailsMatch(u.email, student.parentEmail))
    );
    if (!parentExists) {
      const result = school.addUser({
        name: `Parent of ${student.name}`,
        email: student.parentEmail ?? "",
        phone: student.parentPhone,
        password,
        role: "parent",
      });
      created.parent = Boolean(result.ok);
    }
  }

  return { password, created };
}

export function syncStudentLogin(student: Student, previous?: Student) {
  const school = useSchoolStore.getState();
  const existing = (school.users ?? []).find(
    (u) => studentLoginMatch(previous ?? student)(u) || studentLoginMatch(student)(u)
  );
  if (existing) {
    school.updateUser(existing.id, {
      name: student.name,
      phone: student.studentPhone ?? existing.phone,
      email: student.studentEmail ?? existing.email,
    });
    return;
  }
  if (student.studentPhone?.trim()) ensureLoginsForEnrolment(student);
}

export function removeStudentLogin(student: Student) {
  const school = useSchoolStore.getState();
  (school.users ?? [])
    .filter(studentLoginMatch(student))
    .forEach((user) => school.deleteUser(user.id));
}
