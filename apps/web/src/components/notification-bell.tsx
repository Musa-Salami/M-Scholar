"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";
import { useNotificationStore } from "@/lib/notification-store";
import { pageHref } from "@/lib/paths";

export function NotificationBell() {
  const user = useAuthStore((s) => s.user);
  const notifications = useNotificationStore((s) => s.notifications ?? []);
  const markRead = useNotificationStore((s) => s.markRead);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [open, setOpen] = useState(false);

  if (!user) return null;

  const items = notifications.filter((n) => n.userEmail === user.email);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative min-h-11 min-w-11 rounded-xl p-2 hover:bg-cream"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-brand" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="font-semibold text-brand">Notifications</span>
              {unread > 0 && (
                <button type="button" onClick={() => markAllRead(user.email)} className="text-xs font-medium text-brand hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-auto">
              {items.length === 0 ? (
                <p className="p-4 text-sm text-muted">No notifications yet.</p>
              ) : (
                items.map((n) => (
                  <a
                    key={n.id}
                    href={pageHref(n.href)}
                    onClick={() => {
                      markRead(n.id);
                      setOpen(false);
                    }}
                    className={`block border-b border-border px-4 py-3 hover:bg-cream ${!n.read ? "bg-cream/80" : ""}`}
                  >
                    <p className="text-sm font-medium text-brand">{n.title}</p>
                    <p className="text-xs text-muted line-clamp-2">{n.body}</p>
                  </a>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
