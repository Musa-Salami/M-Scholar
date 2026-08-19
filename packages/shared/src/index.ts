export * from "./finance";
export * from "./academic";
export * from "./school";
export * from "./admission";

export type UserRole =
  | "super_admin"
  | "account_officer"
  | "class_teacher"
  | "parent"
  | "student";

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  account_officer: "Finance Officer",
  class_teacher: "Class Teacher",
  parent: "Parent",
  student: "Student",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  super_admin: "/admin/dashboard",
  account_officer: "/finance/dashboard",
  class_teacher: "/teacher/dashboard",
  parent: "/portal/dashboard",
  student: "/portal/dashboard",
};

export const ROLE_ACCENT: Record<UserRole, string> = {
  super_admin: "violet",
  account_officer: "emerald",
  class_teacher: "amber",
  parent: "sky",
  student: "sky",
};

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Users", href: "/admin/users", icon: "Users" },
  { label: "School Settings", href: "/admin/settings", icon: "Settings" },
  { label: "Classes", href: "/admin/classes", icon: "GraduationCap" },
  { label: "Students", href: "/admin/students", icon: "UserCheck" },
  { label: "Results", href: "/admin/results", icon: "Award" },
  { label: "Audit Log", href: "/admin/audit", icon: "ScrollText" },
];

export const FINANCE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/finance/dashboard", icon: "LayoutDashboard" },
  { label: "Fees", href: "/finance/fees", icon: "Receipt" },
  { label: "Payments", href: "/finance/payments", icon: "CreditCard" },
  { label: "Income", href: "/finance/income", icon: "TrendingUp" },
  { label: "Expenditure", href: "/finance/expenditure", icon: "TrendingDown" },
  { label: "Payroll", href: "/finance/payroll", icon: "Wallet" },
  { label: "Reports", href: "/finance/reports", icon: "FileBarChart" },
];

export const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: "LayoutDashboard" },
  { label: "Attendance", href: "/teacher/attendance", icon: "ClipboardCheck" },
  { label: "Assessments", href: "/teacher/assessments", icon: "BookOpen" },
  { label: "Assignments", href: "/teacher/assignments", icon: "ClipboardList" },
  { label: "Notes", href: "/teacher/notes", icon: "StickyNote" },
  { label: "Messages", href: "/teacher/messages", icon: "MessageSquare" },
];

export const PORTAL_NAV: NavItem[] = [
  { label: "Dashboard", href: "/portal/dashboard", icon: "LayoutDashboard" },
  { label: "Attendance", href: "/portal/attendance", icon: "Calendar" },
  { label: "Fees", href: "/portal/fees", icon: "Receipt" },
  { label: "Results", href: "/portal/results", icon: "Award" },
  { label: "Notes", href: "/portal/notes", icon: "StickyNote" },
  { label: "Messages", href: "/portal/messages", icon: "MessageSquare" },
];

export const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  "admin@mscholar.app": {
    password: "admin123",
    user: {
      id: "u1",
      email: "admin@mscholar.app",
      firstName: "System",
      lastName: "Administrator",
      role: "super_admin",
    },
  },
  "finance@mscholar.app": {
    password: "finance123",
    user: {
      id: "u2",
      email: "finance@mscholar.app",
      firstName: "Adaeze",
      lastName: "Okonkwo",
      role: "account_officer",
    },
  },
  "teacher@mscholar.app": {
    password: "teacher123",
    user: {
      id: "u3",
      email: "teacher@mscholar.app",
      firstName: "Emeka",
      lastName: "Nwosu",
      role: "class_teacher",
    },
  },
  "parent@mscholar.app": {
    password: "parent123",
    user: {
      id: "u7",
      email: "parent@mscholar.app",
      phone: "+234 801 555 1042",
      firstName: "Fatima",
      lastName: "Bello",
      role: "parent",
    },
  },
  "student@mscholar.app": {
    password: "student123",
    user: {
      id: "u8",
      email: "student@mscholar.app",
      phone: "+234 809 555 1042",
      firstName: "Amina",
      lastName: "Bello",
      role: "student",
    },
  },
};
