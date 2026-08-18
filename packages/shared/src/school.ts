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

export type LoginPortal = "family" | "teacher" | "admin" | "finance";

export const LOGIN_PORTALS: Record<
  LoginPortal,
  { title: string; description: string; href: string; roles: string[]; accent: string }
> = {
  family: {
    title: "Parent & Student",
    description: "Sign in with the phone number and password set by the school.",
    href: "/login/family",
    roles: ["parent", "student"],
    accent: "sky",
  },
  teacher: {
    title: "Teacher",
    description: "Sign in with the email and password set by the school.",
    href: "/login/teacher",
    roles: ["class_teacher"],
    accent: "amber",
  },
  admin: {
    title: "Admin",
    description: "Sign in with the admin email and password.",
    href: "/login/admin",
    roles: ["super_admin"],
    accent: "violet",
  },
  finance: {
    title: "Finance Officer",
    description: "Sign in with the finance email and password.",
    href: "/login/finance",
    roles: ["account_officer"],
    accent: "emerald",
  },
};
