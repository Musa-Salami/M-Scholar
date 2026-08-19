"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SUBJECTS, TEACHER_NAV, assessmentSortIndex } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { btnPrimary, btnSecondary, inputClass, selectClass } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useClassStudents, useAssignedClassName } from "@/hooks/use-class-students";
import { useAcademicStore } from "@/lib/academic-store";
import { obtainableMarks } from "@/lib/report-card";
import { addNotification } from "@/lib/notification-store";

export default function TeacherAssessmentsPage() {
  useRequireAuth(["class_teacher"]);
  const students = useClassStudents();
  const className = useAssignedClassName();
  const assessments = useAcademicStore((s) => s.assessments);
  const scores = useAcademicStore((s) => s.scores);
  const termResults = useAcademicStore((s) => s.termResults);
  const setScore = useAcademicStore((s) => s.setScore);
  const computeTermResults = useAcademicStore((s) => s.computeTermResults);
  const setResultStatus = useAcademicStore((s) => s.setResultStatus);
  const addSubject = useAcademicStore((s) => s.addSubject);
  const deleteSubject = useAcademicStore((s) => s.deleteSubject);

  const classSubjects = useMemo(() => {
    const names = [
      ...new Set(
        (assessments ?? [])
          .filter((a) => a.className === className)
          .map((a) => a.subject)
      ),
    ];
    return names.sort((a, b) => a.localeCompare(b));
  }, [assessments, className]);

  const [subject, setSubject] = useState<string>("");
  const [newSubject, setNewSubject] = useState("");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const activeSubject = classSubjects.includes(subject) ? subject : (classSubjects[0] ?? "");

  const subjectAssessments = useMemo(
    () =>
      (assessments ?? [])
        .filter((a) => a.className === className && a.subject === activeSubject)
        .slice()
        .sort((a, b) => assessmentSortIndex(a.name) - assessmentSortIndex(b.name)),
    [assessments, activeSubject, className]
  );

  const classStudentIds = useMemo(() => students.map((s) => s.id), [students]);
  const classResults = useMemo(
    () =>
      (termResults ?? []).filter(
        (r) => classStudentIds.includes(r.studentId) && (!activeSubject || r.subject === activeSubject)
      ),
    [termResults, classStudentIds, activeSubject]
  );
  const draftCount = classResults.filter((r) => r.status === "draft").length;
  const marks = obtainableMarks(assessments ?? [], className);

  const showToast = (message: string) => {
    setError("");
    setToast(message);
    setTimeout(() => setToast(""), 3000);
  };

  const notifyParents = (studentIds: string[]) => {
    const seen = new Set<string>();
    students.forEach((s) => {
      if (!studentIds.includes(s.id) || !s.parentEmail || seen.has(s.parentEmail)) return;
      seen.add(s.parentEmail);
      addNotification({
        userEmail: s.parentEmail,
        title: "Term results published",
        body: "New term results are available for viewing.",
        href: "/portal/results",
      });
    });
  };

  const handleCompute = () => {
    if (!activeSubject) return;
    computeTermResults(className, activeSubject, classStudentIds);
    showToast(`Term results computed for ${activeSubject}.`);
  };

  const handlePublishDrafts = () => {
    const drafts = classResults.filter((r) => r.status === "draft");
    drafts.forEach((r) => setResultStatus(r.id, "published", "class_teacher"));
    notifyParents(drafts.map((r) => r.studentId));
    showToast(
      drafts.length
        ? `Published ${drafts.length} draft result${drafts.length === 1 ? "" : "s"}.`
        : "No draft results to publish."
    );
  };

  const handlePublishOne = (resultId: string, studentId: string) => {
    const result = setResultStatus(resultId, "published", "class_teacher");
    if (!result.ok) {
      setError(result.error ?? "Could not publish this result.");
      return;
    }
    notifyParents([studentId]);
    showToast("Result published. Scores are locked until the super admin returns them to draft.");
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className) return;
    const result = addSubject(className, newSubject);
    if (!result.ok) {
      setError(result.error ?? "Could not add subject.");
      return;
    }
    const name = newSubject.trim();
    setNewSubject("");
    setSubject(name);
    showToast(`${name} added with CA1, CA2, Midterm, and Exam.`);
  };

  const handleDeleteSubject = () => {
    if (!activeSubject) return;
    const confirmed = window.confirm(
      `Delete ${activeSubject} from ${className}? This removes CA1, CA2, Midterm, Exam, scores, and results for this class.`
    );
    if (!confirmed) return;
    const result = deleteSubject(className, activeSubject, classStudentIds);
    if (!result.ok) {
      setError(result.error ?? "Could not delete subject.");
      return;
    }
    setSubject("");
    showToast(`${activeSubject} removed from this class.`);
  };

  const saveScore = (assessmentId: string, studentId: string, raw: string, input: HTMLInputElement, fallback: string) => {
    if (raw === "") return;
    const result = setScore(assessmentId, studentId, Number(raw));
    if (!result.ok) {
      input.value = fallback;
      setError(result.error ?? "Could not save that mark.");
    }
  };

  return (
    <PortalShell navItems={TEACHER_NAV} title="Class Teacher Portal">
      <PageHeader
        title="Assessments & Results"
        description="Enter CA1, CA2, Midterm, and Exam. Publish drafts yourself; a published result can only be edited after the super admin returns it to draft."
        action={
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={handleCompute} className={btnPrimary} disabled={!activeSubject}>
              Compute results
            </button>
            <button
              type="button"
              onClick={handlePublishDrafts}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-60"
              disabled={!draftCount}
            >
              Publish drafts ({draftCount})
            </button>
          </div>
        }
      />

      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-[220px]">
            <label className="mb-1 block text-sm font-medium">Subject</label>
            {classSubjects.length ? (
              <select
                value={activeSubject}
                onChange={(e) => setSubject(e.target.value)}
                className={selectClass}
              >
                {classSubjects.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-500">No subjects yet. Add one to start entering marks.</p>
            )}
          </div>
          <form onSubmit={handleAddSubject} className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-sm font-medium">Add subject</label>
              <input
                list="teacher-subjects"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Basic Science"
                className={inputClass}
              />
              <datalist id="teacher-subjects">
                {SUBJECTS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <button type="submit" className={`inline-flex items-center justify-center gap-2 ${btnPrimary}`}>
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
          {activeSubject ? (
            <button
              type="button"
              onClick={handleDeleteSubject}
              className={`inline-flex items-center justify-center gap-2 ${btnSecondary}`}
            >
              <Trash2 className="h-4 w-4" /> Delete {activeSubject}
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-xs text-slate-500">Components are always CA1 (10), CA2 (10), Midterm (20), then Exam (60).</p>
      </div>

      {subjectAssessments.map((assessment) => (
        <div key={assessment.id} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="font-semibold text-slate-900">
            {assessment.name} (max {assessment.maxScore})
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {students.map((student) => {
              const existing = (scores ?? []).find(
                (sc) => sc.assessmentId === assessment.id && sc.studentId === student.id
              );
              const result = (termResults ?? []).find(
                (r) => r.studentId === student.id && r.subject === assessment.subject
              );
              const locked = result?.status === "published";
              const fallback = existing?.score != null ? String(existing.score) : "";
              return (
                <div key={student.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm font-medium">{student.name}</span>
                  <input
                    type="number"
                    min={0}
                    max={assessment.maxScore}
                    key={`${assessment.id}-${student.id}-${locked ? "lock" : "edit"}-${fallback}`}
                    defaultValue={fallback}
                    disabled={locked}
                    onBlur={(e) => saveScore(assessment.id, student.id, e.target.value, e.target, fallback)}
                    className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
              <th className="px-6 py-3">CA / Midterm ({marks.ca})</th>
              <th className="px-6 py-3">Exam ({marks.exam})</th>
              <th className="px-6 py-3">Total ({marks.total})</th>
              <th className="px-6 py-3">Grade</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classResults.map((r) => {
              const student = students.find((s) => s.id === r.studentId);
              const published = r.status === "published";
              return (
                <tr key={r.id}>
                  <td className="px-6 py-4">{student?.name}</td>
                  <td className="px-6 py-4">{r.subject}</td>
                  <td className="px-6 py-4">{r.caScore}</td>
                  <td className="px-6 py-4">{r.examScore}</td>
                  <td className="px-6 py-4 font-medium">{r.totalScore}</td>
                  <td className="px-6 py-4">{r.grade}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                        published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {published ? (
                      <span className="text-xs text-slate-500">Locked. Ask the super admin to return this to draft.</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePublishOne(r.id, r.studentId)}
                        className="text-sm font-semibold text-violet-700 hover:underline"
                      >
                        Publish
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {classResults.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-slate-500">
                  Compute results after entering marks to see drafts here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
