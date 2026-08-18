"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useCommsStore } from "@/lib/comms-store";
import { cn } from "@/lib/utils";

export default function PortalMessagesPage() {
  useRequireAuth(["parent", "student"]);
  const { user } = useAuthStore();
  const students = useFinanceStore((s) => s.students.filter((st) => st.parentEmail === user?.email));
  const student = students[0];
  const { getThreadForParent, getMessages, sendMessage, getOrCreateThread } = useCommsStore();
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const thread = user ? getThreadForParent(user.email) : undefined;
  const activeThread = thread ?? (student && user
    ? getOrCreateThread(student.id, user.email, "Emeka Nwosu", student.name, student.className)
    : undefined);

  const messages = activeThread ? getMessages(activeThread.id) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeThread || !user) return;
    sendMessage(
      activeThread.id,
      { senderRole: "parent", senderName: `${user.firstName} ${user.lastName}`, body: body.trim() },
      "teacher@mscholar.app"
    );
    setBody("");
  };

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader title="Messages" description={activeThread ? `Chat with ${activeThread.teacherName}` : "Communicate with the class teacher."} />

      <div className="card-shadow flex h-[calc(100vh-220px)] min-h-[400px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-medium text-slate-900">{activeThread?.subject ?? "No thread"}</p>
          <p className="text-xs text-slate-500">Class teacher: Emeka Nwosu</p>
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.senderRole === "parent" ? "ml-auto bg-sky-100 text-sky-900" : "bg-slate-100 text-slate-800")}>
              <p className="text-xs font-medium opacity-70">{m.senderName}</p>
              <p>{m.body}</p>
              <p className="mt-1 text-[10px] opacity-50">{new Date(m.createdAt).toLocaleString()}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-4">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Message the class teacher…"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button type="submit" className="rounded-xl bg-sky-600 p-2.5 text-white hover:bg-sky-700">
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </PortalShell>
  );
}
