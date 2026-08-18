"use client";

import { create } from "zustand";
import type { UserRole } from "@m-scholar/shared";

const STORAGE_KEY = "mscholar-school";

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

const SEED_USERS: SchoolUser[] = [
  { id: "u1", name: "System Administrator", email: "admin@mscholar.app", role: "super_admin", status: "Active" },
  { id: "u2", name: "Adaeze Okonkwo", email: "finance@mscholar.app", role: "account_officer", status: "Active" },
  { id: "u3", name: "Emeka Nwosu", email: "teacher@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u4", name: "Chioma Eze", email: "chioma.eze@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u5", name: "Ibrahim Musa", email: "ibrahim.musa@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u6", name: "Grace Adeyemi", email: "grace.adeyemi@mscholar.app", role: "class_teacher", status: "Active" },
  { id: "u7", name: "Fatima Bello", email: "parent@mscholar.app", role: "parent", status: "Active" },
  { id: "u8", name: "Amina Bello", email: "student@mscholar.app", role: "student", status: "Active" },
];

const SEED_CLASSES: SchoolClass[] = [
  { id: "c1", name: "JSS 1A", studentCount: 38, teacherId: "u3" },
  { id: "c2", name: "JSS 1B", studentCount: 36, teacherId: "u4" },
  { id: "c3", name: "JSS 2A", studentCount: 34, teacherId: "u3" },
  { id: "c4", name: "SS 1 Science", studentCount: 42, teacherId: "u5" },
  { id: "c5", name: "SS 2 Arts", studentCount: 29, teacherId: "u6" },
];

function persist(users: SchoolUser[], classes: SchoolClass[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ users, classes }));
  } catch {
    /* ignore */
  }
}

function readStored(): { users: SchoolUser[]; classes: SchoolClass[] } | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { users?: SchoolUser[]; classes?: SchoolClass[] };
    if (!Array.isArray(data.users) || !Array.isArray(data.classes)) return null;
    return { users: data.users, classes: data.classes };
  } catch {
    return null;
  }
}

interface SchoolState {
  users: SchoolUser[];
  classes: SchoolClass[];
  restored: boolean;
  restore: () => void;
  addUser: (user: Omit<SchoolUser, "id" | "status">) => void;
  addClass: (name: string, teacherId: string | null) => { ok: boolean; error?: string };
  assignTeacher: (classId: string, teacherId: string | null) => void;
}

export const useSchoolStore = create<SchoolState>()((set, get) => ({
  users: SEED_USERS,
  classes: SEED_CLASSES,
  restored: false,

  restore: () => {
    if (get().restored) return;
    const stored = readStored();
    if (stored) set({ ...stored, restored: true });
    else set({ restored: true });
  },

  addUser: (user) => {
    set((s) => {
      const users = [
        ...s.users,
        { ...user, id: `u${Date.now()}`, status: "Active" as const },
      ];
      persist(users, s.classes);
      return { users };
    });
  },

  addClass: (name, teacherId) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Enter a class name." };
    const exists = get().classes.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return { ok: false, error: "A class with this name already exists." };
    if (teacherId) {
      const teacher = get().users.find(
        (u) => u.id === teacherId && u.role === "class_teacher"
      );
      if (!teacher) return { ok: false, error: "Select a teacher whose profile already exists." };
    }
    set((s) => {
      const classes = [
        ...s.classes,
        { id: `c${Date.now()}`, name: trimmed, studentCount: 0, teacherId },
      ];
      persist(s.users, classes);
      return { classes };
    });
    return { ok: true };
  },

  assignTeacher: (classId, teacherId) => {
    if (teacherId) {
      const teacher = get().users.find(
        (u) => u.id === teacherId && u.role === "class_teacher"
      );
      if (!teacher) return;
    }
    set((s) => {
      const classes = s.classes.map((c) =>
        c.id === classId ? { ...c, teacherId } : c
      );
      persist(s.users, classes);
      return { classes };
    });
  },
}));
