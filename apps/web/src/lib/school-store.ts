"use client";

import { create } from "zustand";
import { SCHOOL, DEMO_USERS, type UserRole } from "@m-scholar/shared";
import { emailsMatch, isFamilyRole, phonesMatch } from "@/lib/credentials";

export interface SchoolUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  status: "Active" | "Inactive";
}

export interface SchoolClass {
  id: string;
  name: string;
  studentCount: number;
  teacherId: string | null;
}

export interface SchoolSettings {
  schoolName: string;
  motto: string;
  address: string;
  phone: string;
  email: string;
  session: string;
  term: string;
  principalName: string;
  nextTermResumptionDate: string;
  defaultStaffPassword: string;
  defaultFamilyPassword: string;
}

export const SEED_USERS: SchoolUser[] = [
  { id: "u1", name: "System Administrator", email: "admin@mscholar.app", phone: "", password: "admin123", role: "super_admin", status: "Active" },
  { id: "u2", name: "Adaeze Okonkwo", email: "finance@mscholar.app", phone: "", password: "finance123", role: "account_officer", status: "Active" },
  { id: "u3", name: "Emeka Nwosu", email: "teacher@mscholar.app", phone: "", password: "teacher123", role: "class_teacher", status: "Active" },
  { id: "u4", name: "Chioma Eze", email: "chioma.eze@mscholar.app", phone: "", password: "teacher123", role: "class_teacher", status: "Active" },
  { id: "u5", name: "Ibrahim Musa", email: "ibrahim.musa@mscholar.app", phone: "", password: "teacher123", role: "class_teacher", status: "Active" },
  { id: "u6", name: "Grace Adeyemi", email: "grace.adeyemi@mscholar.app", phone: "", password: "teacher123", role: "class_teacher", status: "Active" },
  { id: "u7", name: "Fatima Bello", email: "parent@mscholar.app", phone: "+234 801 555 1042", password: "parent123", role: "parent", status: "Active" },
  { id: "u8", name: "Amina Bello", email: "student@mscholar.app", phone: "+234 809 555 1042", password: "student123", role: "student", status: "Active" },
];

export const SEED_CLASSES: SchoolClass[] = [
  { id: "c1", name: "JSS 1A", studentCount: 2, teacherId: "u4" },
  { id: "c2", name: "JSS 1B", studentCount: 0, teacherId: "u4" },
  { id: "c3", name: "JSS 2A", studentCount: 2, teacherId: "u3" },
  { id: "c4", name: "SS 1 Science", studentCount: 1, teacherId: "u5" },
  { id: "c5", name: "SS 2 Arts", studentCount: 0, teacherId: "u6" },
];

export const SEED_SETTINGS: SchoolSettings = {
  schoolName: SCHOOL.name,
  motto: SCHOOL.motto,
  address: SCHOOL.address,
  phone: SCHOOL.phone,
  email: SCHOOL.email,
  session: "2026/2027",
  term: "First Term",
  principalName: "The Principal",
  nextTermResumptionDate: "2026-01-12",
  defaultStaffPassword: "Staff2026",
  defaultFamilyPassword: "Family2026",
};

interface SchoolState {
  users: SchoolUser[];
  classes: SchoolClass[];
  settings: SchoolSettings;
  restored: boolean;
  restore: () => void;
  resetToDemo: () => void;
  applyPersisted: (data: { users: SchoolUser[]; classes: SchoolClass[]; settings?: SchoolSettings }) => void;
  addUser: (user: Omit<SchoolUser, "id" | "status">) => { ok: boolean; error?: string; user?: SchoolUser };
  updateUser: (id: string, patch: Partial<Omit<SchoolUser, "id">>) => { ok: boolean; error?: string };
  addClass: (name: string, teacherId: string | null) => { ok: boolean; error?: string };
  assignTeacher: (classId: string, teacherId: string | null) => void;
  updateSettings: (settings: SchoolSettings) => void;
  syncClassCounts: (students: { className: string }[]) => void;
}

