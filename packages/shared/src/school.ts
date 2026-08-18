export const SCHOOL = {
  name: "M-Scholar Demo Academy",
  shortName: "M-Scholar Academy",
  motto: "Excellence Through Knowledge",
  tagline: "Nurturing minds, building character, shaping futures since 1998.",
  address: "12 Education Road, Ikeja, Lagos, Nigeria",
  phone: "+234 801 234 5678",
  email: "info@mscholar.app",
  founded: "1998",
  stats: {
    students: "1,200+",
    teachers: "86",
    years: "28",
    passRate: "98%",
  },
};

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "News & Events", href: "/news" },
  { label: "Contact", href: "/contact" },
] as const;

export type LoginPortal = "student" | "teacher" | "parent" | "staff";

export const LOGIN_PORTALS: Record<
  LoginPortal,
  { title: string; description: string; href: string; roles: string[]; accent: string }
> = {
  student: {
    title: "Student Login",
    description: "View results, attendance, fees, and messages.",
    href: "/login/student",
    roles: ["student"],
    accent: "sky",
  },
  teacher: {
    title: "Teacher Login",
    description: "Attendance, assessments, notes, and parent communication.",
    href: "/login/teacher",
    roles: ["class_teacher"],
    accent: "amber",
  },
  parent: {
    title: "Parent Login",
    description: "Track your child's progress, fees, and school updates.",
    href: "/login/parent",
    roles: ["parent"],
    accent: "emerald",
  },
  staff: {
    title: "Staff Login",
    description: "Administration, finance, and school management.",
    href: "/login/staff",
    roles: ["super_admin", "account_officer"],
    accent: "violet",
  },
};
