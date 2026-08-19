import type { Assessment } from "@m-scholar/shared";
import { isExamAssessment } from "@m-scholar/shared";

export function obtainableMarks(assessments: Assessment[], className?: string) {
  const list = assessments.filter((a) => !className || a.className === className);
  const subjects = [...new Set(list.map((a) => a.subject))];
  if (!subjects.length) return { ca: 40, exam: 60, total: 100 };

  const ca =
    Math.max(
      0,
      ...subjects.map((subject) =>
        list
          .filter((a) => a.subject === subject && !isExamAssessment(a.name))
          .reduce((sum, a) => sum + a.maxScore, 0)
      )
    ) || 40;
  const exam =
    Math.max(
      0,
      ...subjects.map(
        (subject) => list.find((a) => a.subject === subject && isExamAssessment(a.name))?.maxScore ?? 0
      )
    ) || 60;

  return { ca, exam, total: ca + exam };
}

export function teacherRemark(average: number, studentName: string) {
  const name = studentName.trim() || "This student";
  if (average >= 80) {
    return `${name} has shown excellent performance this term. Continue this outstanding attitude to work.`;
  }
  if (average >= 70) {
    return `${name} has done very well this term. A little more effort will produce even stronger results.`;
  }
  if (average >= 60) {
    return `${name} has made a good effort. Regular revision at home will help raise the overall average.`;
  }
  if (average >= 50) {
    return `${name} has a fair result this term. Closer attention to classwork and homework is required.`;
  }
  return `${name} needs improvement this term. Please work with the class teacher on a recovery plan.`;
}

export function principalRemark(average: number) {
  if (average >= 80) {
    return "An excellent result. The school commends this performance and encourages the student to remain focused.";
  }
  if (average >= 70) {
    return "A very good result. Keep working hard and make full use of every lesson.";
  }
  if (average >= 60) {
    return "A satisfactory result. Greater consistency will produce a stronger terminal report next term.";
  }
  if (average >= 50) {
    return "This result is fair. The school expects improved effort and punctual completion of assignments.";
  }
  return "This result is below expectation. The school requests the support of the parent to monitor study at home.";
}

export function formatResumptionDate(value: string | undefined) {
  if (!value) return "To be announced";
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
