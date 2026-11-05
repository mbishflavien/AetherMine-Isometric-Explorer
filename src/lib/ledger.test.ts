import { describe, expect, it } from "vitest";
import {
  formatTonnage,
  formatUtcTimestamp,
  matchesLedgerQuery,
  nextLedgerId,
  randomChainHash,
  sortLedger,
  sumTonnage,
} from "./ledger";
import type { LedgerRecord } from "../types";

function record(id: string): LedgerRecord {
  return {
    id,
    timestamp: "2026-06-04 15:30:24 UTC",
    blockId: "Block A",
    grade: "HIGH",
    tonnage: 100,
    custodyParty: "Operator",
    chainHash: "0x0",
  };
}

describe("formatUtcTimestamp", () => {
  it("formats an ISO date as a UTC ledger stamp", () => {
    expect(formatUtcTimestamp(new Date("2026-06-04T15:30:24.987Z"))).toBe(
      "2026-06-04 15:30:24 UTC"
    );
  });

  it("always reports UTC regardless of the local timezone", () => {
    expect(formatUtcTimestamp(new Date("2026-01-01T00:00:00Z"))).toBe(
      "2026-01-01 00:00:00 UTC"
    );
  });
});

describe("randomChainHash", () => {
  it("returns a 40 character hex hash with a 0x prefix", () => {
    expect(randomChainHash()).toMatch(/^0x[0-9a-f]{40}$/);
  });

  it("does not repeat values", () => {
    expect(randomChainHash()).not.toBe(randomChainHash());
  });
});

describe("nextLedgerId", () => {
  it("returns a prefixed id that is not already in the ledger", () => {
    const existing = [record("TX-AAAAAAAA"), record("TX-BBBBBBBB")];
    const id = nextLedgerId(existing);
    expect(id).toMatch(/^TX-[0-9A-F]{8}$/);
    expect(existing.map((entry) => entry.id)).not.toContain(id);
  });

  it("works with an empty ledger", () => {
    expect(nextLedgerId([])).toMatch(/^TX-/);
  });
});

describe("sumTonnage", () => {
  it("returns zero for an empty ledger", () => {
    expect(sumTonnage([])).toBe(0);
  });

  it("adds every receipt tonnage", () => {
    expect(sumTonnage([record("TX-A"), record("TX-B")])).toBe(200);
  });

  it("rounds to a single decimal place", () => {
    const light = { ...record("TX-C"), tonnage: 0.1 };
    const lighter = { ...record("TX-D"), tonnage: 0.2 };
    expect(sumTonnage([light, lighter])).toBe(0.3);
  });
});
describe("sortLedger", () => {
  const older = { ...record("TX-OLD"), timestamp: "2026-01-02 08:00:00 UTC" };
  const newer = { ...record("TX-NEW"), timestamp: "2026-06-04 15:30:24 UTC" };
  const newest = { ...record("TX-TOP"), timestamp: "2026-11-04 12:00:00 UTC" };

  it("puts the newest receipt first by default", () => {
    expect(sortLedger([older, newest, newer]).map((r) => r.id)).toEqual([
      "TX-TOP",
      "TX-NEW",
      "TX-OLD",
    ]);
  });

  it("reverses the order when asked for the oldest first", () => {
    expect(
      sortLedger([newer, older, newest], "oldest").map((r) => r.id)
    ).toEqual(["TX-OLD", "TX-NEW", "TX-TOP"]);
  });

  it("does not mutate the input list", () => {
    const records = [older, newer];
    sortLedger(records);
    expect(records.map((r) => r.id)).toEqual(["TX-OLD", "TX-NEW"]);
  });

  it("keeps unparseable timestamps at the end", () => {
    const unknown: LedgerRecord = { ...record("TX-???"), timestamp: "pending" };
    expect(sortLedger([unknown, newer]).map((r) => r.id)).toEqual([
      "TX-NEW",
      "TX-???",
    ]);
  });
});
describe("matchesLedgerQuery", () => {
  const rec = record("TX-9042");

  it("matches everything for a blank query", () => {
    expect(matchesLedgerQuery(rec, "")).toBe(true);
    expect(matchesLedgerQuery(rec, "   ")).toBe(true);
  });

  it("matches the id, hash, and custody party case-insensitively", () => {
    expect(matchesLedgerQuery(rec, "tx-90")).toBe(true);
    expect(matchesLedgerQuery(rec, "0X0")).toBe(true);
    expect(matchesLedgerQuery(rec, "operator")).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(matchesLedgerQuery(rec, "block zeta")).toBe(false);
  });

  it("trims surrounding whitespace from the query", () => {
    expect(matchesLedgerQuery(rec, "  TX-9042  ")).toBe(true);
  });
});
describe("formatTonnage", () => {
  it("always shows one decimal place with the unit", () => {
    expect(formatTonnage(12)).toBe("12.0 t");
    expect(formatTonnage(12.44)).toBe("12.4 t");
    expect(formatTonnage(0)).toBe("0.0 t");
  });
});