function normalizeUser(user: SchoolUser): SchoolUser {
  const demo = user.email ? DEMO_USERS[user.email.toLowerCase()] : undefined;
  return {
    ...user,
    email: user.email ?? "",
    phone: user.phone || demo?.user.phone || "",
    password: user.password || demo?.password || "",
  };
}

function loginConflict(users: SchoolUser[], candidate: Pick<SchoolUser, "email" | "phone" | "role">, exceptId?: string) {
  const others = users.filter((u) => u.id !== exceptId);
  if (isFamilyRole(candidate.role)) {
    if (others.some((u) => phonesMatch(u.phone, candidate.phone))) {
      return "That phone number already has a login.";
    }
  } else if (candidate.email && others.some((u) => emailsMatch(u.email, candidate.email))) {
    return "That email already has a login.";
  }
  return null;
}

export const useSchoolStore = create<SchoolState>()((set, get) => ({
  users: SEED_USERS,
  classes: SEED_CLASSES,
  settings: SEED_SETTINGS,
  restored: false,

  restore: () => set({ restored: true }),

  resetToDemo: () =>
    set({
      users: SEED_USERS,
      classes: SEED_CLASSES,
      settings: SEED_SETTINGS,
      restored: true,
    }),

  applyPersisted: (data) =>
    set({
      users: data.users.map(normalizeUser),
      classes: data.classes,
      settings: {
        ...SEED_SETTINGS,
        ...data.settings,
        defaultStaffPassword: data.settings?.defaultStaffPassword ?? SEED_SETTINGS.defaultStaffPassword,
        defaultFamilyPassword: data.settings?.defaultFamilyPassword ?? SEED_SETTINGS.defaultFamilyPassword,
      },
      restored: true,
    }),

  addUser: (user) => {
    const name = user.name.trim();
    const email = user.email.trim();
    const phone = user.phone.trim();
    const password = user.password.trim();
    if (!name) return { ok: false, error: "Enter a full name." };
    if (isFamilyRole(user.role) && !phone) return { ok: false, error: "Enter a phone number for parent/student login." };
    if (!isFamilyRole(user.role) && !email) return { ok: false, error: "Enter an email for staff login." };
    if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };
    const conflict = loginConflict(get().users, { email, phone, role: user.role });
    if (conflict) return { ok: false, error: conflict };
    const created: SchoolUser = {
      id: `u${Date.now()}`,
      name,
      email,
      phone,
      password,
      role: user.role,
      status: "Active",
    };
    set((s) => ({ users: [...s.users, created] }));
    return { ok: true, user: created };
  },

  updateUser: (id, patch) => {
    const current = get().users.find((u) => u.id === id);
    if (!current) return { ok: false, error: "User not found." };
    const next = normalizeUser({ ...current, ...patch, id });
    if (patch.password !== undefined && next.password.trim().length < 6) {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    const conflict = loginConflict(get().users, next, id);
    if (conflict) return { ok: false, error: conflict };
    set((s) => ({ users: s.users.map((u) => (u.id === id ? next : u)) }));
    return { ok: true };
  },

  addClass: (name, teacherId) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Enter a class name." };
    const exists = get().classes.some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
    if (exists) return { ok: false, error: "A class with this name already exists." };
    if (teacherId) {
      const teacher = get().users.find((u) => u.id === teacherId && u.role === "class_teacher");
      if (!teacher) return { ok: false, error: "Select a teacher whose profile already exists." };
    }
    set((s) => ({
      classes: [...s.classes, { id: `c${Date.now()}`, name: trimmed, studentCount: 0, teacherId }],
    }));
    return { ok: true };
  },

  assignTeacher: (classId, teacherId) => {
    if (teacherId) {
      const teacher = get().users.find((u) => u.id === teacherId && u.role === "class_teacher");
      if (!teacher) return;
    }
    set((s) => ({
      classes: s.classes.map((c) => (c.id === classId ? { ...c, teacherId } : c)),
    }));
  },

  updateSettings: (settings) => set({ settings }),

  syncClassCounts: (students) => {
    set((s) => ({
      classes: s.classes.map((c) => ({
        ...c,
        studentCount: students.filter((st) => st.className === c.name).length,
      })),
    }));
  },
}));
