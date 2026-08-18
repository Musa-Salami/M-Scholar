"use client";

import { Download, X } from "lucide-react";
import type { TermResult } from "@m-scholar/shared";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useSchoolStore } from "@/lib/school-store";
import { SimplePdf } from "@/lib/pdf";
import {
  formatResumptionDate,
  obtainableMarks,
  principalRemark,
  teacherRemark,
} from "@/lib/report-card";

interface ReportCardModalProps {
  studentId: string;
  onClose: () => void;
}

export function ReportCardModal({ studentId, onClose }: ReportCardModalProps) {
  const getStudent = useFinanceStore((s) => s.getStudent);
  const getResultsForStudent = useAcademicStore((s) => s.getResultsForStudent);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);
  const assessments = useAcademicStore((s) => s.assessments);
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
  const principal = settings.principalName || "The Principal";
  const marks = obtainableMarks(assessments ?? [], student?.className);
  const teacherComment = teacherRemark(average, student?.name ?? "This student");
  const principalComment = principalRemark(average);
  const resumption = formatResumptionDate(settings.nextTermResumptionDate);

  const downloadPdf = () => {
    const pdf = new SimplePdf();
    pdf.heading(
      settings.schoolName,
      `Official terminal report card — ${settings.term} · ${settings.session}`
    );
    pdf.keyValues([
      ["Name", student?.name ?? "—"],
      ["Admission No.", student?.admissionNo ?? "—"],
      ["Class", student?.className ?? "—"],
      ["Attendance", `${attendance.percent}%`],
      ["Overall average", `${average}%`],
      ["Next term resumes", resumption],
    ]);
    pdf.table(
      ["Subject", `CA (${marks.ca})`, `Exam (${marks.exam})`, `Total (${marks.total})`, "Grade"],
      results.map((r: TermResult) => [
        r.subject,
        String(r.caScore),
        String(r.examScore),
        String(r.totalScore),
        r.grade,
      ])
    );
    pdf.commentBox("Class teacher's comment", teacherComment);
    pdf.commentBox("Principal's comment", principalComment);
    pdf.paragraph(`Next term resumption date: ${resumption}.`);
    pdf.signatureBlock([
      { role: "Class Teacher", name: teacher },
      { role: "Official stamp", name: "School seal" },
      { role: "Principal", name: principal },
    ]);
    pdf.paragraph(
      `This is an official record of ${settings.schoolName}. ${settings.address}. ${settings.phone}.`
    );
    pdf.save(`${student?.admissionNo ?? "report-card"}-report-card.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-display font-semibold">Report Card</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600">{settings.schoolName}</h1>
          <p className="text-sm text-slate-500">
            Official Terminal Report — {settings.term} · {settings.session}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p>
              <strong>Name:</strong> {student?.name}
            </p>
            <p>
              <strong>Admission No:</strong> {student?.admissionNo}
            </p>
            <p>
              <strong>Class:</strong> {student?.className}
            </p>
            <p>
              <strong>Attendance:</strong> {attendance.percent}%
            </p>
          </div>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Subject</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">CA ({marks.ca})</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Exam ({marks.exam})</th>
                <th className="border border-slate-200 bg-slate-50 px-2 py-2 text-left">Total ({marks.total})</th>
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

          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Class teacher&apos;s comment</p>
            <p className="mt-2 text-sm text-slate-800">{teacherComment}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{teacher}</p>
          </div>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Principal&apos;s comment</p>
            <p className="mt-2 text-sm text-slate-800">{principalComment}</p>
            <p className="mt-3 text-sm font-medium text-slate-900">{principal}</p>
          </div>

          <p className="mt-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900">
            Next term resumption date: {resumption}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-800">Class Teacher</p>
              <p className="text-xs text-slate-600">{teacher}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-slate-400 text-center text-[10px] font-semibold uppercase leading-tight text-slate-500">
                Official
                <br />
                Stamp
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-800">School seal</p>
            </div>
            <div>
              <div className="h-10 border-b border-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-800">Principal</p>
              <p className="text-xs text-slate-600">{principal}</p>
            </div>
          </div>
          <p className="mt-6 text-[11px] text-slate-500">
            This is an official record of {settings.schoolName}. {settings.address}.
          </p>
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
