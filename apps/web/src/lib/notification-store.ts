"use client";

import { create } from "zustand";
import type { AppNotification } from "@m-scholar/shared";

const SEED_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif1",
    userEmail: "parent@mscholar.app",
    title: "Term results published",
    body: "New term results are available for Amina Bello (Primary 1).",
    href: "/portal/results",
    read: false,
    createdAt: "2026-02-01T09:00:00",
  },
  {
    id: "notif2",
    userEmail: "parent@mscholar.app",
    title: "Teacher note: Excellent class participation",
    body: "Amina has shown great improvement in phonics and number work this week.",
    href: "/portal/notes",
    read: false,
    createdAt: "2026-02-08T09:05:00",
  },
  {
    id: "notif3",
    userEmail: "teacher@mscholar.app",
    title: "New message from Fatima Bello",
    body: "Good afternoon sir, I wanted to ask about Amina's phonics homework.",
    href: "/teacher/messages",
    read: true,
    createdAt: "2026-02-09T10:00:00",
  },
  {
    id: "notif4",
    userEmail: "finance@mscholar.app",
    title: "Partial fee payment recorded",
    body: "Blessing Eze (N1BE26) paid ₦15,000 toward First Term fees.",
    href: "/finance/payments",
    read: true,
    createdAt: "2026-02-08T11:20:00",
  },
];

interface NotificationState {
  notifications: AppNotification[];
  add: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: (userEmail: string) => void;
  getForUser: (userEmail: string) => AppNotification[];
  unreadCount: (userEmail: string) => number;
  resetToDemo: () => void;
  applyPersisted: (data: { notifications: AppNotification[] }) => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: SEED_NOTIFICATIONS,

  resetToDemo: () => set({ notifications: SEED_NOTIFICATIONS }),

  applyPersisted: (data) => set({ notifications: data.notifications ?? [] }),

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
      ].slice(0, 80),
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
