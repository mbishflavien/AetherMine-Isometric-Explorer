import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStore,
} from "./storage";
import type { LedgerSortOrder } from "./ledger";

export type LedgerGradeFilter = "ALL" | "HIGH" | "MEDIUM" | "LOW";

export const LEDGER_GRADE_KEY = "aethermine:ledger-grade";

export const LEDGER_GRADE_FILTERS: readonly LedgerGradeFilter[] = [
  "ALL",
  "HIGH",
  "MEDIUM",
  "LOW",
];

const DEFAULT_GRADE: LedgerGradeFilter = "ALL";

export function isLedgerGradeFilter(
  value: unknown
): value is LedgerGradeFilter {
  return (
    typeof value === "string" &&
    (LEDGER_GRADE_FILTERS as readonly string[]).includes(value)
  );
}

export function loadLedgerGradeFilter(
  storage: KeyValueStore | null = getBrowserStorage()
): LedgerGradeFilter {
  const stored = readJson<unknown>(storage, LEDGER_GRADE_KEY);
  return isLedgerGradeFilter(stored) ? stored : DEFAULT_GRADE;
}

export function saveLedgerGradeFilter(
  filter: LedgerGradeFilter,
  storage: KeyValueStore | null = getBrowserStorage()
): void {
  writeJson(storage, LEDGER_GRADE_KEY, filter);
}
export const LEDGER_SORT_KEY = "aethermine:ledger-sort";

export const LEDGER_SORT_ORDERS: readonly LedgerSortOrder[] = [
  "newest",
  "oldest",
];

const DEFAULT_SORT: LedgerSortOrder = "newest";

export function isLedgerSortOrder(value: unknown): value is LedgerSortOrder {
  return (
    typeof value === "string" &&
    (LEDGER_SORT_ORDERS as readonly string[]).includes(value)
  );
}

export function loadLedgerSortOrder(
  storage: KeyValueStore | null = getBrowserStorage()
): LedgerSortOrder {
  const stored = readJson<unknown>(storage, LEDGER_SORT_KEY);
  return isLedgerSortOrder(stored) ? stored : DEFAULT_SORT;
}

export function saveLedgerSortOrder(
  order: LedgerSortOrder,
  storage: KeyValueStore | null = getBrowserStorage()
): void {
  writeJson(storage, LEDGER_SORT_KEY, order);
}
