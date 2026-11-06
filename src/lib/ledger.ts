import type { LedgerRecord } from "../types";
import { parseUtcTimestamp } from "./time";

const HASH_PREFIX = "0x";
const HASH_LENGTH = 40;
const MAX_ID_ATTEMPTS = 100;

function randomHex(length: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
      .join("")
      .slice(0, length);
  }
  return Array.from({ length }, () => Math.floor(Math.random() * 16).toString(16)).join("");
}

export function randomChainHash(): string {
  return HASH_PREFIX + randomHex(HASH_LENGTH);
}

export function formatUtcTimestamp(date: Date): string {
  return date.toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export function nextLedgerId(existing: LedgerRecord[]): string {
  const taken = new Set(existing.map((record) => record.id));
  for (let attempt = 0; attempt < MAX_ID_ATTEMPTS; attempt += 1) {
    const id = `TX-${randomHex(8).toUpperCase()}`;
    if (!taken.has(id)) return id;
  }
  return `TX-${Date.now().toString(36).toUpperCase()}`;
}

export function sumTonnage(records: LedgerRecord[]): number {
  const total = records.reduce((sum, record) => sum + record.tonnage, 0);
  return Math.round(total * 10) / 10;
}

export type LedgerSortOrder = "newest" | "oldest";

export function sortLedger(
  records: LedgerRecord[],
  order: LedgerSortOrder = "newest"
): LedgerRecord[] {
  const timestampOf = (record: LedgerRecord) =>
    parseUtcTimestamp(record.timestamp)?.getTime() ?? 0;
  const sorted = [...records].sort((a, b) => timestampOf(b) - timestampOf(a));
  return order === "newest" ? sorted : sorted.reverse();
}

export function matchesLedgerQuery(
  record: LedgerRecord,
  query: string
): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    record.id.toLowerCase().includes(needle) ||
    record.blockId.toLowerCase().includes(needle) ||
    record.grade.toLowerCase().includes(needle) ||
    record.chainHash.toLowerCase().includes(needle) ||
    record.custodyParty.toLowerCase().includes(needle)
  );
}

export function formatTonnage(tons: number): string {
  return `${tons.toFixed(1)} t`;
}

export function averageTonnage(records: LedgerRecord[]): number {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + record.tonnage, 0);
  return Math.round((total / records.length) * 10) / 10;
}

