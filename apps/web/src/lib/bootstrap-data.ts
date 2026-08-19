"use client";

import { create } from "zustand";
import type {
  Assessment,
  AssessmentScore,
  AttendanceRegister,
  ClassAssignment,
  ChatMessage,
  ExpenditureRecord,
  FeeStructure,
  IncomeRecord,
  Invoice,
  MessageThread,
  PayrollRun,
  Payment,
  AppNotification,
  StaffMember,
  StaffAppointment,
  Student,
  TeacherNote,
  TermResult,
} from "@m-scholar/shared";
import { DEMO_USERS, FEE_CATEGORIES } from "@m-scholar/shared";
import {
  type AppSnapshot,
  type DataMode,
  VAULT_KEYS,
  VAULT_VERSION,
  exportVaultFile,
  getDataMode,
  loadVault,
  loadVaultAsync,
  readLegacyFragments,
  saveVault,
  setDataMode,
} from "@/lib/data-vault";
import {
  SEED_SETTINGS,
  useSchoolStore,
  type SchoolClass,
  type SchoolSettings,
  type SchoolUser,
} from "@/lib/school-store";
import { useFinanceStore } from "@/lib/finance-store";
import { useAcademicStore } from "@/lib/academic-store";
import { useCommsStore } from "@/lib/comms-store";
import { useNotificationStore } from "@/lib/notification-store";
import { DEMO_IDS } from "@/lib/demo-ids";

interface DataModeState {
  mode: DataMode;
  savedAt: string | null;
  vaultHealthy: boolean;
  hasRealVault: boolean;
  loadDemo: () => void;
  loadReal: () => boolean;
  downloadBackup: () => void;
}

let hydrating = false;
let lastPersisted = "";
let persistTimer: number | null = null;
let listenersBound = false;
let bootPromise: Promise<void> | null = null;

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asSettings(raw: AppSnapshot["school"]["settings"] | undefined): SchoolSettings {
  return {
    schoolName: raw?.schoolName || SEED_SETTINGS.schoolName,
    motto: raw?.motto || SEED_SETTINGS.motto,
    address: raw?.address || SEED_SETTINGS.address,
    phone: raw?.phone || SEED_SETTINGS.phone,
    email: raw?.email || SEED_SETTINGS.email,
    session: raw?.session || SEED_SETTINGS.session,
    term: raw?.term || SEED_SETTINGS.term,
    principalName: raw?.principalName || SEED_SETTINGS.principalName,
    nextTermResumptionDate: raw?.nextTermResumptionDate || SEED_SETTINGS.nextTermResumptionDate,
    defaultStaffPassword: raw?.defaultStaffPassword ?? SEED_SETTINGS.defaultStaffPassword,
    defaultFamilyPassword: raw?.defaultFamilyPassword ?? SEED_SETTINGS.defaultFamilyPassword,
    termsOfService: raw?.termsOfService || SEED_SETTINGS.termsOfService,
    schoolRules: raw?.schoolRules || SEED_SETTINGS.schoolRules,
  };
}

function withoutDemo<T extends { id: string }>(rows: unknown, demoIds: Set<string>): T[] {
  return asArray<T>(rows).filter((row) => !demoIds.has(row.id));
}

function emptySnapshot(settings?: SchoolSettings): AppSnapshot {
  return {
    version: VAULT_VERSION,
    school: {
      users: [],
      classes: [],
      appointments: [],
      settings: settings ?? SEED_SETTINGS,
    },
    finance: {
      students: [],
      feeStructures: [],
      invoices: [],
      payments: [],
      income: [],
      expenditure: [],
      staff: [],
      payrollRuns: [],
      feeCategories: [...FEE_CATEGORIES],
      invoiceSeq: 1,
      receiptSeq: 1,
    },
    academic: {
      registers: [],
      assessments: [],
      scores: [],
      termResults: [],
      assignments: [],
    },
    comms: {
      notes: [],
      threads: [],
      messages: [],
    },
    notifications: {
      notifications: [],
    },
  };
}

