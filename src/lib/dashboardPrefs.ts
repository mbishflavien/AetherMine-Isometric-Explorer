import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStore,
} from "./storage";

export type DashboardTab = "ML_PIPELINE" | "BLOCK_LEDGER";

export const DASHBOARD_TAB_KEY = "aethermine:active-tab";

export const DASHBOARD_TABS: readonly DashboardTab[] = [
  "ML_PIPELINE",
  "BLOCK_LEDGER",
];

const DEFAULT_TAB: DashboardTab = "ML_PIPELINE";

export function isDashboardTab(value: unknown): value is DashboardTab {
  return (
    typeof value === "string" &&
    (DASHBOARD_TABS as readonly string[]).includes(value)
  );
}

export function loadDashboardTab(
  storage: KeyValueStore | null = getBrowserStorage()
): DashboardTab {
  const stored = readJson<unknown>(storage, DASHBOARD_TAB_KEY);
  return isDashboardTab(stored) ? stored : DEFAULT_TAB;
}

export function saveDashboardTab(
  tab: DashboardTab,
  storage: KeyValueStore | null = getBrowserStorage()
): void {
  writeJson(storage, DASHBOARD_TAB_KEY, tab);
}
