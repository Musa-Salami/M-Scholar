"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@m-scholar/shared";
import { DEMO_USERS, ROLE_DASHBOARD_PATH } from "@m-scholar/shared";

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  dashboardPath: () => string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        const entry = DEMO_USERS[email.toLowerCase().trim()];
        if (!entry || entry.password !== password) {
          return { ok: false, error: "Invalid email or password." };
        }
        set({ user: entry.user, isAuthenticated: true });
        return { ok: true };
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      dashboardPath: () => {
        const user = get().user;
        if (!user) return "/login/";
        return ROLE_DASHBOARD_PATH[user.role];
      },
    }),
    {
      name: "mscholar-auth",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
