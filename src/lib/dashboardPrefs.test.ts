import { describe, expect, it } from "vitest";
import {
  DASHBOARD_TAB_KEY,
  DASHBOARD_TABS,
  isDashboardTab,
  loadDashboardTab,
  saveDashboardTab,
} from "./dashboardPrefs";
import type { KeyValueStore } from "./storage";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("isDashboardTab", () => {
  it("accepts only the declared tabs", () => {
    for (const tab of DASHBOARD_TABS) expect(isDashboardTab(tab)).toBe(true);
    expect(isDashboardTab("SETTINGS")).toBe(false);
    expect(isDashboardTab(null)).toBe(false);
    expect(isDashboardTab(42)).toBe(false);
  });
});

describe("loadDashboardTab", () => {
  it("restores a stored tab", () => {
    const store = memoryStore({
      [DASHBOARD_TAB_KEY]: JSON.stringify("BLOCK_LEDGER"),
    });
    expect(loadDashboardTab(store)).toBe("BLOCK_LEDGER");
  });

  it("defaults to the pipeline for missing or unknown values", () => {
    expect(loadDashboardTab(memoryStore())).toBe("ML_PIPELINE");
    expect(
      loadDashboardTab(memoryStore({ [DASHBOARD_TAB_KEY]: '"NOPE"' }))
    ).toBe("ML_PIPELINE");
    expect(
      loadDashboardTab(memoryStore({ [DASHBOARD_TAB_KEY]: "{broken" }))
    ).toBe("ML_PIPELINE");
  });
});

describe("saveDashboardTab", () => {
  it("round-trips through the store", () => {
    const store = memoryStore();
    saveDashboardTab("BLOCK_LEDGER", store);
    expect(loadDashboardTab(store)).toBe("BLOCK_LEDGER");
  });
});