function stripDemoSeeds(snapshot: AppSnapshot): AppSnapshot {
  const students = withoutDemo<Student>(snapshot.finance.students, DEMO_IDS.students);
  const studentIds = new Set(students.map((s) => s.id));
  const users = withoutDemo<SchoolUser>(snapshot.school.users, DEMO_IDS.users);
  const userIds = new Set(users.map((u) => u.id));
  const classes = withoutDemo<SchoolClass>(snapshot.school.classes, DEMO_IDS.classes).map((cls) => ({
    ...cls,
    teacherId: cls.teacherId && userIds.has(cls.teacherId) ? cls.teacherId : null,
  }));
  const assessments = withoutDemo<Assessment>(snapshot.academic.assessments, DEMO_IDS.assessments);
  const assessmentIds = new Set(assessments.map((a) => a.id));
  const threads = withoutDemo<MessageThread>(snapshot.comms.threads, DEMO_IDS.threads)
    .filter((t) => studentIds.has(t.studentId))
    .map((thread) => {
      const student = students.find((s) => s.id === thread.studentId);
      if (!student) return thread;
      const cls = classes.find((c) => c.name.toLowerCase() === student.className.toLowerCase());
      const teacher = users.find((u) => u.id === cls?.teacherId);
      const teacherName = teacher?.name ?? "";
      const subject = `${student.name} — ${student.className}`;
      if (thread.teacherName === teacherName && thread.subject === subject) return thread;
      return { ...thread, teacherName, subject };
    });
  const threadIds = new Set(threads.map((t) => t.id));
  const appointments = withoutDemo<StaffAppointment>(snapshot.school.appointments, DEMO_IDS.appointments).filter(
    (a) => userIds.has(a.userId)
  );
  const appointmentIds = new Set(appointments.map((a) => a.id));

  return {
    version: VAULT_VERSION,
    school: {
      users,
      classes,
      appointments,
      settings: asSettings(snapshot.school.settings),
    },
    finance: {
      students,
      feeStructures: withoutDemo<FeeStructure>(snapshot.finance.feeStructures, DEMO_IDS.feeStructures),
      invoices: withoutDemo<Invoice>(snapshot.finance.invoices, DEMO_IDS.invoices).filter((i) =>
        studentIds.has(i.studentId)
      ),
      payments: withoutDemo<Payment>(snapshot.finance.payments, DEMO_IDS.payments).filter((p) =>
        studentIds.has(p.studentId)
      ),
      income: withoutDemo<IncomeRecord>(snapshot.finance.income, DEMO_IDS.income),
      expenditure: withoutDemo<ExpenditureRecord>(snapshot.finance.expenditure, DEMO_IDS.expenditure),
      staff: withoutDemo<StaffMember>(snapshot.finance.staff, DEMO_IDS.staff).filter(
        (m) =>
          (!m.userId || userIds.has(m.userId)) &&
          (!m.appointmentId || appointmentIds.has(m.appointmentId))
      ),
      payrollRuns: asArray<PayrollRun>(snapshot.finance.payrollRuns),
      feeCategories: asArray<string>(snapshot.finance.feeCategories),
      invoiceSeq: snapshot.finance.invoiceSeq ?? 1,
      receiptSeq: snapshot.finance.receiptSeq ?? 1,
    },
    academic: {
      registers: withoutDemo<AttendanceRegister>(snapshot.academic.registers, DEMO_IDS.registers),
      assessments,
      scores: withoutDemo<AssessmentScore>(snapshot.academic.scores, DEMO_IDS.scores).filter(
        (s) => studentIds.has(s.studentId) && assessmentIds.has(s.assessmentId)
      ),
      termResults: withoutDemo<TermResult>(snapshot.academic.termResults, DEMO_IDS.results).filter((r) =>
        studentIds.has(r.studentId)
      ),
      assignments: withoutDemo<ClassAssignment>(snapshot.academic.assignments, DEMO_IDS.assignments),
    },
    comms: {
      notes: withoutDemo<TeacherNote>(snapshot.comms.notes, DEMO_IDS.notes).filter((n) => studentIds.has(n.studentId)),
      threads,
      messages: withoutDemo<ChatMessage>(snapshot.comms.messages, DEMO_IDS.messages).filter((m) =>
        threadIds.has(m.threadId)
      ),
    },
    notifications: {
      notifications: withoutDemo<AppNotification>(snapshot.notifications.notifications, DEMO_IDS.notifications).filter(
        (n) => !DEMO_USERS[n.userEmail.toLowerCase()]
      ),
    },
  };
}

