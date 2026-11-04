import { describe, expect, it } from "vitest";
import { splitMetric } from "./format";

describe("splitMetric", () => {
  it("splits a label and value on the first colon", () => {
    expect(splitMetric("Model: Sky-Ranger X5")).toEqual({
      label: "Model",
      value: "Sky-Ranger X5",
    });
  });

  it("keeps colons inside the value intact", () => {
    expect(splitMetric("Window: 400-1000nm: calibrated")).toEqual({
      label: "Window",
      value: "400-1000nm: calibrated",
    });
  });

  it("tolerates metrics without a value", () => {
    expect(splitMetric("Status")).toEqual({ label: "Status", value: "" });
    expect(splitMetric("Status:")).toEqual({ label: "Status", value: "" });
  });

  it("trims surrounding whitespace", () => {
    expect(splitMetric("  Gradient  :  4.8 degrees  ")).toEqual({
      label: "Gradient",
      value: "4.8 degrees",
    });
  });
});
