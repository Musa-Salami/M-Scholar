"use client";

import { create } from "zustand";
import type { AuthUser } from "@m-scholar/shared";
import { DEMO_USERS, ROLE_DASHBOARD_PATH } from "@m-scholar/shared";
import { findSchoolUserByLogin, findSchoolUserForAuth, toAuthUser } from "@/lib/credentials";
import { useSchoolStore } from "@/lib/school-store";

const SESSION_KEY = "mscholar-auth";

function saveSession(user: AuthUser | null) {
  try {
    if (typeof window === "undefined") return;
    if (!user) {
      window.localStorage.removeItem(SESSION_KEY);
      return;
    }
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ user, isAuthenticated: true }));
  } catch {
    /* ignore quota / private mode */
  }
}

function readSession(): { user: AuthUser; isAuthenticated: true } | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      user?: AuthUser;
      isAuthenticated?: boolean;
      state?: { user?: AuthUser; isAuthenticated?: boolean };
    };
    const user = data?.user ?? data?.state?.user;
    const isAuthenticated = data?.isAuthenticated ?? data?.state?.isAuthenticated;
    if (isAuthenticated && user?.role && (user.email || user.phone)) {
      return { user, isAuthenticated: true };
    }
  } catch {
    /* ignore bad JSON */
  }
  return null;
}

function demoEntry(identifier: string) {
  const key = identifier.toLowerCase().trim();
  const direct = DEMO_USERS[key];
  if (direct) return direct;
  return Object.values(DEMO_USERS).find((entry) => entry.user.phone && identifier.replace(/\D/g, "") && entry.user.phone.replace(/\D/g, "").slice(-10) === identifier.replace(/\D/g, "").slice(-10));
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => { ok: boolean; error?: string };
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
  logout: () => void;
  dashboardPath: () => string;
  restore: () => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isAuthenticated: false,

  restore: () => {
    const session = readSession();
    if (session) set(session);
  },

  login: (identifier, password) => {
    const schoolUser = findSchoolUserByLogin(useSchoolStore.getState().users ?? [], identifier);
    if (schoolUser) {
      if (schoolUser.status === "Inactive") {
        return { ok: false, error: "This account is inactive. Ask the school admin to set it Active." };
      }
      const demo = schoolUser.email ? DEMO_USERS[schoolUser.email.toLowerCase()] : undefined;
      const expected = schoolUser.password || demo?.password;
      if (!expected || expected !== password) {
        return { ok: false, error: "Invalid login details." };
      }
      const user = toAuthUser(schoolUser);
      set({ user, isAuthenticated: true });
      saveSession(user);
      return { ok: true };
    }

    const entry = demoEntry(identifier);
    if (!entry || entry.password !== password) {
      return { ok: false, error: "Invalid login details." };
    }
    set({ user: entry.user, isAuthenticated: true });
    saveSession(entry.user);
    return { ok: true };
  },

  changePassword: (current, next) => {
    const user = get().user;
    if (!user) return { ok: false, error: "Sign in again to change your password." };
    const trimmed = next.trim();
    if (trimmed.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
    if (current === trimmed) return { ok: false, error: "Choose a different password." };

    const schoolUser = findSchoolUserForAuth(useSchoolStore.getState().users ?? [], user);
    const demo = user.email ? DEMO_USERS[user.email.toLowerCase()] : undefined;
    const expected = schoolUser?.password || demo?.password;
    if (!expected || expected !== current) {
      return { ok: false, error: "Current password is incorrect." };
    }
    if (!schoolUser) {
      return { ok: false, error: "Ask the school admin to set a new password on your profile." };
    }
    const result = useSchoolStore.getState().updateUser(schoolUser.id, { password: trimmed });
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    saveSession(null);
  },

  dashboardPath: () => {
    const user = get().user;
    if (!user) return "/login/";
    return ROLE_DASHBOARD_PATH[user.role].endsWith("/")
      ? ROLE_DASHBOARD_PATH[user.role]
      : `${ROLE_DASHBOARD_PATH[user.role]}/`;
  },
}));
