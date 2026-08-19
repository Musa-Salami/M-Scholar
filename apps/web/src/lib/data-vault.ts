export type DataMode = "demo" | "real";

export const VAULT_VERSION = 1;
const MODE_KEY = "mscholar-data-mode";
const PRIMARY_KEY = "mscholar-vault-v1";
const BACKUP_KEY = "mscholar-vault-v1-bak";

export interface AppSnapshot {
  version: number;
  school: {
    users: unknown[];
    classes: unknown[];
    settings: {
      schoolName: string;
      motto: string;
      address: string;
      phone: string;
      email: string;
      session: string;
      term: string;
      principalName?: string;
      nextTermResumptionDate?: string;
      defaultStaffPassword?: string;
      defaultFamilyPassword?: string;
      termsOfService?: string;
      schoolRules?: string;
    };
    appointments?: unknown[];
  };
  finance: {
    students: unknown[];
    feeStructures: unknown[];
    invoices: unknown[];
    payments: unknown[];
    income: unknown[];
    expenditure: unknown[];
    staff: unknown[];
    payrollRuns: unknown[];
    invoiceSeq: number;
    receiptSeq: number;
  };
  academic: {
    registers: unknown[];
    assessments: unknown[];
    scores: unknown[];
    termResults: unknown[];
    assignments?: unknown[];
  };
  comms: {
    notes: unknown[];
    threads: unknown[];
    messages: unknown[];
  };
  notifications: {
    notifications: unknown[];
  };
}

interface VaultEnvelope {
  version: number;
  savedAt: string;
  checksum: string;
  payload: AppSnapshot;
}

