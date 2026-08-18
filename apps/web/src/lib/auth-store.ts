"use client";

import { create } from "zustand";
import type { AuthUser } from "@m-scholar/shared";
import { DEMO_USERS, ROLE_DASHBOARD_PATH } from "@m-scholar/shared";

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
    if (isAuthenticated && user?.email && user?.role) {
      return { user, isAuthenticated: true };
    }
  } catch {
    /* ignore bad JSON */
  }
  return null;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
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

  login: (email, password) => {
    const entry = DEMO_USERS[email.toLowerCase().trim()];
    if (!entry || entry.password !== password) {
      return { ok: false, error: "Invalid email or password." };
    }
    set({ user: entry.user, isAuthenticated: true });
    saveSession(entry.user);
    return { ok: true };
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    saveSession(null);
  },

  dashboardPath: () => {
    const user = get().user;
    if (!user) return "/login/";
    return ROLE_DASHBOARD_PATH[user.role];
  },
}));
