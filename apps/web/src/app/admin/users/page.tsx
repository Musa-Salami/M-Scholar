"use client";

import { useMemo, useState } from "react";
import { Eye, Plus, Search, X } from "lucide-react";
import { ADMIN_NAV, ROLE_LABELS, type UserRole, type Student } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { StudentRecordDetails } from "@/components/student-record-view";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore, type SchoolClass, type SchoolUser } from "@/lib/school-store";

const ROLE_BADGE: Record<UserRole, string> = {
  super_admin: "bg-violet-100 text-violet-700",
  account_officer: "bg-emerald-100 text-emerald-700",
  class_teacher: "bg-amber-100 text-amber-800",
  parent: "bg-sky-100 text-sky-700",
  student: "bg-sky-100 text-sky-700",
};

const ROLE_SORT: Record<UserRole, number> = {
  class_teacher: 0,
  parent: 1,
  student: 2,
  super_admin: 3,
  account_officer: 4,
};

type UserGroup = "teachers" | "family" | "staff" | "all";

function inGroup(role: UserRole, group: UserGroup) {
  if (group === "all") return true;
  if (group === "teachers") return role === "class_teacher";
  if (group === "family") return role === "parent" || role === "student";
  return role === "super_admin" || role === "account_officer";
}

export default function AdminUsersPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const users = useSchoolStore((s) => s.users);
  const classes = useSchoolStore((s) => s.classes);
  const addUser = useSchoolStore((s) => s.addUser);
  const students = useFinanceStore((s) => s.students);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<UserGroup>("teachers");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "class_teacher" as UserRole });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const groupedCounts = useMemo(() => {
    const list = users ?? [];
    return {
      teachers: list.filter((u) => u.role === "class_teacher").length,
      family: list.filter((u) => u.role === "parent" || u.role === "student").length,
      staff: list.filter((u) => u.role === "super_admin" || u.role === "account_officer").length,
      all: list.length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users ?? [])
      .filter((u) => inGroup(u.role, group))
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      .slice()
      .sort((a, b) => ROLE_SORT[a.role] - ROLE_SORT[b.role] || a.name.localeCompare(b.name));
  }, [users, search, group]);

  const selected = (users ?? []).find((u) => u.id === selectedId) ?? null;

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading portal…</p>
      </div>
    );
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    addUser({ name: form.name, email: form.email, role: form.role });
    setForm({ name: "", email: "", role: "class_teacher" });
    setShowForm(false);
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="User Management"
        description="Users are grouped as teachers or parent/student so you can pull the linked school record."
        action={
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Add user
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">New user profile</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            >
              <optgroup label="Teachers">
                <option value="class_teacher">{ROLE_LABELS.class_teacher}</option>
              </optgroup>
              <optgroup label="Parent / Student">
                <option value="parent">{ROLE_LABELS.parent}</option>
                <option value="student">{ROLE_LABELS.student}</option>
              </optgroup>
              <optgroup label="Staff">
                <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                <option value="account_officer">{ROLE_LABELS.account_officer}</option>
              </optgroup>
            </select>
          </div>
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
              Create profile
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {selected && (
        <UserRecordPanel
          user={selected}
          students={students}
          classes={classes}
          onClose={() => setSelectedId(null)}
        />
      )}

      <div className="card-shadow overflow-hidden rounded-2xl border border-slate-100 bg-white">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: "teachers", label: "Teachers" },
                { id: "family", label: "Parent / Student" },
                { id: "staff", label: "Admin & Finance" },
                { id: "all", label: "All users" },
              ] as { id: UserGroup; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGroup(tab.id)}
                className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
                  group === tab.id
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label} ({groupedCounts[tab.id]})
              </button>
            ))}
          </div>
          <div className="relative max-w-sm flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search users…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-slate-500">
                  No users in this group.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setSelectedId(user.id)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50"
                    >
                      <Eye className="h-4 w-4" /> Pull record
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PortalShell>
  );
}

function UserRecordPanel({
  user,
  students,
  classes,
  onClose,
}: {
  user: SchoolUser;
  students: Student[];
  classes: SchoolClass[];
  onClose: () => void;
}) {
  const teacherClasses = classes.filter((c) => c.teacherId === user.id);
  const classNames = new Set(teacherClasses.map((c) => c.name));
  const classStudents = students.filter((s) => classNames.has(s.className));
  const parentChildren = students.filter((s) => s.parentEmail.toLowerCase() === user.email.toLowerCase());
  const ownStudent = students.find((s) => (s.studentEmail ?? "").toLowerCase() === user.email.toLowerCase());

  return (
    <div className="card-shadow mb-6 rounded-2xl border border-violet-100 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Pulled record</p>
          <h3 className="font-display font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">
            {user.email} · {ROLE_LABELS[user.role]} · {user.status}
          </p>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      {user.role === "class_teacher" && (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Assigned classes:{" "}
            {teacherClasses.length
              ? teacherClasses.map((c) => `${c.name} (${c.studentCount})`).join(", ")
              : "None yet"}
          </p>
          {classStudents.length === 0 ? (
            <p className="text-sm text-slate-500">No students in this teacher&apos;s classes.</p>
          ) : (
            classStudents.map((s) => <StudentRecordDetails key={s.id} student={s} />)
          )}
        </div>
      )}

      {user.role === "parent" && (
        <div className="space-y-4">
          {parentChildren.length === 0 ? (
            <p className="text-sm text-slate-500">No student records are linked to this parent email.</p>
          ) : (
            parentChildren.map((s) => <StudentRecordDetails key={s.id} student={s} />)
          )}
        </div>
      )}

      {user.role === "student" && (
        <div>
          {ownStudent ? (
            <StudentRecordDetails student={ownStudent} />
          ) : (
            <p className="text-sm text-slate-500">No enrolment record is linked to this student email.</p>
          )}
        </div>
      )}

      {(user.role === "super_admin" || user.role === "account_officer") && (
        <p className="text-sm text-slate-600">
          This is a staff login profile
          {user.role === "account_officer" ? " for finance operations." : " for school administration."} There is no
          student result attached.
        </p>
      )}
    </div>
  );
}
