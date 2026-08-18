"use client";

import { Download, X } from "lucide-react";
import type { TermResult } from "@m-scholar/shared";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useSchoolStore } from "@/lib/school-store";
import { SimplePdf } from "@/lib/pdf";

interface ReportCardModalProps {
  studentId: string;
  onClose: () => void;
}

export function ReportCardModal({ studentId, onClose }: ReportCardModalProps) {
  const getStudent = useFinanceStore((s) => s.getStudent);
  const getResultsForStudent = useAcademicStore((s) => s.getResultsForStudent);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);
  const settings = useSchoolStore((s) => s.settings);
  const classes = useSchoolStore((s) => s.classes);
  const users = useSchoolStore((s) => s.users);

  const student = getStudent(studentId);
  const results = getResultsForStudent(studentId).filter((r) => r.status === "published");
  const attendance = getAttendanceSummary(studentId);
  const average = results.length
    ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
    : 0;
  const classRec = classes.find((c) => c.name === student?.className);
  const teacher = users.find((u) => u.id === classRec?.teacherId)?.name ?? "Class Teacher";

  const downloadPdf = () => {
    const pdf = new SimplePdf();
    pdf.heading(
      settings.schoolName,
      `Terminal report card — ${settings.term} · ${settings.session}`
    );
    pdf.keyValues([
      ["Name", student?.name ?? "—"],
      ["Admission No.", student?.admissionNo ?? "—"],
      ["Class", student?.className ?? "—"],
      ["Attendance", `${attendance.percent}%`],
      ["Overall average", `${average}%`],
    ]);
    pdf.table(
      ["Subject", "CA", "Exam", "Total", "Grade"],
      results.map((r: TermResult) => [
        r.subject,
        String(r.caScore),
        String(r.examScore),
        String(r.totalScore),
        r.grade,
      ])
    );
    pdf.paragraph(`Class teacher: ${teacher}. ${settings.address}. This official report is issued as a PDF.`);
    pdf.save(`${student?.admissionNo ?? "report-card"}-report-card.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-display font-semibold">Report Card</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">{settings.schoolName}</h1>
          <p className="text-sm text-slate-500">
            Terminal Report — {settings.term} · {settings.session}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p><strong>Name:</strong> {student?.name}</p>
            <p><strong>Admission No:</strong> {student?.admissionNo}</p>
            <p><strong>Class:</strong> {student?.className}</p>
            <p><strong>Attendance:</strong> {attendance.percent}%</p>
          </div>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Subject</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">CA</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Exam</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Total</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: TermResult) => (
                <tr key={r.id}>
                  <td className="border border-slate-200 px-2 py-2">{r.subject}</td>
                  <td className="border border-slate-200 px-2 py-2">{r.caScore}</td>
                  <td className="border border-slate-200 px-2 py-2">{r.examScore}</td>
                  <td className="border border-slate-200 px-2 py-2">{r.totalScore}</td>
                  <td className="border border-slate-200 px-2 py-2">{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-semibold">Overall Average: {average}%</p>
          <p className="mt-6 text-xs text-slate-500">Class Teacher: {teacher}</p>
        </div>
        <div className="border-t p-4">
          <button
            onClick={downloadPdf}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download className="h-4 w-4" /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
