"use client";

import { create } from "zustand";
import { SCHOOL, type UserRole } from "@m-scholar/shared";

export interface SchoolUser {
  id: string;
  name: string;
  email: string;
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
}

export const SEED_USERS: SchoolUser[] = [
  { id: "u1", name: "System Administrator", email: "admin@mscholar.app", role: "super_admin", status: "Active" },
  { id: "u2", name: "Adaeze Okonkwo", email: "finance@mscholar.app", role: "account_officer", status: "Active" },
  { id: "u3", name: "Emeka Nwosu", email: "teacher@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u4", name: "Chioma Eze", email: "chioma.eze@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u5", name: "Ibrahim Musa", email: "ibrahim.musa@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u6", name: "Grace Adeyemi", email: "grace.adeyemi@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u7", name: "Fatima Bello", email: "parent@mscholar.app", role: "parent", status: "Active" },
  { id: "u8", name: "Amina Bello", email: "student@mscholar.app", role: "student", status: "Active" },
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
  session: "2025/2026",
  term: "First Term",
  principalName: "The Principal",
  nextTermResumptionDate: "2026-01-12",
};

interface SchoolState {
  users: SchoolUser[];
  classes: SchoolClass[];
  settings: SchoolSettings;
  restored: boolean;
  restore: () => void;
  resetToDemo: () => void;
  applyPersisted: (data: { users: SchoolUser[]; classes: SchoolClass[]; settings?: SchoolSettings }) => void;
  addUser: (user: Omit<SchoolUser, "id" | "status">) => void;
  addClass: (name: string, teacherId: string | null) => { ok: boolean; error?: string };
  assignTeacher: (classId: string, teacherId: string | null) => void;
  updateSettings: (settings: SchoolSettings) => void;
  syncClassCounts: (students: { className: string }[]) => void;
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
      users: data.users,
      classes: data.classes,
      settings: data.settings ?? SEED_SETTINGS,
      restored: true,
    }),

  addUser: (user) => {
    set((s) => ({
      users: [...s.users, { ...user, id: `u${Date.now()}`, status: "Active" as const }],
    }));
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
