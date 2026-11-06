import type { LedgerRecord } from "../types";

export const LEDGER_CSV_COLUMNS = [
  "id",
  "timestamp",
  "blockId",
  "grade",
  "tonnage",
  "custodyParty",
  "chainHash",
] as const;

function escapeCell(value: string): string {
  const guarded = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(guarded)
    ? `"${guarded.replace(/"/g, '""')}"`
    : guarded;
}

export function buildLedgerCsv(records: LedgerRecord[]): string {
  const rows = records.map((record) =>
    [
      record.id,
      record.timestamp,
      record.blockId,
      record.grade,
      String(record.tonnage),
      record.custodyParty,
      record.chainHash,
    ]
      .map(escapeCell)
      .join(",")
  );
  return [LEDGER_CSV_COLUMNS.join(","), ...rows].join("\n");
}

export function ledgerCsvFilename(now: Date = new Date()): string {
  return `aethermine-ledger-${now.toISOString().slice(0, 10)}.csv`;
}
