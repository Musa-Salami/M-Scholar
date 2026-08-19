"use client";

import type { StaffAppointment } from "@m-scholar/shared";
import { ROLE_LABELS } from "@m-scholar/shared";
import { SimplePdf, formatPdfMoney } from "@/lib/pdf";
import type { SchoolSettings, SchoolUser } from "@/lib/school-store";

function dateLabel(value: string) {
  if (!value) return "—";
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" });
}

function netPay(appointment: StaffAppointment) {
  return appointment.basicSalary + appointment.allowances - appointment.deductions;
}

export async function downloadAppointmentLetter(
  appointment: StaffAppointment,
  settings: SchoolSettings,
  user?: SchoolUser
) {
  const pdf = new SimplePdf();
  pdf.setBrand({
    schoolName: settings.schoolName,
    motto: settings.motto,
    address: settings.address,
    phone: settings.phone,
    email: settings.email,
    accent: "violet",
    documentType: "Letter of appointment",
  });
  pdf.heading(
    "Letter of appointment",
    `${appointment.employeeId} · issued ${dateLabel(appointment.appointmentDate)}`
  );
  pdf.paragraph(
    `This letter confirms the appointment of ${appointment.name} to serve at ${settings.schoolName}.`
  );
  pdf.keyValues([
    ["Employee ID", appointment.employeeId],
    ["Staff name", appointment.name],
    ["Role", user ? ROLE_LABELS[user.role] : "Staff"],
    ["Designation", appointment.designation],
    ["Appointment date", dateLabel(appointment.appointmentDate)],
    ["Start date", dateLabel(appointment.startDate)],
    ["Session", settings.session],
    ["Status", appointment.status === "issued" ? "Issued" : "Withdrawn"],
  ]);
  pdf.callout("Monthly net remuneration", formatPdfMoney(netPay(appointment)));
  pdf.table(
    ["Component", "Amount"],
    [
      ["Basic salary", formatPdfMoney(appointment.basicSalary)],
      ["Allowances", formatPdfMoney(appointment.allowances)],
      ["Deductions", formatPdfMoney(appointment.deductions)],
      ["Net monthly pay", formatPdfMoney(netPay(appointment))],
    ]
  );
  if (appointment.bankAccount) {
    pdf.paragraph(`Salary will be paid to the recorded staff bank details: ${appointment.bankAccount}.`);
  }
  pdf.commentBox("Job description", appointment.jobDescription);
  pdf.commentBox("Terms of service", settings.termsOfService);
  pdf.commentBox("School rules", settings.schoolRules);
  pdf.paragraph(
    "By reporting for duty on the start date, the appointee accepts these terms, the school rules, and the job description."
  );
  pdf.signatureBlock([
    { role: "Proprietor / Principal", name: settings.principalName || settings.schoolName },
    { role: "Staff signature", name: appointment.name },
    { role: "Official seal", name: settings.schoolName },
  ]);
  const safeName = appointment.name.replace(/[^\w]+/g, "-").replace(/^-|-$/g, "") || "staff";
  await pdf.save(`appointment-${appointment.employeeId}-${safeName}.pdf`);
}
