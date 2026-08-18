"use client";

import { create } from "zustand";
import type {
  Assessment,
  AssessmentScore,
  AttendanceRegister,
  AttendanceStatus,
  TermResult,
} from "@m-scholar/shared";
import { SUBJECTS, computeGrade } from "@m-scholar/shared";
import { addNotification } from "@/lib/notification-store";

const TEACHER_CLASS = "JSS 2A";
const TERM = "First Term";

const SEED_ASSESSMENTS: Assessment[] = [
  { id: "a1", className: TEACHER_CLASS, subject: "Mathematics", name: "CA1", maxScore: 20, weightPercent: 10, term: TERM },
  { id: "a2", className: TEACHER_CLASS, subject: "Mathematics", name: "CA2", maxScore: 20, weightPercent: 10, term: TERM },
  { id: "a3", className: TEACHER_CLASS, subject: "Mathematics", name: "Exam", maxScore: 60, weightPercent: 80, term: TERM },
  { id: "a4", className: TEACHER_CLASS, subject: "English", name: "CA1", maxScore: 20, weightPercent: 10, term: TERM },
  { id: "a5", className: TEACHER_CLASS, subject: "English", name: "Exam", maxScore: 60, weightPercent: 80, term: TERM },
];

const SEED_SCORES: AssessmentScore[] = [
  { id: "sc1", assessmentId: "a1", studentId: "s1", score: 16 },
  { id: "sc2", assessmentId: "a1", studentId: "s2", score: 14 },
  { id: "sc3", assessmentId: "a2", studentId: "s1", score: 18 },
  { id: "sc4", assessmentId: "a2", studentId: "s2", score: 15 },
];

const SEED_RESULTS: TermResult[] = [
  { id: "r1", studentId: "s1", subject: "Mathematics", caScore: 34, examScore: 52, totalScore: 86, grade: "A", term: TERM, status: "published", publishedAt: "2026-02-01" },
  { id: "r2", studentId: "s1", subject: "English", caScore: 28, examScore: 45, totalScore: 73, grade: "A", term: TERM, status: "published", publishedAt: "2026-02-01" },
  { id: "r3", studentId: "s2", subject: "Mathematics", caScore: 29, examScore: 40, totalScore: 69, grade: "B", term: TERM, status: "draft" },
];

const SEED_REGISTERS: AttendanceRegister[] = [
  {
    id: "reg1",
    className: TEACHER_CLASS,
    date: "2026-02-10",
    takenBy: "Emeka Nwosu",
    status: "submitted",
    records: [
      { studentId: "s1", status: "present" },
      { studentId: "s2", status: "present" },
    ],
  },
];

interface AcademicState {
  registers: AttendanceRegister[];
  assessments: Assessment[];
  scores: AssessmentScore[];
  termResults: TermResult[];

  getRegister: (className: string, date: string) => AttendanceRegister | undefined;
  saveRegister: (className: string, date: string, records: { studentId: string; status: AttendanceStatus; note?: string }[], takenBy: string) => void;
  submitRegister: (registerId: string, parentEmails: Record<string, string>) => void;

  setScore: (assessmentId: string, studentId: string, score: number) => void;
  computeTermResults: (className: string, subject: string) => void;
  publishResults: (studentIds: string[], parentEmails: Record<string, string>) => void;

  getScoresForAssessment: (assessmentId: string) => AssessmentScore[];
  getResultsForStudent: (studentId: string) => TermResult[];
  getAttendanceForStudent: (studentId: string) => { date: string; status: AttendanceStatus }[];
  getAttendanceSummary: (studentId: string) => { present: number; absent: number; late: number; total: number; percent: number };
  resetToDemo: () => void;
  applyPersisted: (data: {
    registers: AttendanceRegister[];
    assessments: Assessment[];
    scores: AssessmentScore[];
    termResults: TermResult[];
  }) => void;
}

