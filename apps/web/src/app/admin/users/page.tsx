"use client";

import { useMemo, useState } from "react";
import { Copy, Eye, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { ADMIN_NAV, ROLE_LABELS, type UserRole, type Student } from "@m-scholar/shared";
import { PortalShell } from "@/components/portal-shell";
import { PageHeader } from "@/components/dashboard-ui";
import { StudentRecordDetails } from "@/components/student-record-view";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useSchoolReady } from "@/hooks/use-school-ready";
import { emailsMatch, isFamilyRole, isStaffRole, loginLabel, loginValue, phonesMatch } from "@/lib/credentials";
import { useFinanceStore } from "@/lib/finance-store";
import { useSchoolStore, type SchoolClass, type SchoolUser } from "@/lib/school-store";
import { useAuthStore } from "@/lib/auth-store";

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

type UserGroup = "teachers" | "parents" | "students" | "staff" | "all";

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "class_teacher" as UserRole,
  status: "Active" as "Active" | "Inactive",
  dateOfBirth: "",
  address: "",
  nextOfKin: "",
};

function inGroup(role: UserRole, group: UserGroup) {
  if (group === "all") return true;
  if (group === "teachers") return role === "class_teacher";
  if (group === "parents") return role === "parent";
  if (group === "students") return role === "student";
  return role === "super_admin" || role === "account_officer";
}