function hasEnteredRecords(snapshot: AppSnapshot): boolean {
  return (
    snapshot.school.users.length > 0 ||
    snapshot.school.classes.length > 0 ||
    (snapshot.school.appointments?.length ?? 0) > 0 ||
    snapshot.finance.students.length > 0 ||
    snapshot.finance.feeStructures.length > 0 ||
    snapshot.finance.invoices.length > 0 ||
    snapshot.finance.payments.length > 0 ||
    snapshot.finance.income.length > 0 ||
    snapshot.finance.expenditure.length > 0 ||
    snapshot.finance.staff.length > 0 ||
    snapshot.finance.payrollRuns.length > 0 ||
    snapshot.academic.registers.length > 0 ||
    snapshot.academic.assessments.length > 0 ||
    snapshot.academic.scores.length > 0 ||
    snapshot.academic.termResults.length > 0 ||
    (snapshot.academic.assignments?.length ?? 0) > 0 ||
    snapshot.comms.notes.length > 0 ||
    snapshot.comms.threads.length > 0 ||
    snapshot.comms.messages.length > 0
  );
}

function containsDemoSeeds(snapshot: AppSnapshot): boolean {
  const checks: Array<[unknown, Set<string>]> = [
    [snapshot.school.users, DEMO_IDS.users],
    [snapshot.school.classes, DEMO_IDS.classes],
    [snapshot.school.appointments, DEMO_IDS.appointments],
    [snapshot.finance.students, DEMO_IDS.students],
    [snapshot.finance.feeStructures, DEMO_IDS.feeStructures],
    [snapshot.finance.invoices, DEMO_IDS.invoices],
    [snapshot.finance.payments, DEMO_IDS.payments],
    [snapshot.finance.income, DEMO_IDS.income],
    [snapshot.finance.expenditure, DEMO_IDS.expenditure],
    [snapshot.finance.staff, DEMO_IDS.staff],
    [snapshot.academic.registers, DEMO_IDS.registers],
    [snapshot.academic.assessments, DEMO_IDS.assessments],
    [snapshot.academic.scores, DEMO_IDS.scores],
    [snapshot.academic.termResults, DEMO_IDS.results],
    [snapshot.academic.assignments, DEMO_IDS.assignments],
    [snapshot.comms.notes, DEMO_IDS.notes],
    [snapshot.comms.threads, DEMO_IDS.threads],
    [snapshot.comms.messages, DEMO_IDS.messages],
    [snapshot.notifications.notifications, DEMO_IDS.notifications],
  ];
  return checks.some(([rows, ids]) => asArray<{ id: string }>(rows).some((row) => ids.has(row.id)));
}

function rewriteVaultIfPolluted(snapshot: AppSnapshot): { snapshot: AppSnapshot; savedAt: string | null } {
  const real = stripDemoSeeds(snapshot);
  if (!containsDemoSeeds(snapshot)) return { snapshot: real, savedAt: null };
  const result = saveVault(real);
  lastPersisted = JSON.stringify(real);
  return { snapshot: real, savedAt: result.savedAt };
}

function applyRealSnapshot(snapshot: AppSnapshot) {
  applySnapshot(stripDemoSeeds(snapshot));
}

function collectSnapshot(): AppSnapshot {
  const school = useSchoolStore.getState();
  const finance = useFinanceStore.getState();
  const academic = useAcademicStore.getState();
  const comms = useCommsStore.getState();
  const notifications = useNotificationStore.getState();

  const classes = school.classes.map((c) => ({
    ...c,
    studentCount: finance.students.filter((st) => st.className === c.name).length,
  }));

  return {
    version: VAULT_VERSION,
    school: {
      users: school.users,
      classes,
      appointments: school.appointments,
      settings: school.settings,
    },
    finance: {
      students: finance.students,
      feeStructures: finance.feeStructures,
      invoices: finance.invoices,
      payments: finance.payments,
      income: finance.income,
      expenditure: finance.expenditure,
      staff: finance.staff,
      payrollRuns: finance.payrollRuns,
      feeCategories: finance.feeCategories,
      invoiceSeq: finance.invoiceSeq,
      receiptSeq: finance.receiptSeq,
    },
    academic: {
      registers: academic.registers,
      assessments: academic.assessments,
      scores: academic.scores,
      termResults: academic.termResults,
      assignments: academic.assignments,
    },
    comms: {
      notes: comms.notes,
      threads: comms.threads,
      messages: comms.messages,
    },
    notifications: {
      notifications: notifications.notifications,
    },
  };
}

