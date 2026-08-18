import type { AuthUser, Student, UserRole } from "@m-scholar/shared";

export interface LoginProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status?: "Active" | "Inactive";
  password?: string;
}

export function isFamilyRole(role: UserRole) {
  return role === "parent" || role === "student";
}

export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length >= 13) return `0${digits.slice(3)}`;
  return digits;
}

export function phonesMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  const left = normalizePhone(a);
  const right = normalizePhone(b);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.slice(-10) === right.slice(-10) && left.slice(-10).length === 10;
}

export function emailsMatch(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function looksLikeEmail(value: string) {
  return value.includes("@");
}

export function splitName(name: string): { firstName: string; lastName: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || "User", lastName: parts.slice(1).join(" ") };
}

export function loginLabel(role: UserRole) {
  return isFamilyRole(role) ? "Phone number" : "Email";
}

export function loginValue(user: Pick<LoginProfile, "email" | "phone" | "role">) {
  return isFamilyRole(user.role) ? user.phone || user.email : user.email;
}

export function toAuthUser(user: LoginProfile): AuthUser {
  const { firstName, lastName } = splitName(user.name);
  return {
    id: user.id,
    email: user.email || "",
    phone: user.phone || "",
    firstName,
    lastName,
    role: user.role,
  };
}

export function studentLinkedToUser(student: Student, user: AuthUser): boolean {
  if (user.role === "student") {
    return emailsMatch(student.studentEmail, user.email) || phonesMatch(student.studentPhone, user.phone);
  }
  if (user.role === "parent") {
    return emailsMatch(student.parentEmail, user.email) || phonesMatch(student.parentPhone, user.phone);
  }
  return (
    emailsMatch(student.parentEmail, user.email) ||
    emailsMatch(student.studentEmail, user.email) ||
    phonesMatch(student.parentPhone, user.phone) ||
    phonesMatch(student.studentPhone, user.phone)
  );
}

export function findSchoolUserByLogin(users: LoginProfile[], identifier: string): LoginProfile | undefined {
  const raw = identifier.trim();
  if (!raw) return undefined;
  const active = users.filter((u) => u.status !== "Inactive");
  if (looksLikeEmail(raw)) {
    return active.find((u) => emailsMatch(u.email, raw));
  }
  return active.find((u) => phonesMatch(u.phone, raw)) ?? active.find((u) => emailsMatch(u.email, raw));
}

export function findSchoolUserForAuth(users: LoginProfile[], user: AuthUser): LoginProfile | undefined {
  return (
    users.find((u) => u.id === user.id) ??
    users.find((u) => emailsMatch(u.email, user.email) && Boolean(user.email)) ??
    users.find((u) => phonesMatch(u.phone, user.phone) && Boolean(user.phone))
  );
}