export default function AdminUsersPage() {
  const { ready: authReady } = useRequireAuth(["super_admin"]);
  const schoolReady = useSchoolReady();
  const users = useSchoolStore((s) => s.users);
  const classes = useSchoolStore((s) => s.classes);
  const addUser = useSchoolStore((s) => s.addUser);
  const updateUser = useSchoolStore((s) => s.updateUser);
  const deleteUser = useSchoolStore((s) => s.deleteUser);
  const settings = useSchoolStore((s) => s.settings);
  const students = useFinanceStore((s) => s.students);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<UserGroup>("teachers");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState("");
  const [created, setCreated] = useState<SchoolUser | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const familyForm = isFamilyRole(form.role);
  const staffForm = isStaffRole(form.role);
  const showStaffColumns = group === "teachers" || group === "staff";

  const groupedCounts = useMemo(() => {
    const list = users ?? [];
    return {
      teachers: list.filter((u) => u.role === "class_teacher").length,
      parents: list.filter((u) => u.role === "parent").length,
      students: list.filter((u) => u.role === "student").length,
      staff: list.filter((u) => u.role === "super_admin" || u.role === "account_officer").length,
      all: list.length,
    };
  }, [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return (users ?? [])
      .filter((u) => inGroup(u.role, group))
      .filter(
        (u) =>
          !q ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.phone ?? "").toLowerCase().includes(q) ||
          (u.address ?? "").toLowerCase().includes(q) ||
          (u.nextOfKin ?? "").toLowerCase().includes(q)
      )
      .slice()
      .sort((a, b) => ROLE_SORT[a.role] - ROLE_SORT[b.role] || a.name.localeCompare(b.name));
  }, [users, search, group]);

  const selected = (users ?? []).find((u) => u.id === selectedId) ?? null;

  if (!authReady || !schoolReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-sm text-muted">Loading portal…</p>
      </div>
    );
  }

  const openForm = () => {
    setFormError("");
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      password: settings.defaultStaffPassword || "",
      role: "class_teacher",
    });
    setShowForm(true);
  };

  const openEdit = (user: SchoolUser) => {
    setFormError("");
    setCreated(null);
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      password: "",
      role: user.role,
      status: user.status,
      dateOfBirth: user.dateOfBirth ?? "",
      address: user.address ?? "",
      nextOfKin: user.nextOfKin ?? "",
    });
    setShowForm(true);
  };

  const handleRoleChange = (role: UserRole) => {
    setForm({
      ...form,
      role,
      password: editingId ? form.password : isFamilyRole(role) ? settings.defaultFamilyPassword : settings.defaultStaffPassword,
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (editingId) {
      const patch: Partial<Omit<SchoolUser, "id">> = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
        dateOfBirth: form.dateOfBirth,
        address: form.address,
        nextOfKin: form.nextOfKin,
      };
      if (form.password.trim()) patch.password = form.password.trim();
      if (editingId === currentUserId && form.status === "Inactive") {
        setFormError("You cannot set your own account to Inactive.");
        return;
      }
      const result = updateUser(editingId, patch);
      if (!result.ok) {
        setFormError(result.error ?? "Could not update this profile.");
        return;
      }
      setShowForm(false);
      setEditingId(null);
      return;
    }
    if (!editingId && form.role === "student") {
      setFormError("Enroll the pupil on Students first. A student login cannot be created here.");
      return;
    }
    const result = addUser({
      name: form.name,
      email: form.email,
      phone: form.phone,
      password: form.password,
      role: form.role,
      dateOfBirth: form.dateOfBirth,
      address: form.address,
      nextOfKin: form.nextOfKin,
    });
    if (!result.ok || !result.user) {
      setFormError(result.error ?? "Could not create this profile.");
      return;
    }
    if (form.status === "Inactive") {
      updateUser(result.user.id, { status: "Inactive" });
    }
    setCreated(result.user);
    setCopied(false);
    setForm({ ...EMPTY_FORM, password: settings.defaultStaffPassword || "", role: "class_teacher" });
    setShowForm(false);
  };

  const handleDeleteUser = (user: SchoolUser) => {
    if (user.id === currentUserId) {
      window.alert("You cannot delete the account you are signed in with.");
      return;
    }
    const ok = window.confirm(`Delete ${user.name}? They will no longer be able to sign in.`);
    if (!ok) return;
    const result = deleteUser(user.id);
    if (!result.ok) {
      window.alert(result.error ?? "Could not delete this profile.");
      return;
    }
    if (selectedId === user.id) setSelectedId(null);
    if (editingId === user.id) {
      setShowForm(false);
      setEditingId(null);
    }
  };

  const handleStatus = (user: SchoolUser, status: "Active" | "Inactive") => {
    if (user.id === currentUserId && status === "Inactive") {
      window.alert("You cannot set your own account to Inactive.");
      return;
    }
    const result = updateUser(user.id, { status });
    if (!result.ok) window.alert(result.error ?? "Could not update status.");
  };

  const copyDetails = async (user: SchoolUser) => {
    const identifier = loginValue(user);
    const portal = isFamilyRole(user.role) ? "Parent & Student portal" : ROLE_LABELS[user.role];
    const text = `${user.name}\n${portal}\n${loginLabel(user.role)}: ${identifier}\nPassword: ${user.password}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PortalShell navItems={ADMIN_NAV} title="Super Admin Portal">
      <PageHeader
        title="User Management"
        description="Set login details when you create a profile, then share them with the user. Staff use email. Parents use phone number. Student logins are created only when you enroll a pupil on Students."
        action={
          <button
            onClick={openForm}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" /> Add user
          </button>
        }
      />

      {created && (
        <div className="card-shadow mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Give these details to the user</p>
              <h3 className="mt-1 font-display font-semibold text-slate-900">{created.name}</h3>
              <p className="mt-2 text-sm text-slate-700">
                {loginLabel(created.role)}: <span className="font-semibold">{loginValue(created)}</span>
              </p>
              <p className="text-sm text-slate-700">
                Password: <span className="font-semibold">{created.password}</span>
              </p>
              <p className="mt-2 text-xs text-slate-600">
                {isFamilyRole(created.role)
                  ? "They sign in on Parent & Student with this phone number. Match the same phone on the student record so the portal can load."
                  : "They sign in with this email on the staff portal for their role."}
              </p>
            </div>
            <button type="button" onClick={() => setCreated(null)} className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => copyDetails(created)}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-100"
          >
            <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy login details"}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="card-shadow mb-6 rounded-2xl border border-slate-100 bg-white p-6">
          <h3 className="font-display font-semibold text-slate-900">{editingId ? "Edit user profile" : "New user profile"}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {familyForm
              ? "Parents sign in with phone number and password. Student logins are created from enrolment, not from this form."
              : "Teachers and school officers sign in with email and password. Add date of birth, address, phone number, and next of kin."}
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
            <select
              value={form.role}
              onChange={(e) => handleRoleChange(e.target.value as UserRole)}
              disabled={Boolean(editingId && form.role === "student")}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 disabled:bg-slate-50"
            >
              <optgroup label="Teachers">
                <option value="class_teacher">{ROLE_LABELS.class_teacher}</option>
              </optgroup>
              <optgroup label="Family">
                <option value="parent">{ROLE_LABELS.parent}</option>
                {editingId && form.role === "student" ? (
                  <option value="student">{ROLE_LABELS.student}</option>
                ) : null}
              </optgroup>
              <optgroup label="Staff">
                <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                <option value="account_officer">{ROLE_LABELS.account_officer}</option>
              </optgroup>
            </select>
            {familyForm ? (
              <>
                <input
                  type="tel"
                  placeholder="Phone number (login)"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Contact email (optional)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="Email (login)"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                />
              </>
            )}
            <input
              type="text"
              placeholder={editingId ? "New password (leave blank to keep current)" : "Password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              required={!editingId}
              minLength={editingId ? undefined : 6}
            />
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "Active" | "Inactive" })}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            {staffForm && (
              <>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Date of birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Next of kin</label>
                  <input
                    placeholder="Name, relationship, phone"
                    value={form.nextOfKin}
                    onChange={(e) => setForm({ ...form, nextOfKin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-slate-500">Address</label>
                  <input
                    placeholder="Home address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
              </>
            )}
          </div>
          {formError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</p>}
          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
              {editingId ? "Save changes" : "Create profile"}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {selected && (
        <UserRecordPanel
          key={selected.id}
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
                { id: "parents", label: "Parents" },
                { id: "students", label: "Students" },
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
        <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Login</th>
              {showStaffColumns && (
                <>
                  <th className="px-6 py-3">Date of birth</th>
                  <th className="px-6 py-3">Phone number</th>
                  <th className="px-6 py-3">Address</th>
                  <th className="px-6 py-3">Next of kin</th>
                </>
              )}
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={showStaffColumns ? 9 : 5} className="px-6 py-8 text-slate-500">
                  No users in this group.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{user.name}</td>
                  <td className="px-6 py-4 text-slate-500">{loginValue(user) || "—"}</td>
                  {showStaffColumns && (
                    <>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">{user.dateOfBirth || "—"}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-slate-500">{user.phone || "—"}</td>
                      <td className="max-w-[220px] px-6 py-4 text-slate-500">{user.address || "—"}</td>
                      <td className="max-w-[240px] px-6 py-4 text-slate-500">{user.nextOfKin || "—"}</td>
                    </>
                  )}
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_BADGE[user.role]}`}>
                      {ROLE_LABELS[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.status}
                      onChange={(e) => handleStatus(user, e.target.value as "Active" | "Inactive")}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium outline-none ${
                        user.status === "Active" ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                      }`}
                      aria-label={`${user.name} status`}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedId(user.id)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-violet-700 hover:bg-violet-50"
                      >
                        <Eye className="h-4 w-4" /> Pull record
                      </button>
                      <button
                        type="button"
                        onClick={() => openEdit(user)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
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
  const updateUser = useSchoolStore((s) => s.updateUser);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [newPassword, setNewPassword] = useState("");
  const [loginId, setLoginId] = useState(loginValue(user));
  const [resetMsg, setResetMsg] = useState("");
  const teacherClasses = classes.filter((c) => c.teacherId === user.id);
  const classNames = new Set(teacherClasses.map((c) => c.name));
  const classStudents = students.filter((s) => classNames.has(s.className));
  const parentChildren = students.filter(
    (s) => emailsMatch(s.parentEmail, user.email) || phonesMatch(s.parentPhone, user.phone)
  );
  const ownStudent = students.find(
    (s) => emailsMatch(s.studentEmail, user.email) || phonesMatch(s.studentPhone, user.phone)
  );

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    const result = updateUser(user.id, { password: newPassword });
    if (!result.ok) {
      setResetMsg(result.error ?? "Could not update password.");
      return;
    }
    setResetMsg("Password updated. Share the new password with this user.");
    setNewPassword("");
  };

  return (
    <div className="card-shadow mb-6 rounded-2xl border border-violet-100 bg-white p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Pulled record</p>
          <h3 className="font-display font-semibold text-slate-900">{user.name}</h3>
          <p className="text-sm text-slate-500">
            {loginLabel(user.role)}: {loginValue(user) || "—"} · {ROLE_LABELS[user.role]}
          </p>
          {isStaffRole(user.role) && (
            <dl className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Date of birth</dt>
                <dd>{user.dateOfBirth || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Phone number</dt>
                <dd>{user.phone || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Address</dt>
                <dd>{user.address || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next of kin</dt>
                <dd>{user.nextOfKin || "—"}</dd>
              </div>
            </dl>
          )}
          <label className="mt-2 inline-flex items-center gap-2 text-sm text-slate-600">
            Status
            <select
              value={user.status}
              onChange={(e) => {
                const status = e.target.value as "Active" | "Inactive";
                if (user.id === currentUserId && status === "Inactive") {
                  window.alert("You cannot set your own account to Inactive.");
                  return;
                }
                updateUser(user.id, { status });
              }}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <X className="h-4 w-4" />
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const patch = isFamilyRole(user.role) ? { phone: loginId } : { email: loginId };
          const result = updateUser(user.id, patch);
          setResetMsg(result.ok ? `${loginLabel(user.role)} updated.` : result.error ?? "Could not update login.");
        }}
        className="mb-3 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{loginLabel(user.role)}</label>
          <input
            type={isFamilyRole(user.role) ? "tel" : "email"}
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button type="submit" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Save login
        </button>
      </form>

      <form onSubmit={handleReset} className="mb-5 flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Set a new password</label>
          <input
            type="text"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password"
            minLength={6}
            required
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <button type="submit" className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white">
          Save password
        </button>
      </form>
      {resetMsg && <p className="mb-4 text-sm text-slate-600">{resetMsg}</p>}

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
            <p className="text-sm text-slate-500">No student records are linked to this parent phone or email.</p>
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
            <p className="text-sm text-slate-500">No enrolment record is linked to this student phone or email.</p>
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
