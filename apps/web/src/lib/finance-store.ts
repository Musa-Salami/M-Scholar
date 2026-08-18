"use client";

import { create } from "zustand";
import type {
  ExpenditureRecord,
  ExpenseCategory,
  FeeStructure,
  IncomeRecord,
  IncomeSource,
  Invoice,
  InvoiceStatus,
  Payment,
  PaymentMethod,
  PayrollRun,
  StaffMember,
  Student,
} from "@m-scholar/shared";

const SESSION = "2025/2026";
const TERM = "First Term";

const SEED_STUDENTS: Student[] = [
  {
    id: "s1",
    admissionNo: "MS-1042",
    name: "Amina Bello",
    className: "JSS 2A",
    parentEmail: "parent@mscholar.app",
    studentEmail: "student@mscholar.app",
    dateOfBirth: "2013-04-12",
    parentAddress: "14 Adeniran Street, Ikeja, Lagos",
    parentPhone: "+234 801 555 1042",
    disability: "None",
    allergy: "Peanuts",
  },
  {
    id: "s2",
    admissionNo: "MS-1043",
    name: "Chidi Okafor",
    className: "JSS 2A",
    parentEmail: "chidi.parent@email.com",
    dateOfBirth: "2013-09-02",
    parentAddress: "8 Unity Close, Surulere, Lagos",
    parentPhone: "+234 802 555 1043",
    disability: "None",
    allergy: "None",
  },
  {
    id: "s3",
    admissionNo: "MS-1044",
    name: "Zainab Ibrahim",
    className: "JSS 1A",
    parentEmail: "zainab.parent@email.com",
    dateOfBirth: "2014-01-20",
    parentAddress: "22 Ahmadu Bello Way, Kaduna",
    parentPhone: "+234 803 555 1044",
    disability: "None",
    allergy: "Dust",
  },
  {
    id: "s4",
    admissionNo: "MS-1045",
    name: "David Adeyemi",
    className: "SS 1 Science",
    parentEmail: "david.parent@email.com",
    dateOfBirth: "2011-06-15",
    parentAddress: "5 Ring Road, Ibadan",
    parentPhone: "+234 804 555 1045",
    disability: "None",
    allergy: "None",
  },
  {
    id: "s5",
    admissionNo: "MS-1046",
    name: "Blessing Eze",
    className: "JSS 1A",
    parentEmail: "blessing.parent@email.com",
    dateOfBirth: "2014-11-08",
    parentAddress: "11 New Haven, Enugu",
    parentPhone: "+234 805 555 1046",
    disability: "None",
    allergy: "None",
  },
];

const SEED_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs1",
    name: "JSS 2A — First Term",
    className: "JSS 2A",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 85000 },
      { category: "PTA", amount: 5000 },
      { category: "Exam", amount: 3000 },
    ],
    totalAmount: 93000,
  },
  {
    id: "fs2",
    name: "JSS 1A — First Term",
    className: "JSS 1A",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 80000 },
      { category: "Uniform", amount: 15000 },
      { category: "PTA", amount: 5000 },
    ],
    totalAmount: 100000,
  },
  {
    id: "fs3",
    name: "SS 1 Science — First Term",
    className: "SS 1 Science",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 120000 },
      { category: "PTA", amount: 5000 },
      { category: "Transport", amount: 25000 },
    ],
    totalAmount: 150000,
  },
];

const STUDENTS_KEY = "mscholar-students";

function persistStudents(students: Student[]) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  } catch {
    /* ignore */
  }
}

function readStoredStudents(): Student[] | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = window.localStorage.getItem(STUDENTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as Student[];
    if (!Array.isArray(data)) return null;
    return data.map((s) => ({
      ...s,
      dateOfBirth: s.dateOfBirth ?? "",
      parentAddress: s.parentAddress ?? "",
      parentPhone: s.parentPhone ?? "",
      disability: s.disability ?? "None",
      allergy: s.allergy ?? "None",
    }));
  } catch {
    return null;
  }
}

function invoiceNo(seq: number) {
  return `INV-${new Date().getFullYear()}-${String(seq).padStart(4, "0")}`;
}

function receiptNo(seq: number) {
  return `MSCH-${new Date().getFullYear()}-${String(seq).padStart(5, "0")}`;
}

function computeStatus(total: number, paid: number, dueDate: string): InvoiceStatus {
  if (paid >= total) return "paid";
  if (paid > 0) return "partial";
  if (new Date(dueDate) < new Date()) return "overdue";
  return "pending";
}

