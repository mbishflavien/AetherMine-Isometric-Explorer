import { describe, expect, it } from "vitest";
import { parseUtcTimestamp, relativeTime } from "./time";

const NOW = new Date("2026-11-04T12:00:00Z");

describe("parseUtcTimestamp", () => {
  it("parses the ledger timestamp format", () => {
    const parsed = parseUtcTimestamp("2026-06-04 15:30:24 UTC");
    expect(parsed?.toISOString()).toBe("2026-06-04T15:30:24.000Z");
  });

  it("accepts an ISO separator without the UTC suffix", () => {
    const parsed = parseUtcTimestamp("2026-06-04T15:30:24");
    expect(parsed?.toISOString()).toBe("2026-06-04T15:30:24.000Z");
  });

  it("rejects anything else", () => {
    expect(parseUtcTimestamp("yesterday")).toBeNull();
    expect(parseUtcTimestamp("2026-06-04")).toBeNull();
    expect(parseUtcTimestamp("")).toBeNull();
  });
});

describe("relativeTime", () => {
  it("reports very recent receipts as just now", () => {
    expect(relativeTime("2026-11-04 11:59:40 UTC", NOW)).toBe("just now");
  });

  it("counts minutes and hours", () => {
    expect(relativeTime("2026-11-04 11:45:00 UTC", NOW)).toBe("15 min ago");
    expect(relativeTime("2026-11-04 09:00:00 UTC", NOW)).toBe("3 h ago");
  });

  it("counts whole days for older receipts", () => {
    expect(relativeTime("2026-11-01 12:00:00 UTC", NOW)).toBe("3 d ago");
  });

  it("treats a future timestamp as just now", () => {
    expect(relativeTime("2026-11-04 12:05:00 UTC", NOW)).toBe("just now");
  });

  it("passes unparseable values through unchanged", () => {
    expect(relativeTime("pending", NOW)).toBe("pending");
  });
});
