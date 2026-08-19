"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Send } from "lucide-react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { studentLinkedToUser } from "@/lib/credentials";
import { getClassTeacherForStudent, teacherNotifyAddress } from "@/lib/class-teacher";
import { useCommsStore } from "@/lib/comms-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { cn } from "@/lib/utils";

export default function PortalMessagesPage() {
  const { ready, user } = useRequireAuth(["parent", "student"]);
  const studentsAll = useFinanceStore((s) => s.students ?? []);
  const threads = useCommsStore((s) => s.threads ?? []);
  const messagesAll = useCommsStore((s) => s.messages ?? []);
  const sendMessage = useCommsStore((s) => s.sendMessage);
  const getOrCreateThread = useCommsStore((s) => s.getOrCreateThread);
  const classes = useSchoolStore((s) => s.classes);
  const schoolUsers = useSchoolStore((s) => s.users);
  const [body, setBody] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const students = user
    ? studentsAll.filter((st) => studentLinkedToUser(st, user))
    : [];
  const student = students[0];
  const classTeacher = useMemo(
    () => getClassTeacherForStudent(student),
    [student, classes, schoolUsers]
  );
  const teacherName = classTeacher?.name ?? "";
  const existingThread = student ? threads.find((t) => t.studentId === student.id) : undefined;
  const activeThread = threads.find((t) => t.id === threadId) ?? existingThread;
  const messages = activeThread ? messagesAll.filter((m) => m.threadId === activeThread.id) : [];

  useEffect(() => {
    if (!ready || !user || !student || !classTeacher) return;
    const created = getOrCreateThread(
      student.id,
      student.parentEmail || user.email || user.phone || "",
      classTeacher.name,
      student.name,
      student.className
    );
    setThreadId((current) => (current === created.id ? current : created.id));
  }, [ready, user, student, classTeacher, getOrCreateThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeThread || !user || !classTeacher) return;
    const notify = teacherNotifyAddress(classTeacher);
    sendMessage(
      activeThread.id,
      { senderRole: "parent", senderName: `${user.firstName} ${user.lastName}`, body: body.trim() },
      notify
    );
    setBody("");
  };

  const heading = classTeacher
    ? `Chat with ${teacherName}`
    : student
      ? "No class teacher is assigned to this class yet."
      : "Communicate with the class teacher.";

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader title="Messages" description={heading} />

      <div className="card-shadow flex h-[calc(100vh-220px)] min-h-[400px] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="font-medium text-slate-900">{activeThread?.subject ?? (student ? `${student.name} — ${student.className}` : "No thread")}</p>
          <p className="text-xs text-slate-500">
            Class teacher: {teacherName || "Not assigned"}
          </p>
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
        {classTeacher ? (
          <form onSubmit={handleSend} className="flex gap-2 border-t border-slate-100 p-4">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Message ${teacherName}…`}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button type="submit" className="rounded-xl bg-sky-600 p-2.5 text-white hover:bg-sky-700">
              <Send className="h-5 w-5" />
            </button>
          </form>
        ) : (
          <p className="border-t border-slate-100 px-4 py-3 text-sm text-slate-500">
            Ask the school admin to assign a class teacher on Classes before you can send a message.
          </p>
        )}
      </div>
    </PortalShell>
  );
}