function applySnapshot(snapshot: AppSnapshot) {
  useSchoolStore.getState().applyPersisted({
    users: asArray<SchoolUser>(snapshot.school.users),
    classes: asArray<SchoolClass>(snapshot.school.classes),
    appointments: asArray<StaffAppointment>(snapshot.school.appointments),
    settings: asSettings(snapshot.school.settings),
  });
  useFinanceStore.getState().applyPersisted({
    students: asArray<Student>(snapshot.finance.students),
    feeStructures: asArray<FeeStructure>(snapshot.finance.feeStructures),
    invoices: asArray<Invoice>(snapshot.finance.invoices),
    payments: asArray<Payment>(snapshot.finance.payments),
    income: asArray<IncomeRecord>(snapshot.finance.income),
    expenditure: asArray<ExpenditureRecord>(snapshot.finance.expenditure),
    staff: asArray<StaffMember>(snapshot.finance.staff),
    payrollRuns: asArray<PayrollRun>(snapshot.finance.payrollRuns),
    feeCategories: asArray<string>(snapshot.finance.feeCategories),
    invoiceSeq: snapshot.finance.invoiceSeq ?? 6,
    receiptSeq: snapshot.finance.receiptSeq ?? 5,
  });
  useAcademicStore.getState().applyPersisted({
    registers: asArray<AttendanceRegister>(snapshot.academic.registers),
    assessments: asArray<Assessment>(snapshot.academic.assessments),
    scores: asArray<AssessmentScore>(snapshot.academic.scores),
    termResults: asArray<TermResult>(snapshot.academic.termResults),
    assignments: asArray<ClassAssignment>(snapshot.academic.assignments),
  });
  useCommsStore.getState().applyPersisted({
    notes: asArray<TeacherNote>(snapshot.comms.notes),
    threads: asArray<MessageThread>(snapshot.comms.threads),
    messages: asArray<ChatMessage>(snapshot.comms.messages),
  });
  useNotificationStore.getState().applyPersisted({
    notifications: asArray<AppNotification>(snapshot.notifications.notifications),
  });
  useSchoolStore.getState().syncClassCounts(useFinanceStore.getState().students);
}

function resetAllToDemo() {
  useSchoolStore.getState().resetToDemo();
  useFinanceStore.getState().resetToDemo();
  useAcademicStore.getState().resetToDemo();
  useCommsStore.getState().resetToDemo();
  useNotificationStore.getState().resetToDemo();
  useSchoolStore.getState().syncClassCounts(useFinanceStore.getState().students);
}

function persistNow() {
  if (hydrating || typeof window === "undefined") return;
  // Demo is an in-memory sample. Never write it over the real vault or flip the mode.
  if (getDataMode() === "demo") return;

  const live = collectSnapshot();
  const snapshot = stripDemoSeeds(live);
  const encoded = JSON.stringify(snapshot);

  if (encoded === lastPersisted) return;

  const result = saveVault(snapshot);
  lastPersisted = encoded;
  useDataModeStore.setState({
    mode: "real",
    savedAt: result.savedAt,
    vaultHealthy: result.ok,
    hasRealVault: hasEnteredRecords(snapshot),
  });
}

function schedulePersist() {
  if (hydrating) return;
  if (getDataMode() === "demo") return;
  if (persistTimer) window.clearTimeout(persistTimer);
  persistTimer = window.setTimeout(() => {
    persistTimer = null;
    persistNow();
  }, 250);
}

function bindListeners() {
  if (listenersBound || typeof window === "undefined") return;
  listenersBound = true;

  const onChange = () => schedulePersist();
  useSchoolStore.subscribe(onChange);
  useFinanceStore.subscribe(onChange);
  useAcademicStore.subscribe(onChange);
  useCommsStore.subscribe(onChange);
  useNotificationStore.subscribe(() => {
    if (hydrating) return;
    if (getDataMode() === "demo") return;
    schedulePersist();
  });

  window.addEventListener("beforeunload", persistNow);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") persistNow();
  });

  window.addEventListener("storage", (event) => {
    if (!event.key || (event.key !== VAULT_KEYS.primary && event.key !== VAULT_KEYS.mode)) return;
    const mode = getDataMode();
    const loaded = loadVault();
    const real = loaded ? stripDemoSeeds(loaded.snapshot) : emptySnapshot();
    useDataModeStore.setState({
      mode,
      hasRealVault: hasEnteredRecords(real),
      savedAt: loaded?.savedAt ?? useDataModeStore.getState().savedAt,
    });
    if (mode !== "real" || !loaded) return;
    hydrating = true;
    applyRealSnapshot(loaded.snapshot);
    lastPersisted = JSON.stringify(collectSnapshot());
    hydrating = false;
  });
}

