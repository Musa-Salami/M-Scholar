/** Admission number: {Level}{Term}{Initials}{Year}
 *  e.g. P1MIS26 = Primary, 1st term, Musa Ismaila Salami, 2026
 *  N = Nursery, P = Primary, J = Junior Secondary, S = Senior Secondary
 */

export type SchoolLevelCode = "N" | "P" | "J" | "S";

const LEVEL_LABEL: Record<SchoolLevelCode, string> = {
  N: "Nursery",
  P: "Primary",
  J: "Junior Secondary",
  S: "Senior Secondary",
};

export function classLevelCode(className: string): SchoolLevelCode | null {
  const n = className.trim().toLowerCase();
  if (!n) return null;
  if (
    n.startsWith("kindergarten") ||
    n.startsWith("pre-nursery") ||
    n.startsWith("prenursery") ||
    n.startsWith("pre nursery") ||
    n.startsWith("nursery") ||
    n.startsWith("nur") ||
    n.startsWith("creche") ||
    n.startsWith("kg") ||
    /^n[\s-]?\d/.test(n)
  ) {
    return "N";
  }
  if (
    n.startsWith("primary") ||
    n.startsWith("pry") ||
    n.startsWith("pri") ||
    /^p[\s-]?\d/.test(n)
  ) {
    return "P";
  }
  if (n.startsWith("jss") || n.startsWith("junior") || n.startsWith("js ")) {
    return "J";
  }
  if (n.startsWith("sss") || n.startsWith("senior") || n.startsWith("ss")) {
    return "S";
  }
  return null;
}

export function nameInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
}

export function buildAdmissionNo(options: {
  className: string;
  term: 1 | 2 | 3;
  fullName: string;
  year: number;
}): string {
  const level = classLevelCode(options.className);
  const initials = nameInitials(options.fullName);
  if (!level || !initials) return "";
  const year = String(options.year).slice(-2).padStart(2, "0");
  return `${level}${options.term}${initials}${year}`;
}

export function uniqueAdmissionNo(base: string, existing: string[]): string {
  if (!base) return "";
  const taken = new Set(existing.map((n) => n.toUpperCase()));
  if (!taken.has(base.toUpperCase())) return base;
  for (let i = 2; i < 100; i++) {
    const next = `${base}${i}`;
    if (!taken.has(next.toUpperCase())) return next;
  }
  return `${base}${Date.now().toString().slice(-2)}`;
}

export function describeAdmissionNo(admissionNo: string): string {
  const level = admissionNo[0] as SchoolLevelCode;
  const term = admissionNo[1];
  if (!LEVEL_LABEL[level] || !["1", "2", "3"].includes(term)) return "";
  const rest = admissionNo.slice(2);
  const year = rest.slice(-2);
  const initials = rest.slice(0, -2);
  return `${LEVEL_LABEL[level]}, ${term}${term === "1" ? "st" : term === "2" ? "nd" : "rd"} term, initials ${initials}, year 20${year}`;
}
