export type PaymentMethod = "cash" | "transfer" | "pos" | "online";
export type InvoiceStatus = "pending" | "partial" | "paid" | "overdue";
export type FeeCategory = "Tuition" | "PTA" | "Uniform" | "Exam" | "Transport" | "Other";
export type IncomeSource = "fees" | "donations" | "grants" | "other";
export type ExpenseCategory = "salaries" | "utilities" | "supplies" | "maintenance" | "other";
export type PayrollStatus = "draft" | "processed" | "paid";

export interface FeeItem {
  category: FeeCategory;
  name?: string;
  amount: number;
}

export interface FeeStructure {
  id: string;
  name: string;
  className: string;
  term: string;
  session: string;
  items: FeeItem[];
  totalAmount: number;
}

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  className: string;
  parentEmail: string;
  studentEmail?: string;
  studentPhone?: string;
  dateOfBirth: string;
  parentAddress: string;
  parentPhone: string;
  disability: string;
  allergy: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  feeStructureId: string;
  structureName?: string;
  items?: FeeItem[];
  totalAmount: number;
  amountPaid: number;
  balance: number;
  status: InvoiceStatus;
  dueDate: string;
  term: string;
  session: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  studentId: string;
  amount: number;
  method: PaymentMethod;
  reference: string;
  receiptNo: string;
  paidAt: string;
  recordedBy: string;
}

export interface IncomeRecord {
  id: string;
  source: IncomeSource;
  description: string;
  amount: number;
  date: string;
  reference: string;
}

export interface ExpenditureRecord {
  id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  reference: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  designation: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bankAccount: string;
  userId?: string;
  appointmentId?: string;
}

export type AppointmentStatus = "issued" | "withdrawn";

export interface StaffAppointment {
  id: string;
  userId: string;
  employeeId: string;
  name: string;
  designation: string;
  jobDescription: string;
  appointmentDate: string;
  startDate: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bankAccount: string;
  status: AppointmentStatus;
  issuedAt: string;
}

export interface Payslip {
  staffId: string;
  employeeId: string;
  name: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  status: PayrollStatus;
  payslips: Payslip[];
  totalAmount: number;
  processedAt: string;
}

export const FEE_CATEGORIES: FeeCategory[] = [
  "Tuition",
  "PTA",
  "Uniform",
  "Exam",
  "Transport",
  "Other",
];

export function feeItemLabel(item: FeeItem) {
  return item.name?.trim() || item.category;
}

export function copyFeeItems(items: FeeItem[]): FeeItem[] {
  return items.map((item) => ({
    category: item.category,
    name: item.name?.trim() || undefined,
    amount: Number(item.amount) || 0,
  }));
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  transfer: "Bank Transfer",
  pos: "POS",
  online: "Online",
};

export const INCOME_SOURCE_LABELS: Record<IncomeSource, string> = {
  fees: "School Fees",
  donations: "Donations",
  grants: "Grants",
  other: "Other",
};

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  salaries: "Salaries",
  utilities: "Utilities",
  supplies: "Supplies",
  maintenance: "Maintenance",
  other: "Other",
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  pending: "Pending",
  partial: "Partial",
  paid: "Paid",
  overdue: "Overdue",
};
