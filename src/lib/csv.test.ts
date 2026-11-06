import { describe, expect, it } from "vitest";
import type { LedgerRecord } from "../types";
import { LEDGER_CSV_COLUMNS, buildLedgerCsv, ledgerCsvFilename } from "./csv";

function record(overrides: Partial<LedgerRecord> = {}): LedgerRecord {
  return {
    id: "TX-1",
    timestamp: "2026-11-04 12:00:00 UTC",
    blockId: "Block A",
    grade: "HIGH",
    tonnage: 12.5,
    custodyParty: "Kananga Assay Office",
    chainHash: "0xabc123",
    ...overrides,
  };
}

describe("buildLedgerCsv", () => {
  it("writes the header even when there are no receipts", () => {
    expect(buildLedgerCsv([])).toBe(LEDGER_CSV_COLUMNS.join(","));
  });

  it("writes one row per receipt in column order", () => {
    const csv = buildLedgerCsv([record()]);
    const [, row] = csv.split("\n");
    expect(row).toBe(
      "TX-1,2026-11-04 12:00:00 UTC,Block A,HIGH,12.5,Kananga Assay Office,0xabc123"
    );
  });

  it("quotes cells containing commas, quotes, or newlines", () => {
    const csv = buildLedgerCsv([
      record({ blockId: "Block A, North", custodyParty: 'Say "hi"' }),
    ]);
    const [, row] = csv.split("\n");
    expect(row).toContain('"Block A, North"');
    expect(row).toContain('"Say ""hi"""');
  });

  it("neutralises cells that spreadsheets would execute as formulas", () => {
    const csv = buildLedgerCsv([
      record({ blockId: "=HYPERLINK(\"https://example.test\")" }),
      record({ id: "TX-2", custodyParty: "+1 555 0100" }),
      record({ id: "TX-3", custodyParty: "@SUM(A1:A9)" }),
    ]);
    const [, first, second, third] = csv.split("\n");
    expect(first).toContain(`"'=HYPERLINK(""https://example.test"")"`);
    expect(second).toContain("'+1 555 0100");
    expect(third).toContain("'@SUM(A1:A9)");
  });

  it("keeps the row count in step with the receipt list", () => {
    const csv = buildLedgerCsv([record(), record({ id: "TX-2" })]);
    expect(csv.split("\n")).toHaveLength(3);
  });
});

describe("ledgerCsvFilename", () => {
  it("stamps the UTC date", () => {
    expect(ledgerCsvFilename(new Date("2026-11-04T23:30:00Z"))).toBe(
      "aethermine-ledger-2026-11-04.csv"
    );
  });
});
