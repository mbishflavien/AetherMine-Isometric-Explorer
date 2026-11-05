import { describe, expect, it } from "vitest";
import type { KeyValueStore } from "./storage";
import {
  LEDGER_GRADE_FILTERS,
  LEDGER_GRADE_KEY,
  isLedgerGradeFilter,
  loadLedgerGradeFilter,
  saveLedgerGradeFilter,
} from "./ledgerPrefs";

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

describe("isLedgerGradeFilter", () => {
  it("accepts only the declared grades", () => {
    for (const grade of LEDGER_GRADE_FILTERS) {
      expect(isLedgerGradeFilter(grade)).toBe(true);
    }
    expect(isLedgerGradeFilter("TRACE")).toBe(false);
    expect(isLedgerGradeFilter(undefined)).toBe(false);
    expect(isLedgerGradeFilter(7)).toBe(false);
  });
});

describe("loadLedgerGradeFilter", () => {
  it("restores a stored grade", () => {
    const store = memoryStore({
      [LEDGER_GRADE_KEY]: JSON.stringify("MEDIUM"),
    });
    expect(loadLedgerGradeFilter(store)).toBe("MEDIUM");
  });

  it("defaults to all grades for missing or unknown values", () => {
    expect(loadLedgerGradeFilter(memoryStore())).toBe("ALL");
    expect(
      loadLedgerGradeFilter(memoryStore({ [LEDGER_GRADE_KEY]: '"TRACE"' }))
    ).toBe("ALL");
    expect(
      loadLedgerGradeFilter(memoryStore({ [LEDGER_GRADE_KEY]: "{oops" }))
    ).toBe("ALL");
  });
});

describe("saveLedgerGradeFilter", () => {
  it("round-trips through the store", () => {
    const store = memoryStore();
    saveLedgerGradeFilter("HIGH", store);
    expect(loadLedgerGradeFilter(store)).toBe("HIGH");
  });
});