function migrateLegacyIfNeeded() {
  if (loadVault()) return false;
  const legacy = readLegacyFragments();
  if (!legacy.students && !legacy.users && !legacy.classes) return false;

  hydrating = true;
  applySnapshot(emptySnapshot());
  if (legacy.users || legacy.classes) {
    const school = useSchoolStore.getState();
    useSchoolStore.getState().applyPersisted({
      users: asArray<SchoolUser>(legacy.users ?? []),
      classes: asArray<SchoolClass>(legacy.classes ?? []),
      settings: school.settings,
    });
  }
  if (legacy.students) {
    const finance = useFinanceStore.getState();
    useFinanceStore.getState().applyPersisted({
      students: asArray<Student>(legacy.students),
      feeStructures: finance.feeStructures,
      invoices: finance.invoices,
      payments: finance.payments,
      income: finance.income,
      expenditure: finance.expenditure,
      staff: finance.staff,
      payrollRuns: finance.payrollRuns,
      feeCategories: finance.feeCategories,
      invoiceSeq: finance.invoiceSeq,
      receiptSeq: finance.receiptSeq,
    });
  }
  useSchoolStore.getState().syncClassCounts(useFinanceStore.getState().students);
  hydrating = false;

  setDataMode("real");
  persistNow();
  return true;
}

function loadDemoInMemory() {
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = null;
  }
  if (getDataMode() === "real") persistNow();

  hydrating = true;
  resetAllToDemo();
  setDataMode("demo");
  lastPersisted = JSON.stringify(stripDemoSeeds(collectSnapshot()));
  useSchoolStore.getState().restore();
  hydrating = false;
  const vault = loadVault();
  const real = vault ? stripDemoSeeds(vault.snapshot) : emptySnapshot();
  useDataModeStore.setState({
    mode: "demo",
    savedAt: vault?.savedAt ?? null,
    vaultHealthy: true,
    hasRealVault: hasEnteredRecords(real),
  });
}

function loadRealInMemory(): boolean {
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = null;
  }
  const loaded = loadVault();
  const real = loaded
    ? stripDemoSeeds(loaded.snapshot)
    : emptySnapshot(useSchoolStore.getState().settings);
  hydrating = true;
  applySnapshot(real);
  setDataMode("real");
  lastPersisted = JSON.stringify(real);
  useSchoolStore.getState().restore();
  hydrating = false;
  let savedAt = loaded?.savedAt ?? null;
  let vaultHealthy = true;
  if (loaded && containsDemoSeeds(loaded.snapshot)) {
    const result = saveVault(real);
    savedAt = result.savedAt;
    vaultHealthy = result.ok;
  }
  const entered = hasEnteredRecords(real);
  useDataModeStore.setState({
    mode: "real",
    savedAt,
    vaultHealthy,
    hasRealVault: entered,
  });
  return entered;
}

export const useDataModeStore = create<DataModeState>()(() => ({
  mode: "demo",
  savedAt: null,
  vaultHealthy: true,
  hasRealVault: false,
  loadDemo: () => loadDemoInMemory(),
  loadReal: () => loadRealInMemory(),
  downloadBackup: () => {
    const loaded = loadVault();
    if (!loaded) return;
    exportVaultFile(stripDemoSeeds(loaded.snapshot));
  },
}));

async function boot() {
  if (typeof window === "undefined") return;
  bindListeners();

  if (migrateLegacyIfNeeded()) return;

  const loaded = (await loadVaultAsync()) ?? loadVault();
  const mode = getDataMode();

  const sanitized = loaded ? rewriteVaultIfPolluted(loaded.snapshot) : null;
  const vault = sanitized
    ? { snapshot: sanitized.snapshot, savedAt: sanitized.savedAt ?? loaded?.savedAt ?? null }
    : loaded
      ? { snapshot: stripDemoSeeds(loaded.snapshot), savedAt: loaded.savedAt }
      : null;

  if (vault && mode === "real") {
    hydrating = true;
    applySnapshot(vault.snapshot);
    lastPersisted = JSON.stringify(vault.snapshot);
    useSchoolStore.getState().restore();
    hydrating = false;
    useDataModeStore.setState({
      mode: "real",
      savedAt: vault.savedAt,
      vaultHealthy: true,
      hasRealVault: hasEnteredRecords(vault.snapshot),
    });
    return;
  }

  loadDemoInMemory();
  if (vault) {
    useDataModeStore.setState({
      hasRealVault: hasEnteredRecords(vault.snapshot),
      savedAt: vault.savedAt,
    });
  }
}

export function bootstrapAppData(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!bootPromise) bootPromise = boot();
  return bootPromise;
}