export const useAcademicStore = create<AcademicState>()((set, get) => ({
      registers: SEED_REGISTERS,
      assessments: SEED_ASSESSMENTS,
      scores: SEED_SCORES,
      termResults: SEED_RESULTS,

      resetToDemo: () =>
        set({
          registers: SEED_REGISTERS,
          assessments: SEED_ASSESSMENTS,
          scores: SEED_SCORES,
          termResults: SEED_RESULTS,
        }),

      applyPersisted: (data) =>
        set({
          registers: data.registers ?? [],
          assessments: data.assessments ?? SEED_ASSESSMENTS,
          scores: data.scores ?? [],
          termResults: data.termResults ?? [],
        }),

      getRegister: (className, date) =>
        get().registers.find((r) => r.className === className && r.date === date),

      saveRegister: (className, date, records, takenBy) => {
        const existing = get().registers.find((r) => r.className === className && r.date === date);
        if (existing?.status === "locked") return;

        const register: AttendanceRegister = existing
          ? { ...existing, records, takenBy, status: "draft" }
          : {
              id: `reg${Date.now()}`,
              className,
              date,
              takenBy,
              status: "draft",
              records,
            };

        set((s) => ({
          registers: existing
            ? s.registers.map((r) => (r.id === existing.id ? register : r))
            : [...s.registers, register],
        }));
      },

      submitRegister: (registerId, parentEmails) => {
        const reg = get().registers.find((r) => r.id === registerId);
        if (!reg) return;

        set((s) => ({
          registers: s.registers.map((r) =>
            r.id === registerId ? { ...r, status: "submitted" as const } : r
          ),
        }));

        (reg.records ?? [])
          .filter((rec) => rec.status === "absent")
          .forEach((rec) => {
            const email = parentEmails[rec.studentId];
            if (email) {
              addNotification({
                userEmail: email,
                title: "Absence recorded",
                body: `Your child was marked absent on ${reg.date}.`,
                href: "/portal/attendance",
              });
            }
          });
      },

      setScore: (assessmentId, studentId, score) => {
        const assessment = get().assessments.find((a) => a.id === assessmentId);
        if (!assessment || score < 0 || score > assessment.maxScore) return;

        const existing = get().scores.find(
          (s) => s.assessmentId === assessmentId && s.studentId === studentId
        );

        set((s) => ({
          scores: existing
            ? s.scores.map((sc) =>
                sc.id === existing.id ? { ...sc, score } : sc
              )
            : [...s.scores, { id: `sc${Date.now()}`, assessmentId, studentId, score }],
        }));
      },

      computeTermResults: (className, subject) => {
        const subjectAssessments = get().assessments.filter(
          (a) => a.className === className && a.subject === subject
        );
        const exam = subjectAssessments.find((a) => a.name === "Exam");
        const cas = subjectAssessments.filter((a) => a.name !== "Exam");
        if (!exam) return;

        const studentIds = new Set(get().scores.map((s) => s.studentId));

        studentIds.forEach((studentId) => {
          const caTotal = cas.reduce((sum, ca) => {
            const sc = get().scores.find(
              (s) => s.assessmentId === ca.id && s.studentId === studentId
            );
            return sum + (sc?.score ?? 0);
          }, 0);

          const examScore =
            get().scores.find(
              (s) => s.assessmentId === exam.id && s.studentId === studentId
            )?.score ?? 0;

          const caMax = cas.reduce((s, c) => s + c.maxScore, 0);
          const caPercent = caMax > 0 ? (caTotal / caMax) * 20 : 0;
          const examPercent = (examScore / exam.maxScore) * 80;
          const totalScore = Math.round(caPercent + examPercent);
          const grade = computeGrade(totalScore);

          const existing = get().termResults.find(
            (r) => r.studentId === studentId && r.subject === subject && r.term === TERM
          );

          const result: TermResult = {
            id: existing?.id ?? `r${Date.now()}-${studentId}-${subject}`,
            studentId,
            subject,
            caScore: Math.round(caTotal),
            examScore,
            totalScore,
            grade,
            term: TERM,
            status: existing?.status ?? "draft",
            publishedAt: existing?.publishedAt,
          };

          set((s) => ({
            termResults: existing
              ? s.termResults.map((r) => (r.id === existing.id ? result : r))
              : [...s.termResults, result],
          }));
        });
      },

      publishResults: (studentIds, parentEmails) => {
        set((s) => ({
          termResults: s.termResults.map((r) =>
            studentIds.includes(r.studentId) && r.status === "draft"
              ? { ...r, status: "published" as const, publishedAt: new Date().toISOString().slice(0, 10) }
              : r
          ),
        }));

        studentIds.forEach((sid) => {
          const email = parentEmails[sid];
          if (email) {
            addNotification({
              userEmail: email,
              title: "Term results published",
              body: "New term results are available for viewing.",
              href: "/portal/results",
            });
          }
        });
      },

      getScoresForAssessment: (assessmentId) =>
        get().scores.filter((s) => s.assessmentId === assessmentId),

      getResultsForStudent: (studentId) =>
        get().termResults.filter((r) => r.studentId === studentId),

      getAttendanceForStudent: (studentId) => {
        const entries: { date: string; status: AttendanceStatus }[] = [];
        get().registers.forEach((reg) => {
          const rec = (reg.records ?? []).find((r) => r.studentId === studentId);
          if (rec) entries.push({ date: reg.date, status: rec.status });
        });
        return entries.sort((a, b) => b.date.localeCompare(a.date));
      },

      getAttendanceSummary: (studentId) => {
        const entries = get().getAttendanceForStudent(studentId);
        const present = entries.filter((e) => e.status === "present" || e.status === "late").length;
        const absent = entries.filter((e) => e.status === "absent").length;
        const late = entries.filter((e) => e.status === "late").length;
        const total = entries.length || 1;
        return { present, absent, late, total, percent: Math.round((present / total) * 100) };
      },
    })
);

export { TEACHER_CLASS, TERM, SUBJECTS };
