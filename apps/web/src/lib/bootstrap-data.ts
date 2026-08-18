"use client";

import { create } from "zustand";
import type {
  Assessment,
  AssessmentScore,
  AttendanceRegister,
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
  Student,
  TeacherNote,
  TermResult,
} from "@m-scholar/shared";
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
  vaultHasRealData,
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
  };
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
      invoiceSeq: finance.invoiceSeq,
      receiptSeq: finance.receiptSeq,
    },
    academic: {
      registers: academic.registers,
      assessments: academic.assessments,
      scores: academic.scores,
      termResults: academic.termResults,
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
    invoiceSeq: snapshot.finance.invoiceSeq ?? 6,
    receiptSeq: snapshot.finance.receiptSeq ?? 5,
  });
  useAcademicStore.getState().applyPersisted({
    registers: asArray<AttendanceRegister>(snapshot.academic.registers),
    assessments: asArray<Assessment>(snapshot.academic.assessments),
    scores: asArray<AssessmentScore>(snapshot.academic.scores),
    termResults: asArray<TermResult>(snapshot.academic.termResults),
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

  const snapshot = collectSnapshot();
  const encoded = JSON.stringify(snapshot);
  if (encoded === lastPersisted) return;

  if (getDataMode() === "demo") {
    setDataMode("real");
  }

  const countsChanged =
    JSON.stringify(useSchoolStore.getState().classes) !== JSON.stringify(snapshot.school.classes);
  if (countsChanged) {
    hydrating = true;
    useSchoolStore.getState().applyPersisted({
      users: snapshot.school.users as SchoolUser[],
      classes: snapshot.school.classes as SchoolClass[],
      settings: snapshot.school.settings as SchoolSettings,
    });
    hydrating = false;
  }

  const result = saveVault(snapshot);
  lastPersisted = encoded;
  useDataModeStore.setState({
    mode: "real",
    savedAt: result.savedAt,
    vaultHealthy: result.ok,
    hasRealVault: true,
  });
}

function schedulePersist() {
  if (hydrating) return;
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
    useDataModeStore.setState({
      mode,
      hasRealVault: vaultHasRealData(),
      savedAt: loadVault()?.savedAt ?? useDataModeStore.getState().savedAt,
    });
    if (mode !== "real") return;
    const loaded = loadVault();
    if (!loaded) return;
    hydrating = true;
    applySnapshot(loaded.snapshot);
    lastPersisted = JSON.stringify(collectSnapshot());
    hydrating = false;
  });
}

function migrateLegacyIfNeeded() {
  if (loadVault()) return false;
  const legacy = readLegacyFragments();
  if (!legacy.students && !legacy.users && !legacy.classes) return false;

  hydrating = true;
  resetAllToDemo();
  if (legacy.users || legacy.classes) {
    const school = useSchoolStore.getState();
    useSchoolStore.getState().applyPersisted({
      users: asArray<SchoolUser>(legacy.users ?? school.users),
      classes: asArray<SchoolClass>(legacy.classes ?? school.classes),
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
  lastPersisted = JSON.stringify(collectSnapshot());
  useSchoolStore.getState().restore();
  hydrating = false;
  const vault = loadVault();
  useDataModeStore.setState({
    mode: "demo",
    savedAt: vault?.savedAt ?? null,
    vaultHealthy: true,
    hasRealVault: Boolean(vault),
  });
}

function loadRealInMemory(): boolean {
  if (persistTimer) {
    window.clearTimeout(persistTimer);
    persistTimer = null;
  }
  const loaded = loadVault();
  if (!loaded) return false;
  hydrating = true;
  applySnapshot(loaded.snapshot);
  setDataMode("real");
  lastPersisted = JSON.stringify(collectSnapshot());
  useSchoolStore.getState().restore();
  hydrating = false;
  useDataModeStore.setState({
    mode: "real",
    savedAt: loaded.savedAt,
    vaultHealthy: true,
    hasRealVault: true,
  });
  return true;
}

export const useDataModeStore = create<DataModeState>()(() => ({
  mode: "demo",
  savedAt: null,
  vaultHealthy: true,
  hasRealVault: false,
  loadDemo: () => loadDemoInMemory(),
  loadReal: () => loadRealInMemory(),
  downloadBackup: () => exportVaultFile(),
}));

async function boot() {
  if (typeof window === "undefined") return;
  bindListeners();

  if (migrateLegacyIfNeeded()) return;

  const loaded = (await loadVaultAsync()) ?? loadVault();
  const mode = getDataMode();

  if (loaded && mode === "real") {
    hydrating = true;
    applySnapshot(loaded.snapshot);
    lastPersisted = JSON.stringify(collectSnapshot());
    useSchoolStore.getState().restore();
    hydrating = false;
    useDataModeStore.setState({
      mode: "real",
      savedAt: loaded.savedAt,
      vaultHealthy: true,
      hasRealVault: true,
    });
    return;
  }

  loadDemoInMemory();
  if (loaded) {
    useDataModeStore.setState({
      hasRealVault: true,
      savedAt: loaded.savedAt,
    });
  }
}

export function bootstrapAppData(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!bootPromise) bootPromise = boot();
  return bootPromise;
}
