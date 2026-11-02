import { describe, expect, it } from "vitest";
import {
  DRILL_MAX_DEPTH_METERS,
  DRILL_STEP,
  advanceDrill,
  drillDepthMeters,
  formatDrillPercent,
} from "./drill";

describe("advanceDrill", () => {
  it("adds one step to the current progress", () => {
    expect(advanceDrill(0)).toBeCloseTo(DRILL_STEP);
    expect(advanceDrill(0.4)).toBeCloseTo(0.45);
  });

  it("never goes past complete", () => {
    expect(advanceDrill(0.98)).toBe(1);
    expect(advanceDrill(1)).toBe(1);
  });

  it("does not undershoot on repeated ticks", () => {
    let progress = 0;
    for (let tick = 0; tick < 100; tick += 1) progress = advanceDrill(progress);
    expect(progress).toBe(1);
  });
});

describe("drillDepthMeters", () => {
  it("maps progress onto the configured maximum depth", () => {
    expect(drillDepthMeters(0)).toBe(0);
    expect(drillDepthMeters(0.5)).toBe(DRILL_MAX_DEPTH_METERS / 2);
    expect(drillDepthMeters(1)).toBe(DRILL_MAX_DEPTH_METERS);
  });
});

describe("formatDrillPercent", () => {
  it("rounds to whole percentages", () => {
    expect(formatDrillPercent(0)).toBe("0%");
    expect(formatDrillPercent(0.126)).toBe("13%");
    expect(formatDrillPercent(1)).toBe("100%");
  });
});