const SEED_INVOICES: Invoice[] = [
  {
    id: "inv1",
    invoiceNo: invoiceNo(1),
    studentId: "s1",
    feeStructureId: "fs1",
    totalAmount: 93000,
    amountPaid: 48000,
    balance: 45000,
    status: "partial",
    dueDate: "2026-03-15",
    term: TERM,
    session: SESSION,
  },
  {
    id: "inv2",
    invoiceNo: invoiceNo(2),
    studentId: "s2",
    feeStructureId: "fs1",
    totalAmount: 93000,
    amountPaid: 93000,
    balance: 0,
    status: "paid",
    dueDate: "2026-03-15",
    term: TERM,
    session: SESSION,
  },
  {
    id: "inv3",
    invoiceNo: invoiceNo(3),
    studentId: "s3",
    feeStructureId: "fs2",
    totalAmount: 100000,
    amountPaid: 0,
    balance: 100000,
    status: "overdue",
    dueDate: "2026-02-01",
    term: TERM,
    session: SESSION,
  },
  {
    id: "inv4",
    invoiceNo: invoiceNo(4),
    studentId: "s4",
    feeStructureId: "fs3",
    totalAmount: 150000,
    amountPaid: 75000,
    balance: 75000,
    status: "partial",
    dueDate: "2026-03-15",
    term: TERM,
    session: SESSION,
  },
];

const SEED_PAYMENTS: Payment[] = [
  {
    id: "pay1",
    invoiceId: "inv1",
    studentId: "s1",
    amount: 48000,
    method: "transfer",
    reference: "TXN-88291",
    receiptNo: receiptNo(1),
    paidAt: "2026-01-20T10:30:00",
    recordedBy: "Adaeze Okonkwo",
  },
  {
    id: "pay2",
    invoiceId: "inv2",
    studentId: "s2",
    amount: 93000,
    method: "cash",
    reference: "CASH-0012",
    receiptNo: receiptNo(2),
    paidAt: "2026-01-18T14:00:00",
    recordedBy: "Adaeze Okonkwo",
  },
  {
    id: "pay3",
    invoiceId: "inv4",
    studentId: "s4",
    amount: 75000,
    method: "pos",
    reference: "POS-4491",
    receiptNo: receiptNo(3),
    paidAt: "2026-02-05T09:15:00",
    recordedBy: "Adaeze Okonkwo",
  },
];

const SEED_INCOME: IncomeRecord[] = [
  { id: "inc1", source: "fees", description: "Term fee collection — January", amount: 216000, date: "2026-01-31", reference: "INC-2026-001" },
  { id: "inc2", source: "donations", description: "Alumni donation", amount: 250000, date: "2026-02-10", reference: "INC-2026-002" },
  { id: "inc3", source: "grants", description: "Education board grant", amount: 500000, date: "2026-01-15", reference: "INC-2026-003" },
];

const SEED_EXPENDITURE: ExpenditureRecord[] = [
  { id: "exp1", category: "utilities", description: "Electricity — January", amount: 85000, date: "2026-01-28", reference: "EXP-2026-001" },
  { id: "exp2", category: "supplies", description: "Science lab materials", amount: 120000, date: "2026-02-03", reference: "EXP-2026-002" },
  { id: "exp3", category: "maintenance", description: "Classroom repairs", amount: 65000, date: "2026-02-12", reference: "EXP-2026-003" },
];

const SEED_STAFF: StaffMember[] = [
  { id: "st1", employeeId: "EMP-001", name: "Emeka Nwosu", designation: "Class Teacher", basicSalary: 180000, allowances: 25000, deductions: 15000, bankAccount: "****4521" },
  { id: "st2", employeeId: "EMP-002", name: "Chioma Eze", designation: "Class Teacher", basicSalary: 175000, allowances: 25000, deductions: 14000, bankAccount: "****7832" },
  { id: "st3", employeeId: "EMP-003", name: "Ibrahim Musa", designation: "Senior Teacher", basicSalary: 220000, allowances: 35000, deductions: 20000, bankAccount: "****1190" },
  { id: "st4", employeeId: "EMP-004", name: "Grace Adeyemi", designation: "Class Teacher", basicSalary: 170000, allowances: 20000, deductions: 12000, bankAccount: "****3344" },
];

