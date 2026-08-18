"use client";

import { useState, useEffect } from "react";
import { TEACHER_NAV, ATTENDANCE_LABELS, type AttendanceStatus } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { btnPrimary } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthStore } from "@/lib/auth-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore, TEACHER_CLASS } from "@/lib/academic-store";
import { cn } from "@/lib/utils";

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"];

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-200",
  absent: "bg-red-100 text-red-800 border-red-200",
  late: "bg-amber-100 text-amber-800 border-amber-200",
  excused: "bg-sky-100 text-sky-800 border-sky-200",
};

export default function TeacherAttendancePage() {
  useRequireAuth(["class_teacher"]);
  const { user } = useAuthStore();
  const students = useFinanceStore((s) => (s.students ?? []).filter((st) => st.className === TEACHER_CLASS));
  const { getRegister, saveRegister, submitRegister } = useAcademicStore();

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const register = getRegister(TEACHER_CLASS, date);

  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  useEffect(() => {
    if (register) {
      const m: Record<string, AttendanceStatus> = {};
      register.records.forEach((r) => { m[r.studentId] = r.status; });
      setMarks(m);
    } else {
      const init: Record<string, AttendanceStatus> = {};
      students.forEach((s) => { init[s.id] = "present"; });
      setMarks(init);
    }
  }, [register, date, students]);

  const handleSave = () => {
    saveRegister(
      TEACHER_CLASS,
      date,
      students.map((s) => ({ studentId: s.id, status: marks[s.id] ?? "present" })),
      user ? `${user.firstName} ${user.lastName}` : "Teacher"
    );
  };

  const handleSubmit = () => {
    handleSave();
    const reg = getRegister(TEACHER_CLASS, date);
    if (!reg) return;
    const parentEmails: Record<string, string> = {};
    students.forEach((s) => { parentEmails[s.id] = s.parentEmail; });
    submitRegister(reg.id, parentEmails);
  };

  const isSubmitted = register?.status === "submitted" || register?.status === "locked";

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader title="Attendance Register" description={`${TEACHER_CLASS} — mark daily attendance.`} />

      <div className="card-shadow mb-6 flex flex-wrap items-end gap-4 rounded-2xl border border-slate-100 bg-white p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm" />
        </div>
        {register && (
          <span className={cn("rounded-full px-3 py-1 text-xs font-medium", isSubmitted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800")}>
            {register.status}
          </span>
        )}
        <div className="flex gap-2 ml-auto">
          <button onClick={handleSave} disabled={isSubmitted} className={btnPrimary}>Save draft</button>
          <button onClick={handleSubmit} disabled={isSubmitted} className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60">
            Submit register
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {students.map((student) => (
          <div key={student.id} className="card-shadow flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4">
            <div>
              <p className="font-medium text-slate-900">{student.name}</p>
              <p className="text-xs text-slate-500">{student.admissionNo}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  disabled={isSubmitted}
                  onClick={() => setMarks((m) => ({ ...m, [student.id]: status }))}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition",
                    marks[student.id] === status ? STATUS_COLORS[status] : "border-slate-200 text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {ATTENDANCE_LABELS[status]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
