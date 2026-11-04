import { describe, expect, it } from "vitest";
import { LENS_MODES, lensFilterClass } from "./lens";

describe("LENS_MODES", () => {
  it("offers normal plus three analytical lenses", () => {
    expect(LENS_MODES).toEqual([
      "NORMAL",
      "RADIOMETRIC",
      "GPR_GRID",
      "THERMAL",
    ]);
    expect(new Set(LENS_MODES).size).toBe(LENS_MODES.length);
  });
});

describe("lensFilterClass", () => {
  it("leaves the image untouched in normal mode", () => {
    expect(lensFilterClass("NORMAL")).toBe("");
  });

  it("returns a distinct filter chain for every analytical lens", () => {
    const filters = LENS_MODES.filter((mode) => mode !== "NORMAL").map(
      lensFilterClass
    );

    for (const filter of filters) {
      expect(filter.length).toBeGreaterThan(0);
    }
    expect(new Set(filters).size).toBe(filters.length);
  });
});