interface FinanceState {
  students: Student[];
  feeStructures: FeeStructure[];
  invoices: Invoice[];
  payments: Payment[];
  income: IncomeRecord[];
  expenditure: ExpenditureRecord[];
  staff: StaffMember[];
  payrollRuns: PayrollRun[];
  invoiceSeq: number;
  receiptSeq: number;

  addFeeStructure: (data: Omit<FeeStructure, "id" | "totalAmount">) => void;
  addStudent: (data: Omit<Student, "id">) => void;
  updateStudent: (id: string, data: Omit<Student, "id">) => void;
  restoreStudents: () => void;
  generateInvoices: (feeStructureId: string) => number;
  recordPayment: (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference: string;
    recordedBy: string;
  }) => Payment | null;
  addIncome: (data: Omit<IncomeRecord, "id">) => void;
  addExpenditure: (data: Omit<ExpenditureRecord, "id">) => void;
  runPayroll: (month: string, year: number) => PayrollRun;
  markPayrollPaid: (runId: string) => void;

  getStudent: (id: string) => Student | undefined;
  getFeeStructure: (id: string) => FeeStructure | undefined;
  getPaymentsForInvoice: (invoiceId: string) => Payment[];
  getPaymentsForParent: (email: string) => Payment[];
  getInvoicesForParent: (email: string) => Invoice[];

  stats: () => {
    feeCollection: number;
    outstanding: number;
    monthlyIncome: number;
    monthlyExpenditure: number;
    payrollDue: number;
    netBalance: number;
  };
}

