"use client";

import { useMemo, useState } from "react";
import { Download, Eye, Search } from "lucide-react";
import type { Student } from "@m-scholar/shared";
import { ReportCardModal } from "@/components/report-card-modal";
import { useAcademicStore } from "@/lib/academic-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore } from "@/lib/school-store";
import { formatCurrency } from "@/lib/utils";

export function publishedResultCount(studentId: string, termResults: { studentId: string; status: string }[]) {
  return termResults.filter((r) => r.studentId === studentId && r.status === "published").length;
}

export function StudentResultButtons({ studentId, compact = false }: { studentId: string; compact?: boolean }) {
  const termResults = useAcademicStore((s) => s.termResults);
  const [open, setOpen] = useState(false);
  const count = publishedResultCount(studentId, termResults ?? []);
  return (
    <>
      <button
        type="button"
        disabled={count === 0}
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium ${
          count === 0
            ? "cursor-not-allowed text-slate-400"
            : "text-sky-700 hover:bg-sky-50"
        }`}
        title={count === 0 ? "No published results yet" : "Download report card PDF"}
      >
        <Download className="h-4 w-4" />
        {compact ? "Download" : "Download result"}
      </button>
      {open && <ReportCardModal studentId={studentId} onClose={() => setOpen(false)} />}
    </>
  );
}

export function StudentRecordDetails({ student }: { student: Student }) {
  const invoices = useFinanceStore((s) => s.invoices);
  const termResults = useAcademicStore((s) => s.termResults);
  const getAttendanceSummary = useAcademicStore((s) => s.getAttendanceSummary);
  const classes = useSchoolStore((s) => s.classes);
  const users = useSchoolStore((s) => s.users);

  const attendance = getAttendanceSummary(student.id);
  const feeBalance = (invoices ?? [])
    .filter((i) => i.studentId === student.id)
    .reduce((sum, i) => sum + (i.balance || 0), 0);
  const results = (termResults ?? []).filter((r) => r.studentId === student.id && r.status === "published");
  const classRec = classes.find((c) => c.name === student.className);
  const teacher = users.find((u) => u.id === classRec?.teacherId);

  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Student record</p>
          <h4 className="mt-1 font-display text-lg font-semibold text-slate-900">{student.name}</h4>
          <p className="text-sm text-slate-600">
            {student.admissionNo} · {student.className}
            {teacher ? ` · Teacher: ${teacher.name}` : ""}
          </p>
        </div>
        <StudentResultButtons studentId={student.id} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm">
        <p>
          <span className="text-slate-500">Attendance</span>
          <br />
          <span className="font-medium text-slate-900">{attendance.percent}%</span>
        </p>
        <p>
          <span className="text-slate-500">Fee balance</span>
          <br />
          <span className="font-medium text-slate-900">{formatCurrency(feeBalance)}</span>
        </p>
        <p>
          <span className="text-slate-500">Parent</span>
          <br />
          <span className="font-medium text-slate-900">{student.parentEmail}</span>
        </p>
        <p>
          <span className="text-slate-500">Published subjects</span>
          <br />
          <span className="font-medium text-slate-900">{results.length}</span>
        </p>
      </div>
      {results.length > 0 && (
        <p className="mt-3 text-xs text-slate-500">
          Latest grades: {results.map((r) => `${r.subject} ${r.grade}`).join(" · ")}
        </p>
      )}
    </div>
  );
}

export function StudentLookupPanel({
  title = "Pull student records",
  description = "Search by name, admission number, class, or parent email. Download a result PDF when it has been published.",
}: {
  title?: string;
  description?: string;
}) {
  const students = useFinanceStore((s) => s.students);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = students ?? [];
    if (!q) return list;
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.className.toLowerCase().includes(q) ||
        s.parentEmail.toLowerCase().includes(q) ||
        (s.studentEmail ?? "").toLowerCase().includes(q)
    );
  }, [students, query]);

  const selected = matches.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="card-shadow rounded-2xl border border-slate-100 bg-white p-6">
      <h3 className="font-display font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="relative mt-4 max-w-lg">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-500"
        />
      </div>

      {selected && (
        <div className="mt-4">
          <StudentRecordDetails student={selected} />
        </div>
      )}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="py-2 pr-3">Admission</th>
              <th className="py-2 pr-3">Name</th>
              <th className="py-2 pr-3">Class</th>
              <th className="py-2 pr-3">Parent</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-slate-500">
                  No student records match this search.
                </td>
              </tr>
            ) : (
              matches.map((s) => (
                <tr key={s.id} className="align-middle">
                  <td className="py-3 pr-3 font-medium">{s.admissionNo}</td>
                  <td className="py-3 pr-3">{s.name}</td>
                  <td className="py-3 pr-3 text-slate-500">{s.className}</td>
                  <td className="py-3 pr-3 text-slate-500">{s.parentEmail}</td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50"
                      >
                        <Eye className="h-4 w-4" /> Pull record
                      </button>
                      <StudentResultButtons studentId={s.id} compact />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