function fnv1a(text: string): string {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function isSnapshot(value: unknown): value is AppSnapshot {
  if (!value || typeof value !== "object") return false;
  const snap = value as AppSnapshot;
  return (
    snap.version === VAULT_VERSION &&
    Array.isArray(snap.school?.users) &&
    Array.isArray(snap.school?.classes) &&
    Boolean(snap.school?.settings) &&
    Array.isArray(snap.finance?.students) &&
    Array.isArray(snap.finance?.feeStructures) &&
    Array.isArray(snap.finance?.invoices) &&
    Array.isArray(snap.finance?.payments) &&
    Array.isArray(snap.finance?.income) &&
    Array.isArray(snap.finance?.expenditure) &&
    Array.isArray(snap.finance?.staff) &&
    Array.isArray(snap.finance?.payrollRuns) &&
    Array.isArray(snap.academic?.registers) &&
    Array.isArray(snap.academic?.assessments) &&
    Array.isArray(snap.academic?.scores) &&
    Array.isArray(snap.academic?.termResults) &&
    Array.isArray(snap.comms?.notes) &&
    Array.isArray(snap.comms?.threads) &&
    Array.isArray(snap.comms?.messages) &&
    Array.isArray(snap.notifications?.notifications)
  );
}

function parseEnvelope(raw: string | null): VaultEnvelope | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VaultEnvelope;
    if (!parsed?.payload || parsed.version !== VAULT_VERSION) return null;
    const encoded = JSON.stringify(parsed.payload);
    if (parsed.checksum !== fnv1a(encoded)) return null;
    if (!isSnapshot(parsed.payload)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDataMode(): DataMode {
  try {
    const mode = window.localStorage.getItem(MODE_KEY);
    return mode === "real" ? "real" : "demo";
  } catch {
    return "demo";
  }
}

export function setDataMode(mode: DataMode) {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* ignore quota */
  }
}

export function loadVault(): { snapshot: AppSnapshot; savedAt: string } | null {
  try {
    const primary = parseEnvelope(window.localStorage.getItem(PRIMARY_KEY));
    if (primary) return { snapshot: primary.payload, savedAt: primary.savedAt };
    const backup = parseEnvelope(window.localStorage.getItem(BACKUP_KEY));
    if (backup) return { snapshot: backup.payload, savedAt: backup.savedAt };
  } catch {
    /* ignore */
  }
  return null;
}

export function saveVault(snapshot: AppSnapshot): { ok: boolean; savedAt: string } {
  const savedAt = new Date().toISOString();
  const payload: AppSnapshot = { ...snapshot, version: VAULT_VERSION };
  const encodedPayload = JSON.stringify(payload);
  const envelope: VaultEnvelope = {
    version: VAULT_VERSION,
    savedAt,
    checksum: fnv1a(encodedPayload),
    payload,
  };
  const encoded = JSON.stringify(envelope);
  try {
    const current = window.localStorage.getItem(PRIMARY_KEY);
    if (current) window.localStorage.setItem(BACKUP_KEY, current);
    window.localStorage.setItem(PRIMARY_KEY, encoded);
    const readBack = window.localStorage.getItem(PRIMARY_KEY);
    if (readBack !== encoded) {
      void idbSet(PRIMARY_KEY, encoded);
      return { ok: false, savedAt };
    }
    void idbSet(PRIMARY_KEY, encoded);
    if (current) void idbSet(BACKUP_KEY, current);
    return { ok: true, savedAt };
  } catch {
    void idbSet(PRIMARY_KEY, encoded);
    return { ok: false, savedAt };
  }
}

export function vaultHasRealData(): boolean {
  return loadVault() !== null;
}

export function exportVaultFile(snapshot?: AppSnapshot) {
  const payload = snapshot ?? loadVault()?.snapshot ?? {};
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `mscholar-real-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function readLegacyFragments(): {
  users?: unknown[];
  classes?: unknown[];
  students?: unknown[];
} {
  const out: { users?: unknown[]; classes?: unknown[]; students?: unknown[] } = {};
  try {
    const school = window.localStorage.getItem("mscholar-school");
    if (school) {
      const data = JSON.parse(school) as {
        users?: unknown[];
        classes?: unknown[];
        state?: { users?: unknown[]; classes?: unknown[] };
      };
      const users = data.users ?? data.state?.users;
      const classes = data.classes ?? data.state?.classes;
      if (Array.isArray(users)) out.users = users;
      if (Array.isArray(classes)) out.classes = classes;
    }
    const students = window.localStorage.getItem("mscholar-students");
    if (students) {
      const parsed = JSON.parse(students) as unknown;
      const list = Array.isArray(parsed)
        ? parsed
        : Array.isArray((parsed as { state?: { students?: unknown[] } })?.state?.students)
          ? (parsed as { state: { students: unknown[] } }).state.students
          : null;
      if (list) out.students = list;
    }
  } catch {
    /* ignore */
  }
  return out;
}

const IDB_NAME = "mscholar-vault-db";
const IDB_STORE = "kv";

function openVaultDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(IDB_STORE)) {
          req.result.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function idbGet(key: string): Promise<string | null> {
  return openVaultDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) {
          resolve(null);
          return;
        }
        try {
          const tx = db.transaction(IDB_STORE, "readonly");
          const req = tx.objectStore(IDB_STORE).get(key);
          req.onsuccess = () => resolve(typeof req.result === "string" ? req.result : null);
          req.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      })
  );
}

function idbSet(key: string, value: string): Promise<boolean> {
  return openVaultDb().then(
    (db) =>
      new Promise((resolve) => {
        if (!db) {
          resolve(false);
          return;
        }
        try {
          const tx = db.transaction(IDB_STORE, "readwrite");
          tx.objectStore(IDB_STORE).put(value, key);
          tx.oncomplete = () => resolve(true);
          tx.onerror = () => resolve(false);
        } catch {
          resolve(false);
        }
      })
  );
}

export async function loadVaultAsync(): Promise<{ snapshot: AppSnapshot; savedAt: string } | null> {
  const local = loadVault();
  if (local) return local;
  const primary = parseEnvelope(await idbGet(PRIMARY_KEY));
  if (primary) return { snapshot: primary.payload, savedAt: primary.savedAt };
  const backup = parseEnvelope(await idbGet(BACKUP_KEY));
  if (backup) return { snapshot: backup.payload, savedAt: backup.savedAt };
  return null;
}

export const VAULT_KEYS = {
  mode: MODE_KEY,
  primary: PRIMARY_KEY,
  backup: BACKUP_KEY,
};
