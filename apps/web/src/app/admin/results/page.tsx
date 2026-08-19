"use client";

import { useMemo, useState } from "react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { btnSecondary, selectClass } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { addNotification } from "@/lib/notification-store";

export default function AdminResultsPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const students = useFinanceStore((s) => s.students);
  const termResults = useAcademicStore((s) => s.termResults);
  const setResultStatus = useAcademicStore((s) => s.setResultStatus);
  const [filter, setFilter] = useState<"all" | "draft" | "published">("all");
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const rows = useMemo(() => {
    const list = (termResults ?? []).filter((r) => filter === "all" || r.status === filter);
    return list.slice().sort((a, b) => {
      const studentA = students.find((s) => s.id === a.studentId)?.name ?? "";
      const studentB = students.find((s) => s.id === b.studentId)?.name ?? "";
      return studentA.localeCompare(studentB) || a.subject.localeCompare(b.subject);
    });
  }, [termResults, students, filter]);

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const handleToggle = (id: string, next: "draft" | "published", studentId: string) => {
    const result = setResultStatus(id, next, "super_admin");
    if (!result.ok) {
      setError(result.error ?? "Could not update this result.");
      setToast("");
      return;
    }
    setError("");
    if (next === "published") {
      const parentEmail = students.find((s) => s.id === studentId)?.parentEmail;
      if (parentEmail) {
        addNotification({
          userEmail: parentEmail,
          title: "Term results published",
          body: "New term results are available for viewing.",
          href: "/portal/results",
        });
      }
      setToast("Result published to the parent and student portal.");
    } else {
      setToast("Result returned to draft. The class teacher can now edit scores.");
    }
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Results"
        description="Published scores are locked for teachers. Return a result to draft when a teacher needs to correct it, then they can edit and publish again."
      />

      {toast && <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{toast}</div>}
      {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="mb-4 max-w-xs">
        <label className="mb-1 block text-sm font-medium">Show</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "draft" | "published")}
          className={selectClass}
        >
          <option value="all">All results</option>
          <option value="draft">Draft only</option>
          <option value="published">Published only</option>
        </select>
      </div>

      <div className="card-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-6 py-3">Student</th>
              <th className="px-6 py-3">Class</th>
              <th className="px-6 py-3">Subject</th>
              <th className="px-6 py-3">CA / Midterm</th>
              <th className="px-6 py-3">Exam</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Grade</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => {
              const student = students.find((s) => s.id === r.studentId);
              const published = r.status === "published";
              return (
                <tr key={r.id}>
                  <td className="px-6 py-4">{student?.name ?? r.studentId}</td>
                  <td className="px-6 py-4">{student?.className ?? "—"}</td>
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
                    <button
                      type="button"
                      className={btnSecondary}
                      onClick={() => handleToggle(r.id, published ? "draft" : "published", r.studentId)}
                    >
                      {published ? "Return to draft" : "Publish"}
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                  No results in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}
