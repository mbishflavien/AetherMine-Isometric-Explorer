import { describe, expect, it } from "vitest";
import {
  formatUtcTimestamp,
  nextLedgerId,
  randomChainHash,
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
