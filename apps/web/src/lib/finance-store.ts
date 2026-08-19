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

const SESSION = "2026/2027";
const TERM = "First Term";

const SEED_STUDENTS: Student[] = [
  {
    id: "s1",
    admissionNo: "P1AB26",
    name: "Amina Bello",
    className: "Primary 1",
    parentEmail: "parent@mscholar.app",
    studentEmail: "student@mscholar.app",
    dateOfBirth: "2018-04-12",
    parentAddress: "Opposite New Zango, Ogaminana, Adavi LGA, Kogi State",
    parentPhone: "+234 801 555 1042",
    studentPhone: "+234 809 555 1042",
    disability: "None",
    allergy: "Peanuts",
  },
  {
    id: "s2",
    admissionNo: "P1CO26",
    name: "Chidi Okafor",
    className: "Primary 1",
    parentEmail: "chidi.parent@email.com",
    dateOfBirth: "2018-09-02",
    parentAddress: "Beside Fambeec Hotel, Ogaminana, Adavi LGA, Kogi State",
    parentPhone: "+234 802 555 1043",
    disability: "None",
    allergy: "None",
  },
  {
    id: "s3",
    admissionNo: "N1ZI26",
    name: "Zainab Ibrahim",
    className: "Nursery 2",
    parentEmail: "zainab.parent@email.com",
    dateOfBirth: "2020-01-20",
    parentAddress: "New Zango, Ogaminana, Adavi LGA, Kogi State",
    parentPhone: "+234 803 555 1044",
    disability: "None",
    allergy: "Dust",
  },
  {
    id: "s4",
    admissionNo: "P1YA26",
    name: "Yusuf Adeyemi",
    className: "Primary 3",
    parentEmail: "yusuf.parent@email.com",
    dateOfBirth: "2016-06-15",
    parentAddress: "Adavi LGA, Kogi State",
    parentPhone: "+234 804 555 1045",
    disability: "None",
    allergy: "None",
  },
  {
    id: "s5",
    admissionNo: "N1BE26",
    name: "Blessing Eze",
    className: "Nursery 2",
    parentEmail: "blessing.parent@email.com",
    dateOfBirth: "2020-11-08",
    parentAddress: "Ogaminana, Adavi LGA, Kogi State",
    parentPhone: "+234 805 555 1046",
    disability: "None",
    allergy: "None",
  },
];

const SEED_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: "fs1",
    name: "Primary 1 — First Term",
    className: "Primary 1",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 35000 },
      { category: "PTA", amount: 3000 },
      { category: "Uniform", amount: 8000 },
    ],
    totalAmount: 46000,
  },
  {
    id: "fs2",
    name: "Nursery 2 — First Term",
    className: "Nursery 2",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 28000 },
      { category: "Uniform", amount: 7000 },
      { category: "PTA", amount: 3000 },
    ],
    totalAmount: 38000,
  },
  {
    id: "fs3",
    name: "Primary 3 — First Term",
    className: "Primary 3",
    term: TERM,
    session: SESSION,
    items: [
      { category: "Tuition", amount: 40000 },
      { category: "PTA", amount: 3000 },
      { category: "Other", amount: 7000 },
    ],
    totalAmount: 50000,
  },
];

function normalizeStudent(s: Student): Student {
  return {
    ...s,
    dateOfBirth: s.dateOfBirth ?? "",
    parentAddress: s.parentAddress ?? "",
    parentPhone: s.parentPhone ?? "",
    studentPhone: s.studentPhone ?? "",
    disability: s.disability ?? "None",
    allergy: s.allergy ?? "None",
  };
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
    totalAmount: 46000,
    amountPaid: 20000,
    balance: 26000,
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
    totalAmount: 46000,
    amountPaid: 46000,
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
    totalAmount: 38000,
    amountPaid: 0,
    balance: 38000,
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
    totalAmount: 50000,
    amountPaid: 25000,
    balance: 25000,
    status: "partial",
    dueDate: "2026-03-15",
    term: TERM,
    session: SESSION,
  },
  {
    id: "inv5",
    invoiceNo: invoiceNo(5),
    studentId: "s5",
    feeStructureId: "fs2",
    totalAmount: 38000,
    amountPaid: 15000,
    balance: 23000,
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
    amount: 20000,
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
    amount: 46000,
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
    amount: 25000,
    method: "pos",
    reference: "POS-4491",
    receiptNo: receiptNo(3),
    paidAt: "2026-02-05T09:15:00",
    recordedBy: "Adaeze Okonkwo",
  },
  {
    id: "pay4",
    invoiceId: "inv5",
    studentId: "s5",
    amount: 15000,
    method: "transfer",
    reference: "TXN-91002",
    receiptNo: receiptNo(4),
    paidAt: "2026-02-08T11:20:00",
    recordedBy: "Adaeze Okonkwo",
  },
];