export const useFinanceStore = create<FinanceState>()((set, get) => ({
      students: SEED_STUDENTS,
      feeStructures: SEED_FEE_STRUCTURES,
      invoices: SEED_INVOICES,
      payments: SEED_PAYMENTS,
      income: SEED_INCOME,
      expenditure: SEED_EXPENDITURE,
      staff: SEED_STAFF,
      payrollRuns: [],
      invoiceSeq: 5,
      receiptSeq: 4,

      restoreStudents: () => {
        const stored = readStoredStudents();
        if (stored) set({ students: stored });
      },

      addStudent: (data) => {
        set((s) => {
          const students = [...s.students, { ...data, id: `s${Date.now()}` }];
          persistStudents(students);
          return { students };
        });
      },

      updateStudent: (id, data) => {
        set((s) => {
          const students = s.students.map((st) => (st.id === id ? { ...st, ...data } : st));
          persistStudents(students);
          return { students };
        });
      },

      addFeeStructure: (data) => {
        const totalAmount = data.items.reduce((s, i) => s + i.amount, 0);
        const structure: FeeStructure = {
          ...data,
          id: `fs${Date.now()}`,
          totalAmount,
        };
        set((s) => ({ feeStructures: [...s.feeStructures, structure] }));
      },

      generateInvoices: (feeStructureId) => {
        const structure = get().feeStructures.find((f) => f.id === feeStructureId);
        if (!structure) return 0;

        const existing = new Set(
          get().invoices
            .filter((i) => i.feeStructureId === feeStructureId)
            .map((i) => i.studentId)
        );

        const targets = get().students.filter(
          (s) => s.className === structure.className && !existing.has(s.id)
        );

        let seq = get().invoiceSeq;
        const newInvoices: Invoice[] = targets.map((student) => {
          seq += 1;
          return {
            id: `inv${Date.now()}-${student.id}`,
            invoiceNo: invoiceNo(seq),
            studentId: student.id,
            feeStructureId,
            totalAmount: structure.totalAmount,
            amountPaid: 0,
            balance: structure.totalAmount,
            status: "pending" as InvoiceStatus,
            dueDate: "2026-04-15",
            term: structure.term,
            session: structure.session,
          };
        });

        set((s) => ({
          invoices: [...s.invoices, ...newInvoices],
          invoiceSeq: seq,
        }));

        return newInvoices.length;
      },

      recordPayment: ({ invoiceId, amount, method, reference, recordedBy }) => {
        const invoice = get().invoices.find((i) => i.id === invoiceId);
        if (!invoice || amount <= 0 || amount > invoice.balance) return null;

        const receiptSeq = get().receiptSeq + 1;
        const payment: Payment = {
          id: `pay${Date.now()}`,
          invoiceId,
          studentId: invoice.studentId,
          amount,
          method,
          reference,
          receiptNo: receiptNo(receiptSeq),
          paidAt: new Date().toISOString(),
          recordedBy,
        };

        const amountPaid = invoice.amountPaid + amount;
        const balance = invoice.totalAmount - amountPaid;
        const updated: Invoice = {
          ...invoice,
          amountPaid,
          balance,
          status: computeStatus(invoice.totalAmount, amountPaid, invoice.dueDate),
        };

        set((s) => ({
          payments: [...s.payments, payment],
          invoices: s.invoices.map((i) => (i.id === invoiceId ? updated : i)),
          receiptSeq,
          income: [
            ...s.income,
            {
              id: `inc${Date.now()}`,
              source: "fees" as IncomeSource,
              description: `Fee payment — ${payment.receiptNo}`,
              amount,
              date: new Date().toISOString().slice(0, 10),
              reference: payment.receiptNo,
            },
          ],
        }));

        return payment;
      },

      addIncome: (data) => {
        set((s) => ({
          income: [...s.income, { ...data, id: `inc${Date.now()}` }],
        }));
      },

      addExpenditure: (data) => {
        set((s) => ({
          expenditure: [...s.expenditure, { ...data, id: `exp${Date.now()}` }],
        }));
      },

      runPayroll: (month, year) => {
        const payslips = get().staff.map((member) => ({
          staffId: member.id,
          employeeId: member.employeeId,
          name: member.name,
          basicSalary: member.basicSalary,
          allowances: member.allowances,
          deductions: member.deductions,
          netPay: member.basicSalary + member.allowances - member.deductions,
        }));

        const totalAmount = payslips.reduce((s, p) => s + p.netPay, 0);
        const run: PayrollRun = {
          id: `pr${Date.now()}`,
          month,
          year,
          status: "processed",
          payslips,
          totalAmount,
          processedAt: new Date().toISOString(),
        };

        set((s) => ({ payrollRuns: [run, ...s.payrollRuns] }));
        return run;
      },

      markPayrollPaid: (runId) => {
        const run = get().payrollRuns.find((r) => r.id === runId);
        if (!run || run.status === "paid") return;

        set((s) => ({
          payrollRuns: s.payrollRuns.map((r) =>
            r.id === runId ? { ...r, status: "paid" as const } : r
          ),
          expenditure: [
            ...s.expenditure,
            {
              id: `exp${Date.now()}`,
              category: "salaries" as ExpenseCategory,
              description: `Staff payroll — ${run.month} ${run.year}`,
              amount: run.totalAmount,
              date: new Date().toISOString().slice(0, 10),
              reference: `PAY-${run.month}-${run.year}`,
            },
          ],
        }));
      },

      getStudent: (id) => (get().students ?? []).find((s) => s.id === id),
      getFeeStructure: (id) => (get().feeStructures ?? []).find((f) => f.id === id),
      getPaymentsForInvoice: (invoiceId) => (get().payments ?? []).filter((p) => p.invoiceId === invoiceId),
      getPaymentsForParent: (email) => {
        const studentIds = new Set(
          (get().students ?? []).filter((s) => s.parentEmail === email || s.studentEmail === email).map((s) => s.id)
        );
        return (get().payments ?? []).filter((p) => studentIds.has(p.studentId));
      },
      getInvoicesForParent: (email) => {
        const studentIds = new Set(
          (get().students ?? []).filter((s) => s.parentEmail === email || s.studentEmail === email).map((s) => s.id)
        );
        return (get().invoices ?? []).filter((i) => studentIds.has(i.studentId));
      },

      stats: () => {
        const invoices = get().invoices ?? [];
        const payments = get().payments ?? [];
        const income = get().income ?? [];
        const expenditure = get().expenditure ?? [];
        const staff = get().staff ?? [];
        const feeCollection = payments.reduce((s, p) => s + p.amount, 0);
        const outstanding = invoices.reduce((s, i) => s + i.balance, 0);
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();

        const monthlyIncome = income
          .filter((r) => {
            const d = new Date(r.date);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((s, r) => s + r.amount, 0);

        const monthlyExpenditure = expenditure
          .filter((r) => {
            const d = new Date(r.date);
            return d.getMonth() === month && d.getFullYear() === year;
          })
          .reduce((s, r) => s + r.amount, 0);

        const payrollDue = staff.reduce(
          (s, m) => s + m.basicSalary + m.allowances - m.deductions,
          0
        );

        const totalIncome = income.reduce((s, r) => s + r.amount, 0);
        const totalExpenditure = expenditure.reduce((s, r) => s + r.amount, 0);

        return {
          feeCollection,
          outstanding,
          monthlyIncome,
          monthlyExpenditure,
          payrollDue,
          netBalance: totalIncome - totalExpenditure,
        };
      },
    })
);
