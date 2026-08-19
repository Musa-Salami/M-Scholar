"use client";

import { doc, getDoc, onSnapshot, writeBatch } from "firebase/firestore";
import { type AppSnapshot, isAppSnapshot } from "@/lib/data-vault";
import { getFirestoreDb } from "@/lib/firebase";

const META_ID = "schoolVault";
const CHUNK_SIZE = 700_000;

export type CloudVault = {
  snapshot: AppSnapshot;
  savedAt: string;
};

function partsCollection() {
  return "sync" as const;
}

async function readPayload(partCount: number, inline: string): Promise<string> {
  if (partCount <= 1) return inline;
  const db = getFirestoreDb();
  const chunks: string[] = [];
  for (let i = 0; i < partCount; i += 1) {
    const part = await getDoc(doc(db, partsCollection(), `${META_ID}_${i}`));
    chunks.push(String(part.data()?.payload ?? ""));
  }
  return chunks.join("");
}

export async function pullCloudVault(): Promise<CloudVault | null> {
  try {
    const snap = await getDoc(doc(getFirestoreDb(), partsCollection(), META_ID));
    if (!snap.exists()) return null;
    const data = snap.data();
    const savedAt = String(data.savedAt ?? "");
    const payload = await readPayload(Number(data.partCount ?? 1), String(data.payload ?? ""));
    const parsed = JSON.parse(payload) as unknown;
    if (!isAppSnapshot(parsed) || !savedAt) return null;
    return { snapshot: parsed, savedAt };
  } catch {
    return null;
  }
}

export async function pushCloudVault(snapshot: AppSnapshot, savedAt: string): Promise<boolean> {
  try {
    const payload = JSON.stringify(snapshot);
    const parts: string[] = [];
    for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
      parts.push(payload.slice(i, i + CHUNK_SIZE));
    }
    const db = getFirestoreDb();
    const batch = writeBatch(db);
    batch.set(doc(db, partsCollection(), META_ID), {
      savedAt,
      partCount: parts.length,
      payload: parts.length === 1 ? parts[0] : "",
    });
    if (parts.length > 1) {
      parts.forEach((part, index) => {
        batch.set(doc(db, partsCollection(), `${META_ID}_${index}`), { payload: part });
      });
    }
    await batch.commit();
    return true;
  } catch {
    return false;
  }
}

export function listenCloudVault(onChange: (vault: CloudVault | null) => void): () => void {
  return onSnapshot(
    doc(getFirestoreDb(), partsCollection(), META_ID),
    () => {
      void pullCloudVault().then(onChange);
    },
    () => {
      onChange(null);
    }
  );
}

export function cloudStatusFromNetwork(ok: boolean): "synced" | "offline" | "error" {
  if (ok) return "synced";
  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  return "error";
}
