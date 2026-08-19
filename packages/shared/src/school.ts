export const SCHOOL = {
  name: "M-Scholars' Academy",
  shortName: "M-Scholars' Academy",
  motto: "Academic Excellence & Moral Values",
  vision: "Raising scholars with Allah's consciousness",
  tagline: "Raising scholars, building futures.",
  address: "Beside Fambeec Hotel, Opposite New Zango, Adavi LGA, Kogi State",
  phone: "08035672451",
  whatsapp: "2348035672451",
  email: "yusyum87@gmail.com",
  session: "2026/2027",
  logo: "/brand/logo.png",
  photos: {
    hero: "/brand/classroom.png",
    welcome: "/brand/welcome.png",
    group: "/brand/group.png",
    courtyard: "/brand/courtyard.png",
    speechBoy: "/brand/speech-boy.png",
    speechGirl: "/brand/speech-girl.png",
    community: "/brand/community.png",
    flyer: "/brand/flyer.png",
  },
  levels: [
    { name: "Kindergarten", detail: "First steps in a caring Islamic environment." },
    { name: "Pre-Nursery", detail: "Play, language, and early moral formation." },
    { name: "Nursery 1 & 2", detail: "Jolly Phonics, Montessori, and Qur'anic foundations." },
    { name: "Primary 1 – 5", detail: "Integrated Islamic and Western education with Tahfeez." },
  ],
  reasons: [
    "Qualified and experienced teachers",
    "Integrated Islamic and Western education",
    "Tahfeez and Islamic Studies",
    "Jolly Phonics and Montessori approach",
    "Safe and conducive learning environment",
    "Strong moral and character development",
  ],
};

export const PUBLIC_NAV = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Academics", href: "/academics" },
  { label: "Admissions", href: "/admissions" },
  { label: "School Life", href: "/news" },
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
