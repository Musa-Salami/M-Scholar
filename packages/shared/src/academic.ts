export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type RegisterStatus = "draft" | "submitted" | "locked";
export type ResultStatus = "draft" | "published";
export type NotePriority = "info" | "warning" | "urgent";

export interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceRegister {
  id: string;
  className: string;
  date: string;
  takenBy: string;
  status: RegisterStatus;
  records: AttendanceRecord[];
}

export interface Assessment {
  id: string;
  className: string;
  subject: string;
  name: string;
  maxScore: number;
  weightPercent: number;
  term: string;
}

export interface AssessmentScore {
  id: string;
  assessmentId: string;
  studentId: string;
  score: number;
}

export interface TermResult {
  id: string;
  studentId: string;
  subject: string;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  term: string;
  status: ResultStatus;
  publishedAt?: string;
}

export interface TeacherNote {
  id: string;
  studentId: string;
  teacherName: string;
  title: string;
  body: string;
  priority: NotePriority;
  readAt?: string;
  createdAt: string;
}

export interface MessageThread {
  id: string;
  studentId: string;
  parentEmail: string;
  teacherName: string;
  subject: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderRole: "teacher" | "parent";
  senderName: string;
  body: string;
  createdAt: string;
  readAt?: string;
}

export interface AppNotification {
  id: string;
  userEmail: string;
  title: string;
  body: string;
  href: string;
  read: boolean;
  createdAt: string;
}

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
};

export const SUBJECTS = [
  "Mathematics",
  "English",
  "Basic Science",
  "Social Studies",
  "Civic Education",
] as const;

export function computeGrade(total: number): string {
  if (total >= 70) return "A";
  if (total >= 60) return "B";
  if (total >= 50) return "C";
  if (total >= 40) return "D";
  return "F";
}
