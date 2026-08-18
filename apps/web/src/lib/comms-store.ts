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
    body: "Amina has shown great improvement in Mathematics this week. Keep encouraging her at home.",
    priority: "info",
    createdAt: "2026-02-08T09:00:00",
  },
  {
    id: "n2",
    studentId: "s1",
    teacherName: "Emeka Nwosu",
    title: "Homework reminder",
    body: "Please ensure Amina completes her English assignment due Friday.",
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
    subject: "Amina Bello — JSS 2A",
  },
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    threadId: "t1",
    senderRole: "parent",
    senderName: "Fatima Bello",
    body: "Good afternoon sir, I wanted to ask about Amina's Mathematics homework.",
    createdAt: "2026-02-09T10:00:00",
  },
  {
    id: "m2",
    threadId: "t1",
    senderRole: "teacher",
    senderName: "Emeka Nwosu",
    body: "Good afternoon Mrs. Bello. The homework is on page 42, exercises 1-5. Due on Friday.",
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
}

export const useCommsStore = create<CommsState>()((set, get) => ({
      notes: SEED_NOTES,
      threads: SEED_THREADS,
      messages: SEED_MESSAGES,

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
        addNotification({
          userEmail: notifyEmail,
          title: `New message from ${msg.senderName}`,
          body: msg.body.slice(0, 80),
          href: msg.senderRole === "teacher" ? "/portal/messages" : "/teacher/messages",
        });
      },

      getThreadForParent: (parentEmail) =>
        get().threads.find((t) => t.parentEmail === parentEmail),

      getMessages: (threadId) =>
        get().messages.filter((m) => m.threadId === threadId),

      getOrCreateThread: (studentId, parentEmail, teacherName, studentName, className) => {
        const existing = get().threads.find(
          (t) => t.studentId === studentId && t.parentEmail === parentEmail
        );
        if (existing) return existing;

        const thread: MessageThread = {
          id: `t${Date.now()}`,
          studentId,
          parentEmail,
          teacherName,
          subject: `${studentName} — ${className}`,
        };
        set((s) => ({ threads: [...s.threads, thread] }));
        return thread;
      },
    })
);
