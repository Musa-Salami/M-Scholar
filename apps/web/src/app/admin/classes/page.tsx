"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { FormField } from "@/components/finance-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { useSchoolStore } from "@/lib/school-store";

const fieldClass =
  "w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500";

export default function AdminClassesPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const users = useSchoolStore((s) => s.users);
  const classes = useSchoolStore((s) => s.classes);
  const addClass = useSchoolStore((s) => s.addClass);
  const assignTeacher = useSchoolStore((s) => s.assignTeacher);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [error, setError] = useState("");

  const teachers = useMemo(
    () => users.filter((u) => u.role === "class_teacher" && u.status === "Active"),
    [users]
  );
  const teacherName = (id: string | null) =>
    users.find((u) => u.id === id)?.name ?? "Unassigned";

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const result = addClass(name, teacherId || null);
    if (!result.ok) {
      setError(result.error ?? "Could not create class.");
      return;
    }
    setName("");
    setTeacherId("");
    setError("");
    setShowForm(false);
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Classes"
        description="Create classes and assign them to an existing class teacher."
        action={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Add class
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleAdd} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">New class</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <FormField label="Class name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Primary 2"
                className={fieldClass}
                required
              />
            </FormField>
            <FormField label="Class teacher">
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
                className={fieldClass}
              >
                <option value="">Unassigned</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </select>
            </FormField>
          </div>
          {teachers.length === 0 && (
            <p className="mt-3 text-sm text-amber-700">
              No class teacher profiles yet. Add a teacher under Users, then assign them here.
            </p>
          )}
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700">
              Create class
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setError(""); }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-display text-lg font-bold text-slate-900">{cls.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{cls.studentCount} students</p>
            <p className="mt-3 text-sm">
              <span className="text-slate-400">Class teacher: </span>
              <span className="font-medium text-slate-700">{teacherName(cls.teacherId)}</span>
            </p>
            <label className="mt-4 block text-xs font-medium uppercase tracking-wide text-slate-500">
              Re-assign teacher
            </label>
            <select
              value={cls.teacherId ?? ""}
              onChange={(e) => assignTeacher(cls.id, e.target.value || null)}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="">Unassigned</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
