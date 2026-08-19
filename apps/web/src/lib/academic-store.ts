"use client";

import { create } from "zustand";
import type {
  Assessment,
  AssessmentScore,
  AttendanceRegister,
  AttendanceStatus,
  ClassAssignment,
  TermResult,
} from "@m-scholar/shared";
import { SUBJECTS, computeGrade, ASSESSMENT_COMPONENTS, isExamAssessment } from "@m-scholar/shared";
import { addNotification } from "@/lib/notification-store";

const TEACHER_CLASS = "Primary 1";
const TERM = "First Term";

const SEED_ASSESSMENTS: Assessment[] = [
  { id: "a1", className: TEACHER_CLASS, subject: "Mathematics", name: "CA1", maxScore: 10, weightPercent: 10, term: TERM },
  { id: "a2", className: TEACHER_CLASS, subject: "Mathematics", name: "CA2", maxScore: 10, weightPercent: 10, term: TERM },
  { id: "a3", className: TEACHER_CLASS, subject: "Mathematics", name: "Midterm", maxScore: 20, weightPercent: 20, term: TERM },
  { id: "a6", className: TEACHER_CLASS, subject: "Mathematics", name: "Exam", maxScore: 60, weightPercent: 60, term: TERM },
  { id: "a4", className: TEACHER_CLASS, subject: "English", name: "CA1", maxScore: 10, weightPercent: 10, term: TERM },
  { id: "a5", className: TEACHER_CLASS, subject: "English", name: "CA2", maxScore: 10, weightPercent: 10, term: TERM },
  { id: "a7", className: TEACHER_CLASS, subject: "English", name: "Midterm", maxScore: 20, weightPercent: 20, term: TERM },
  { id: "a8", className: TEACHER_CLASS, subject: "English", name: "Exam", maxScore: 60, weightPercent: 60, term: TERM },
];

const SEED_SCORES: AssessmentScore[] = [
  { id: "sc1", assessmentId: "a1", studentId: "s1", score: 8 },
  { id: "sc2", assessmentId: "a1", studentId: "s2", score: 7 },
  { id: "sc3", assessmentId: "a2", studentId: "s1", score: 9 },
  { id: "sc4", assessmentId: "a2", studentId: "s2", score: 7 },
];

const SEED_RESULTS: TermResult[] = [
  { id: "r1", studentId: "s1", subject: "Mathematics", caScore: 17, examScore: 52, totalScore: 69, grade: "B", term: TERM, status: "published", publishedAt: "2026-02-01" },
  { id: "r2", studentId: "s1", subject: "English", caScore: 28, examScore: 45, totalScore: 73, grade: "A", term: TERM, status: "published", publishedAt: "2026-02-01" },
  { id: "r3", studentId: "s2", subject: "Mathematics", caScore: 14, examScore: 40, totalScore: 54, grade: "C", term: TERM, status: "draft" },
];

const SEED_ASSIGNMENTS: ClassAssignment[] = [
  {
    id: "hw1",
    className: TEACHER_CLASS,
    subject: "English",
    title: "Phonics workbook — page 12, sounds of the week",
    details: "Practise the letter sounds at home and bring the workbook on Friday.",
    dueDate: "2026-08-21",
    teacherName: "Emeka Nwosu",
    createdAt: "2026-08-17T09:00:00",
  },
  {
    id: "hw2",
    className: TEACHER_CLASS,
    subject: "Qur'an",
    title: "Qur'an recitation practice",
    details: "Revise the short surah taught this week. Recitation will be heard in the next Tahfeez lesson.",
    dueDate: "2026-08-22",
    teacherName: "Emeka Nwosu",
    createdAt: "2026-08-17T09:30:00",
  },
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
  assignments: ClassAssignment[];

  getRegister: (className: string, date: string) => AttendanceRegister | undefined;
  saveRegister: (className: string, date: string, records: { studentId: string; status: AttendanceStatus; note?: string }[], takenBy: string) => void;
  submitRegister: (registerId: string, parentEmails: Record<string, string>) => void;

  setScore: (assessmentId: string, studentId: string, score: number) => { ok: boolean; error?: string };
  computeTermResults: (className: string, subject: string, studentIds?: string[]) => void;
  publishResults: (studentIds: string[], parentEmails: Record<string, string>) => void;
  setResultStatus: (
    resultId: string,
    status: "draft" | "published",
    actor: "super_admin" | "class_teacher"
  ) => { ok: boolean; error?: string };
  addSubject: (className: string, subject: string) => { ok: boolean; error?: string };
  deleteSubject: (className: string, subject: string, studentIds: string[]) => { ok: boolean; error?: string };
  addAssignment: (data: Omit<ClassAssignment, "id" | "createdAt">, parentEmails: string[]) => void;

  getScoresForAssessment: (assessmentId: string) => AssessmentScore[];
  getResultsForStudent: (studentId: string) => TermResult[];
  getAttendanceForStudent: (studentId: string) => { date: string; status: AttendanceStatus }[];
  getAttendanceSummary: (studentId: string) => { present: number; absent: number; late: number; total: number; percent: number };
  removeStudentRecords: (studentId: string) => void;
  renameClass: (from: string, to: string) => void;
  resetToDemo: () => void;
  applyPersisted: (data: {
    registers: AttendanceRegister[];
    assessments: Assessment[];
    scores: AssessmentScore[];
    termResults: TermResult[];
    assignments?: ClassAssignment[];
  }) => void;
}

