import { describe, expect, it } from "vitest";
import type { SensorStream } from "../types";
import { activeBandLabel, countActiveStreams } from "./streams";

function stream(
  status: SensorStream["status"],
  index = 0
): SensorStream {
  return {
    id: `stream-${index}`,
    name: `Band ${index}`,
    type: "Satellite",
    status,
    frequency: 12,
    signalStrength: 80,
    accuracy: 0.9,
    color: "#00D4FF",
    dataHistory: [],
  };
}

describe("countActiveStreams", () => {
  it("counts only active bands", () => {
    expect(
      countActiveStreams([stream("ACTIVE", 0), stream("STANDBY", 1), stream("NOISY", 2)])
    ).toBe(1);
  });

  it("returns zero when nothing is active", () => {
    expect(countActiveStreams([])).toBe(0);
    expect(countActiveStreams([stream("STANDBY", 0)])).toBe(0);
  });
});

describe("activeBandLabel", () => {
  it("reports active over total", () => {
    expect(activeBandLabel([stream("ACTIVE", 0), stream("STANDBY", 1)])).toBe(
      "1/2"
    );
  });

  it("handles an empty band list", () => {
    expect(activeBandLabel([])).toBe("0/0");
  });
});
