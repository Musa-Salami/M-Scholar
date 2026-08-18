"use client";

import { useState } from "react";
import { PORTAL_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useFinanceStore } from "@/lib/finance-store";
import { studentLinkedToUser } from "@/lib/credentials";
import { useAcademicStore } from "@/lib/academic-store";
import { ReportCardModal } from "@/components/report-card-modal";
import { obtainableMarks } from "@/lib/report-card";

export default function PortalResultsPage() {
  const { ready, user } = useRequireAuth(["parent", "student"]);
  const studentsAll = useFinanceStore((s) => s.students ?? []);
  const termResults = useAcademicStore((s) => s.termResults ?? []);
  const assessments = useAcademicStore((s) => s.assessments ?? []);
  const [showReport, setShowReport] = useState(false);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const students = studentsAll.filter((st) => studentLinkedToUser(st, user));
  const student = students[0];
  const results = student
    ? termResults.filter((r) => r.studentId === student.id && r.status === "published")
    : [];
  const average = results.length
    ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
    : 0;
  const marks = obtainableMarks(assessments, student?.className);

  return (
    <PortalShell navItems={PORTAL_NAV} title="Parent / Student Portal">
      <PageHeader
        title="Results & Performance"
        description={student ? `Term results for ${student.name}.` : "No linked student."}
        action={
          student && results.length > 0 ? (
            <button onClick={() => setShowReport(true)} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">
              Download report card
            </button>
          ) : undefined
        }
      />

      {results.length === 0 ? (
        <div className="card-shadow rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="text-slate-500">No published results yet. Results will appear here once the class teacher publishes them.</p>
        </div>
      ) : (
        <>
          <div className="card-shadow mb-6 rounded-2xl border border-sky-100 bg-sky-50 p-5">
            <p className="text-sm text-sky-700">Overall average</p>
            <p className="font-display text-3xl font-bold text-sky-900">{average}%</p>
          </div>
          <div className="card-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-3">Subject</th>
                  <th className="px-6 py-3">CA ({marks.ca})</th>
                  <th className="px-6 py-3">Exam ({marks.exam})</th>
                  <th className="px-6 py-3">Total ({marks.total})</th>
                  <th className="px-6 py-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr key={r.id}>
                    <td className="px-6 py-4 font-medium">{r.subject}</td>
                    <td className="px-6 py-4">{r.caScore}</td>
                    <td className="px-6 py-4">{r.examScore}</td>
                    <td className="px-6 py-4">{r.totalScore}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">{r.grade}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showReport && student && <ReportCardModal studentId={student.id} onClose={() => setShowReport(false)} />}
    </PortalShell>
  );
}