export const useAcademicStore = create<AcademicState>()((set, get) => ({
      registers: SEED_REGISTERS,
      assessments: SEED_ASSESSMENTS,
      scores: SEED_SCORES,
      termResults: SEED_RESULTS,
      assignments: SEED_ASSIGNMENTS,

      resetToDemo: () =>
        set({
          registers: SEED_REGISTERS,
          assessments: SEED_ASSESSMENTS,
          scores: SEED_SCORES,
          termResults: SEED_RESULTS,
          assignments: SEED_ASSIGNMENTS,
        }),

      applyPersisted: (data) =>
        set({
          registers: data.registers ?? [],
          assessments: data.assessments ?? SEED_ASSESSMENTS,
          scores: data.scores ?? [],
          termResults: data.termResults ?? [],
          assignments: data.assignments ?? [],
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
        if (!assessment || score < 0 || score > assessment.maxScore) {
          return { ok: false, error: "Enter a mark within the allowed range." };
        }
        const published = get().termResults.find(
          (r) =>
            r.studentId === studentId &&
            r.subject === assessment.subject &&
            r.term === (assessment.term || TERM) &&
            r.status === "published"
        );
        if (published) {
          return { ok: false, error: "This result is published. Ask the super admin to return it to draft before you edit." };
        }

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
        return { ok: true };
      },

      computeTermResults: (className, subject, studentIds) => {
        const subjectAssessments = get().assessments.filter(
          (a) => a.className === className && a.subject === subject
        );
        const exam = subjectAssessments.find((a) => isExamAssessment(a.name));
        const cas = subjectAssessments.filter((a) => !isExamAssessment(a.name));
        if (!exam) return;

        const ids =
          studentIds && studentIds.length > 0
            ? studentIds
            : [
                ...new Set(
                  get()
                    .scores.filter((s) => subjectAssessments.some((a) => a.id === s.assessmentId))
                    .map((s) => s.studentId)
                ),
              ];

        ids.forEach((studentId) => {
          const existing = get().termResults.find(
            (r) => r.studentId === studentId && r.subject === subject && r.term === TERM
          );
          if (existing?.status === "published") return;

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

          const totalScore = Math.round(caTotal + examScore);
          const grade = computeGrade(totalScore);

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

      setResultStatus: (resultId, status, actor) => {
        const current = get().termResults.find((r) => r.id === resultId);
        if (!current) return { ok: false, error: "Result not found." };
        if (actor === "class_teacher" && current.status === "published" && status === "draft") {
          return { ok: false, error: "Only the super admin can return a published result to draft." };
        }
        set((s) => ({
          termResults: s.termResults.map((r) =>
            r.id === resultId
              ? {
                  ...r,
                  status,
                  publishedAt: status === "published" ? new Date().toISOString().slice(0, 10) : undefined,
                }
              : r
          ),
        }));
        return { ok: true };
      },

      addSubject: (className, subject) => {
        const name = subject.trim();
        if (!name) return { ok: false, error: "Enter a subject name." };
        const exists = get().assessments.some(
          (a) => a.className === className && a.subject.toLowerCase() === name.toLowerCase()
        );
        if (exists) return { ok: false, error: "That subject is already on this class." };
        const stamp = Date.now();
        const created: Assessment[] = ASSESSMENT_COMPONENTS.map((component, index) => ({
          id: `a${stamp}-${index}`,
          className,
          subject: name,
          name: component.name,
          maxScore: component.maxScore,
          weightPercent: component.weightPercent,
          term: TERM,
        }));
        set((s) => ({ assessments: [...s.assessments, ...created] }));
        return { ok: true };
      },

      deleteSubject: (className, subject, studentIds) => {
        const ids = new Set(
          get()
            .assessments.filter((a) => a.className === className && a.subject === subject)
            .map((a) => a.id)
        );
        if (ids.size === 0) return { ok: false, error: "Subject not found on this class." };
        const classStudentIds = new Set(studentIds);
        set((s) => ({
          assessments: s.assessments.filter((a) => !ids.has(a.id)),
          scores: s.scores.filter((sc) => !ids.has(sc.assessmentId)),
          termResults: s.termResults.filter(
            (r) => !(r.subject === subject && classStudentIds.has(r.studentId))
          ),
        }));
        return { ok: true };
      },

      addAssignment: (data, parentEmails) => {
        const assignment: ClassAssignment = {
          ...data,
          id: `hw${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ assignments: [assignment, ...s.assignments] }));
        Array.from(new Set(parentEmails.filter(Boolean))).forEach((email) => {
          addNotification({
            userEmail: email,
            title: `New assignment: ${data.subject}`,
            body: `${data.title} is due ${data.dueDate}.`,
            href: "/portal/dashboard",
          });
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

      removeStudentRecords: (studentId) => {
        set((s) => ({
          scores: s.scores.filter((sc) => sc.studentId !== studentId),
          termResults: s.termResults.filter((r) => r.studentId !== studentId),
          registers: s.registers.map((reg) => ({
            ...reg,
            records: (reg.records ?? []).filter((r) => r.studentId !== studentId),
          })),
        }));
      },

      renameClass: (from, to) => {
        if (!from || from === to) return;
        set((s) => ({
          registers: s.registers.map((r) => (r.className === from ? { ...r, className: to } : r)),
          assessments: s.assessments.map((a) => (a.className === from ? { ...a, className: to } : a)),
          assignments: s.assignments.map((a) => (a.className === from ? { ...a, className: to } : a)),
        }));
      },
    })
);

export { TEACHER_CLASS, TERM, SUBJECTS };