const SEED_INCOME: IncomeRecord[] = [
  { id: "inc1", source: "fees", description: "Term fee collection — January", amount: 106000, date: "2026-01-31", reference: "INC-2026-001" },
  { id: "inc2", source: "donations", description: "PTA support for workbooks", amount: 40000, date: "2026-02-10", reference: "INC-2026-002" },
  { id: "inc3", source: "donations", description: "Eid gift to the school", amount: 25000, date: "2026-01-15", reference: "INC-2026-003" },
];

const SEED_EXPENDITURE: ExpenditureRecord[] = [
  { id: "exp1", category: "utilities", description: "Electricity — January", amount: 40000, date: "2026-01-28", reference: "EXP-2026-001" },
  { id: "exp2", category: "supplies", description: "Jolly Phonics workbooks and stationery", amount: 35000, date: "2026-02-03", reference: "EXP-2026-002" },
  { id: "exp3", category: "maintenance", description: "Classroom furniture repairs", amount: 55000, date: "2026-02-12", reference: "EXP-2026-003" },
];

const SEED_STAFF: StaffMember[] = [
  { id: "st1", employeeId: "EMP-001", name: "Emeka Nwosu", designation: "Class Teacher, Primary 1", basicSalary: 90000, allowances: 15000, deductions: 8000, bankAccount: "****4521" },
  { id: "st2", employeeId: "EMP-002", name: "Chioma Eze", designation: "Head of Nursery", basicSalary: 95000, allowances: 15000, deductions: 8000, bankAccount: "****7832" },
  { id: "st3", employeeId: "EMP-003", name: "Ibrahim Musa", designation: "Tahfeez Instructor", basicSalary: 100000, allowances: 20000, deductions: 10000, bankAccount: "****1190" },
  { id: "st4", employeeId: "EMP-004", name: "Grace Adeyemi", designation: "Kindergarten Teacher", basicSalary: 85000, allowances: 12000, deductions: 7000, bankAccount: "****3344" },
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
  resetToDemo: () => void;
  applyPersisted: (data: {
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
  }) => void;
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
      invoiceSeq: 6,
      receiptSeq: 5,

      resetToDemo: () =>
        set({
          students: SEED_STUDENTS,
          feeStructures: SEED_FEE_STRUCTURES,
          invoices: SEED_INVOICES,
          payments: SEED_PAYMENTS,
          income: SEED_INCOME,
          expenditure: SEED_EXPENDITURE,
          staff: SEED_STAFF,
          payrollRuns: [],
          invoiceSeq: 6,
          receiptSeq: 5,
        }),

      applyPersisted: (data) =>
        set({
          students: (data.students ?? []).map(normalizeStudent),
          feeStructures: data.feeStructures ?? SEED_FEE_STRUCTURES,
          invoices: data.invoices ?? [],
          payments: data.payments ?? [],
          income: data.income ?? [],
          expenditure: data.expenditure ?? [],
          staff: data.staff ?? SEED_STAFF,
          payrollRuns: data.payrollRuns ?? [],
          invoiceSeq: data.invoiceSeq ?? 6,
          receiptSeq: data.receiptSeq ?? 5,
        }),

      addStudent: (data) => {
        set((s) => ({
          students: [...s.students, { ...data, id: `s${Date.now()}` }],
        }));
      },

      updateStudent: (id, data) => {
        set((s) => ({
          students: s.students.map((st) => (st.id === id ? { ...st, ...data } : st)),
        }));
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
