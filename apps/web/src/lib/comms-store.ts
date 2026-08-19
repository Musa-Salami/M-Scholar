"use client";

import { create } from "zustand";
import type { ChatMessage, MessageThread, TeacherNote } from "@m-scholar/shared";
import { addNotification } from "@/lib/notification-store";

const SEED_NOTES: TeacherNote[] = [
  {
    id: "n1",
    studentId: "s1",
    teacherName: "Emeka Nwosu",
    title: "Excellent class participation",
    body: "Amina has shown great improvement in phonics and number work this week. Keep encouraging her at home.",
    priority: "info",
    createdAt: "2026-02-08T09:00:00",
  },
  {
    id: "n2",
    studentId: "s1",
    teacherName: "Emeka Nwosu",
    title: "Homework reminder",
    body: "Please ensure Amina completes her phonics workbook pages due Friday.",
    priority: "warning",
    createdAt: "2026-02-10T14:30:00",
  },
];

const SEED_THREADS: MessageThread[] = [
  {
    id: "t1",
    studentId: "s1",
    parentEmail: "parent@mscholar.app",
    teacherName: "Emeka Nwosu",
    subject: "Amina Bello — Primary 1",
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    threadId: "t1",
    senderRole: "parent",
    senderName: "Fatima Bello",
    body: "Good afternoon sir, I wanted to ask about Amina's phonics homework.",
    createdAt: "2026-02-09T10:00:00",
  },
  {
    id: "m2",
    threadId: "t1",
    senderRole: "teacher",
    senderName: "Emeka Nwosu",
    body: "Good afternoon Mrs. Bello. The homework is page 12 of the phonics workbook. Due on Friday.",
    createdAt: "2026-02-09T11:30:00",
  },
];

interface CommsState {
  notes: TeacherNote[];
  threads: MessageThread[];
  messages: ChatMessage[];

  addNote: (note: Omit<TeacherNote, "id" | "createdAt">, parentEmail: string) => void;
  markNoteRead: (noteId: string) => void;
  getNotesForStudent: (studentId: string) => TeacherNote[];
  getNotesForParent: (parentEmail: string, studentIds: string[]) => TeacherNote[];

  sendMessage: (threadId: string, msg: Omit<ChatMessage, "id" | "createdAt" | "threadId">, notifyEmail: string) => void;
  getThreadForParent: (parentEmail: string) => MessageThread | undefined;
  getMessages: (threadId: string) => ChatMessage[];
  getOrCreateThread: (studentId: string, parentEmail: string, teacherName: string, studentName: string, className: string) => MessageThread;
  removeStudentRecords: (studentId: string) => void;
  resetToDemo: () => void;
  applyPersisted: (data: {
    notes: TeacherNote[];
    threads: MessageThread[];
    messages: ChatMessage[];
  }) => void;
}

export const useCommsStore = create<CommsState>()((set, get) => ({
      notes: SEED_NOTES,
      threads: SEED_THREADS,
      messages: SEED_MESSAGES,

      resetToDemo: () =>
        set({
          notes: SEED_NOTES,
          threads: SEED_THREADS,
          messages: SEED_MESSAGES,
        }),

      applyPersisted: (data) =>
        set({
          notes: data.notes ?? [],
          threads: data.threads ?? [],
          messages: data.messages ?? [],
        }),

      addNote: (note, parentEmail) => {
        const newNote: TeacherNote = {
          ...note,
          id: `n${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ notes: [newNote, ...s.notes] }));
        addNotification({
          userEmail: parentEmail,
          title: `Teacher note: ${note.title}`,
          body: note.body.slice(0, 80),
          href: "/portal/notes",
        });
      },

      markNoteRead: (noteId) => {
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId ? { ...n, readAt: new Date().toISOString() } : n
          ),
        }));
      },

      getNotesForStudent: (studentId) =>
        get().notes.filter((n) => n.studentId === studentId),

      getNotesForParent: (parentEmail, studentIds) => {
        void parentEmail;
        return get().notes.filter((n) => studentIds.includes(n.studentId));
      },

      sendMessage: (threadId, msg, notifyEmail) => {
        const message: ChatMessage = {
          ...msg,
          id: `m${Date.now()}`,
          threadId,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ messages: [...s.messages, message] }));
        if (notifyEmail.trim()) {
          addNotification({
            userEmail: notifyEmail,
            title: `New message from ${msg.senderName}`,
            body: msg.body.slice(0, 80),
            href: msg.senderRole === "teacher" ? "/portal/messages" : "/teacher/messages",
          });
        }
      },

      getThreadForParent: (parentEmail) =>
        get().threads.find((t) => t.parentEmail === parentEmail),

      getMessages: (threadId) =>
        get().messages.filter((m) => m.threadId === threadId),

      getOrCreateThread: (studentId, parentEmail, teacherName, studentName, className) => {
        const existing = get().threads.find((t) => t.studentId === studentId);
        const subject = `${studentName} — ${className}`;
        if (existing) {
          if (
            existing.teacherName === teacherName &&
            existing.subject === subject &&
            existing.parentEmail === parentEmail
          ) {
            return existing;
          }
          const updated: MessageThread = {
            ...existing,
            parentEmail: parentEmail || existing.parentEmail,
            teacherName: teacherName || existing.teacherName,
            subject,
          };
          set((s) => ({
            threads: s.threads.map((t) => (t.id === existing.id ? updated : t)),
          }));
          return updated;
        }

        const thread: MessageThread = {
          id: `t${Date.now()}`,
          studentId,
          parentEmail,
          teacherName,
          subject,
        };
        set((s) => ({ threads: [...s.threads, thread] }));
        return thread;
      },

      removeStudentRecords: (studentId) => {
        const threadIds = new Set(get().threads.filter((t) => t.studentId === studentId).map((t) => t.id));
        set((s) => ({
          notes: s.notes.filter((n) => n.studentId !== studentId),
          threads: s.threads.filter((t) => t.studentId !== studentId),
          messages: s.messages.filter((m) => !threadIds.has(m.threadId)),
        }));
      },
    })
);
