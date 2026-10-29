import { describe, expect, it } from "vitest";
import {
  computeConfidenceScore,
  gradeForConfidence,
  gradeMatchesFilter,
} from "./geology";
import type { SensorStream } from "../types";

function stream(overrides: Partial<SensorStream> = {}): SensorStream {
  return {
    id: "s",
    name: "Stream",
    type: "GPR",
    status: "ACTIVE",
    frequency: 1,
    signalStrength: 50,
    accuracy: 0.9,
    color: "#00D4FF",
    dataHistory: [],
    ...overrides,
  };
}

describe("computeConfidenceScore", () => {
  it("floors the score at 12 when no streams are active", () => {
    expect(computeConfidenceScore([])).toBe(12);
    expect(computeConfidenceScore([stream({ status: "STANDBY" })])).toBe(12);
  });

  it("caps the score at 99", () => {
    const streams = Array.from({ length: 5 }, (_, index) =>
      stream({ id: `s${index}`, signalStrength: 100 })
    );
    expect(computeConfidenceScore(streams)).toBe(99);
  });

  it("ignores inactive streams when averaging signal strength", () => {
    const active = stream({ signalStrength: 80 });
    const inactive = stream({ id: "off", status: "NOISY", signalStrength: 0 });
    expect(computeConfidenceScore([active])).toBe(computeConfidenceScore([active, inactive]));
  });

  it("scales with the number of active bands", () => {
    const one = computeConfidenceScore([stream()]);
    const three = computeConfidenceScore([
      stream({ id: "a" }),
      stream({ id: "b" }),
      stream({ id: "c" }),
    ]);
    expect(three).toBeGreaterThan(one);
  });
});

describe("gradeForConfidence", () => {
  it.each([
    [99, "HIGH"],
    [86, "HIGH"],
    [85, "MEDIUM"],
    [61, "MEDIUM"],
    [60, "LOW"],
    [36, "LOW"],
    [35, "TRACE"],
    [16, "TRACE"],
    [15, "EMPTY"],
    [0, "EMPTY"],
  ])("maps %i to %s", (score, expected) => {
    expect(gradeForConfidence(score)).toBe(expected);
  });
});

describe("gradeMatchesFilter", () => {
  it("matches every record when the filter is ALL", () => {
    expect(gradeMatchesFilter("TRACE (Gold: 2%)", "ALL")).toBe(true);
  });

  it("matches a prefixed grade label", () => {
    expect(gradeMatchesFilter("HIGH (Coltan: 84%)", "HIGH")).toBe(true);
    expect(gradeMatchesFilter("HIGH (Coltan: 84%)", "MEDIUM")).toBe(false);
  });

  it("does not match a bare grade with no metrics", () => {
    expect(gradeMatchesFilter("HIGH", "HIGH")).toBe(true);
  });
});
