"use client";

import { useRef } from "react";
import { Printer, X } from "lucide-react";
import type { TermResult } from "@m-scholar/shared";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { TERM } from "@/lib/academic-store";

interface ReportCardModalProps {
  studentId: string;
  onClose: () => void;
}

export function ReportCardModal({ studentId, onClose }: ReportCardModalProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const getStudent = useFinanceStore((s) => s.getStudent);
  const getResultsForStudent = useAcademicStore((s) => s.getResultsForStudent);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);

  const student = getStudent(studentId);
  const results = getResultsForStudent(studentId).filter((r) => r.status === "published");
  const attendance = getAttendanceSummary(studentId);
  const average = results.length
    ? Math.round(results.reduce((s, r) => s + r.totalScore, 0) / results.length)
    : 0;

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Report Card</title>
      <style>body{font-family:Arial,sans-serif;padding:40px;max-width:700px;margin:0 auto}
      h1{color:#2563eb}table{width:100%;border-collapse:collapse;margin:16px 0}
      th,td{padding:8px;border:1px solid #e2e8f0;text-align:left}th{background:#f8fafc}
      </style></head><body>${content.innerHTML}</body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="font-display font-semibold">Report Card</h3>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>
        <div ref={printRef} className="p-6">
          <h1 className="text-xl font-bold text-blue-600">M-Scholar Demo Academy</h1>
          <p className="text-sm text-slate-500">Terminal Report — {TERM}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            <p><strong>Name:</strong> {student?.name}</p>
            <p><strong>Admission No:</strong> {student?.admissionNo}</p>
            <p><strong>Class:</strong> {student?.className}</p>
            <p><strong>Attendance:</strong> {attendance.percent}%</p>
          </div>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr>
                <th>Subject</th><th>CA</th><th>Exam</th><th>Total</th><th>Grade</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r: TermResult) => (
                <tr key={r.id}>
                  <td>{r.subject}</td>
                  <td>{r.caScore}</td>
                  <td>{r.examScore}</td>
                  <td>{r.totalScore}</td>
                  <td>{r.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-4 font-semibold">Overall Average: {average}%</p>
          <p className="mt-6 text-xs text-slate-500">Class Teacher: Emeka Nwosu · Principal: M-Scholar Academy</p>
        </div>
        <div className="border-t p-4">
          <button onClick={handlePrint} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white">
            <Printer className="h-4 w-4" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
