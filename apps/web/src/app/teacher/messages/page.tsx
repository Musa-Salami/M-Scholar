"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { TEACHER_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useCommsStore } from "@/lib/comms-store";
import { TEACHER_CLASS } from "@/lib/academic-store";
import { cn } from "@/lib/utils";

export default function TeacherMessagesPage() {
  useRequireAuth(["class_teacher"]);
  const { user } = useAuthStore();
  const students = useFinanceStore((s) => s.students.filter((st) => st.className === TEACHER_CLASS));
  const { threads, getMessages, sendMessage, getOrCreateThread } = useCommsStore();
  const [activeThread, setActiveThread] = useState(threads[0]?.id ?? "");
  const [body, setBody] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const classThreads = threads.filter((t) => students.some((s) => s.id === t.studentId));
  const messages = activeThread ? getMessages(activeThread) : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeThread || !user) return;
    const thread = threads.find((t) => t.id === activeThread);
    if (!thread) return;
    sendMessage(
      activeThread,
      { senderRole: "teacher", senderName: `${user.firstName} ${user.lastName}`, body: body.trim() },
      thread.parentEmail
    );
    setBody("");
  };

  const ensureThread = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student || !user) return;
    const thread = getOrCreateThread(studentId, student.parentEmail, `${user.firstName} ${user.lastName}`, student.name, student.className);
    setActiveThread(thread.id);
  };

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader title="Messages" description="Communicate with parents." />

      <div className="card-shadow flex h-[calc(100vh-220px)] min-h-[400px] overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <aside className="w-64 shrink-0 border-r border-slate-100 bg-slate-50 p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-slate-500">Threads</p>
          {classThreads.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveThread(t.id)}
              className={cn(
                "mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm",
                activeThread === t.id ? "bg-amber-100 font-medium text-amber-900" : "hover:bg-white"
              )}
            >
              {t.subject}
            </button>
          ))}
          {students.filter((s) => !classThreads.some((t) => t.studentId === s.id)).map((s) => (
            <button key={s.id} onClick={() => ensureThread(s.id)} className="mb-1 w-full rounded-xl px-3 py-2.5 text-left text-sm text-slate-500 hover:bg-white">
              + {s.name}
            </button>
          ))}
        </aside>

        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm", m.senderRole === "teacher" ? "ml-auto bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-800")}>
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
              placeholder="Type a message…"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button type="submit" className="rounded-xl bg-amber-600 p-2.5 text-white hover:bg-amber-700">
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </PortalShell>
  );
}
