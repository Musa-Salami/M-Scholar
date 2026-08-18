"use client";

import { create } from "zustand";
import type { AppNotification } from "@m-scholar/shared";

interface NotificationState {
  notifications: AppNotification[];
  add: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: (userEmail: string) => void;
  getForUser: (userEmail: string) => AppNotification[];
  unreadCount: (userEmail: string) => number;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],

  add: (n) => {
    set((s) => ({
      notifications: [
        {
          ...n,
          id: `notif${Date.now()}`,
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...(s.notifications ?? []),
      ].slice(0, 50),
    }));
  },

  markRead: (id) => {
    set((s) => ({
      notifications: (s.notifications ?? []).map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllRead: (userEmail) => {
    set((s) => ({
      notifications: (s.notifications ?? []).map((n) =>
        n.userEmail === userEmail ? { ...n, read: true } : n
      ),
    }));
  },

  getForUser: (userEmail) =>
    (get().notifications ?? []).filter((n) => n.userEmail === userEmail),

  unreadCount: (userEmail) =>
    (get().notifications ?? []).filter((n) => n.userEmail === userEmail && !n.read).length,
}));

export function addNotification(n: Omit<AppNotification, "id" | "read" | "createdAt">) {
  useNotificationStore.getState().add(n);
}
