"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { ADMIN_NAV } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { useRequireAuth } from "@/hooks/use-require-auth";

const INITIAL_CLASSES = [
  { id: "1", name: "JSS 1A", students: 38, teacher: "Emeka Nwosu" },
  { id: "2", name: "JSS 1B", students: 36, teacher: "Chioma Eze" },
  { id: "3", name: "JSS 2A", students: 34, teacher: "Emeka Nwosu" },
  { id: "4", name: "SS 1 Science", students: 42, teacher: "Ibrahim Musa" },
  { id: "5", name: "SS 2 Arts", students: 29, teacher: "Grace Adeyemi" },
];

export default function AdminClassesPage() {
  useRequireAuth(["super_admin"]);
  const [classes, setClasses] = useState(INITIAL_CLASSES);
  const [newClass, setNewClass] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.trim()) return;
    setClasses((prev) => [
      ...prev,
      { id: String(prev.length + 1), name: newClass, students: 0, teacher: "Unassigned" },
    ]);
    setNewClass("");
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="Classes"
        description="Manage classes and assign class teachers."
        action={
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="New class name"
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button type="submit" className="inline-flex items-center gap-1 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {classes.map((cls) => (
          <div key={cls.id} className="card-shadow rounded-2xl border border-slate-100 bg-white p-5">
            <h3 className="font-display text-lg font-bold text-slate-900">{cls.name}</h3>
            <p className="mt-1 text-sm text-slate-500">{cls.students} students</p>
            <p className="mt-3 text-sm">
              <span className="text-slate-400">Class teacher: </span>
              <span className="font-medium text-slate-700">{cls.teacher}</span>
            </p>
          </div>
        ))}
      </div>
    </PortalShell>
  );
}
