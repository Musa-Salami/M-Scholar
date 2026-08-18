"use client";

import { useState } from "react";
import { TEACHER_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { btnPrimary, selectClass } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore, TEACHER_CLASS, SUBJECTS } from "@/lib/academic-store";

export default function TeacherAssessmentsPage() {
  useRequireAuth(["class_teacher"]);
  const students = useFinanceStore((s) => (s.students ?? []).filter((st) => st.className === TEACHER_CLASS));
  const { assessments, setScore, getScoresForAssessment, computeTermResults, termResults, publishResults } = useAcademicStore();
  const [subject, setSubject] = useState<string>(SUBJECTS[0]);
  const [toast, setToast] = useState("");

  const subjectAssessments = assessments.filter((a) => a.subject === subject && a.className === TEACHER_CLASS);

  const handleCompute = () => {
    computeTermResults(TEACHER_CLASS, subject);
    setToast(`Term results computed for ${subject}.`);
    setTimeout(() => setToast(""), 3000);
  };

  const handlePublish = () => {
    const parentEmails: Record<string, string> = {};
    students.forEach((s) => { parentEmails[s.id] = s.parentEmail; });
    publishResults(students.map((s) => s.id), parentEmails);
    setToast("Results published to parent portal.");
    setTimeout(() => setToast(""), 3000);
  };

  const draftCount = termResults.filter((r) => r.status === "draft" && students.some((s) => s.id === r.studentId)).length;

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader
        title="Assessments & Results"
        description="Enter CA scores, exam marks, and publish term results."
        action={
          <div className="flex gap-2">
            <button onClick={handleCompute} className={btnPrimary}>Compute results</button>
            <button onClick={handlePublish} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              Publish ({draftCount} draft)
            </button>
          </div>
        }
      />

      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}

      <div className="mb-6">
        <label className="mb-1 block text-sm font-medium">Subject</label>
        <select value={subject} onChange={(e) => setSubject(e.target.value)} className={selectClass}>
          {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {subjectAssessments.map((assessment) => (
        <div key={assessment.id} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-semibold text-slate-900">{assessment.name} (max {assessment.maxScore})</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {students.map((student) => {
              const existing = getScoresForAssessment(assessment.id).find((sc) => sc.studentId === student.id);
              return (
                <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium">{student.name}</span>
                  <input
                    type="number"
                    min={0}
                    max={assessment.maxScore}
                    defaultValue={existing?.score ?? ""}
                    onBlur={(e) => setScore(assessment.id, student.id, Number(e.target.value))}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-sm text-right"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <h3 className="mb-4 font-display font-semibold">Term results preview</h3>
      <div className="card-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">CA</th>
              <th className="px-6 py-3">Exam</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Grade</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {termResults
              .filter((r) => students.some((s) => s.id === r.studentId))
              .map((r) => {
                const student = students.find((s) => s.id === r.studentId);
                return (
                  <tr key={r.id}>
                    <td className="px-6 py-4">{student?.name}</td>
                    <td className="px-6 py-4">{r.subject}</td>
                    <td className="px-6 py-4">{r.caScore}</td>
                    <td className="px-6 py-4">{r.examScore}</td>
                    <td className="px-6 py-4 font-medium">{r.totalScore}</td>
                    <td className="px-6 py-4">{r.grade}</td>
                    <td className="px-6 py-4 capitalize">{r.status}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
