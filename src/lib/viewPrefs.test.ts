import { describe, expect, it } from "vitest";
import type { KeyValueStore } from "./storage";
import {
  DEFAULT_VIEW_PREFERENCES,
  EXPLODE_RANGE,
  PITCH_RANGE,
  VIEW_PREFERENCES_KEY,
  YAW_RANGE,
  loadViewPreferences,
  normalizeViewPreferences,
  saveViewPreferences,
} from "./viewPrefs";

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Record<string, string>;
} {
  const data = { ...initial };
  return {
    data,
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("normalizeViewPreferences", () => {
  it("returns the defaults for unusable input", () => {
    expect(normalizeViewPreferences(null)).toEqual(DEFAULT_VIEW_PREFERENCES);
    expect(normalizeViewPreferences("nope")).toEqual(DEFAULT_VIEW_PREFERENCES);
    expect(normalizeViewPreferences({})).toEqual(DEFAULT_VIEW_PREFERENCES);
  });

  it("clamps values into the supported camera ranges", () => {
    const prefs = normalizeViewPreferences({
      explosionFactor: 99,
      pitch: -40,
      yaw: 900,
      isOrbiting: true,
    });

    expect(prefs.explosionFactor).toBe(EXPLODE_RANGE.max);
    expect(prefs.pitch).toBe(PITCH_RANGE.min);
    expect(prefs.yaw).toBe(YAW_RANGE.max);
    expect(prefs.isOrbiting).toBe(true);
  });

  it("ignores non-numeric fields but keeps the valid ones", () => {
    const prefs = normalizeViewPreferences({
      explosionFactor: 1.8,
      pitch: "steep",
      yaw: null,
      isOrbiting: "yes",
    });

    expect(prefs.explosionFactor).toBe(1.8);
    expect(prefs.pitch).toBe(DEFAULT_VIEW_PREFERENCES.pitch);
    expect(prefs.yaw).toBe(DEFAULT_VIEW_PREFERENCES.yaw);
    expect(prefs.isOrbiting).toBe(DEFAULT_VIEW_PREFERENCES.isOrbiting);
  });

  it("honours a caller-supplied fallback", () => {
    const fallback = { ...DEFAULT_VIEW_PREFERENCES, isOrbiting: false };
    expect(normalizeViewPreferences(undefined, fallback)).toEqual(fallback);
  });
});

describe("loadViewPreferences", () => {
  it("reads and normalizes a stored snapshot", () => {
    const store = memoryStore({
      [VIEW_PREFERENCES_KEY]: JSON.stringify({
        explosionFactor: 2.0,
        pitch: 45,
        yaw: 90,
        isOrbiting: false,
      }),
    });

    expect(loadViewPreferences(store)).toEqual({
      explosionFactor: 2.0,
      pitch: 45,
      yaw: 90,
      isOrbiting: false,
      lens: "NORMAL",
    });
  });

  it("falls back when nothing is stored", () => {
    expect(loadViewPreferences(memoryStore())).toEqual(
      DEFAULT_VIEW_PREFERENCES
    );
  });
});

describe("saveViewPreferences", () => {
  it("round-trips through the store", () => {
    const store = memoryStore();
    saveViewPreferences(
      {
        explosionFactor: 1.5,
        pitch: 70,
        yaw: -90,
        isOrbiting: false,
        lens: "NORMAL",
      },
      store
    );
    expect(loadViewPreferences(store)).toEqual({
      explosionFactor: 1.5,
      pitch: 70,
      yaw: -90,
      isOrbiting: false,
      lens: "NORMAL",
    });
  });

  it("clamps values before writing them", () => {
    const store = memoryStore();
    saveViewPreferences(
      {
        explosionFactor: 99,
        pitch: 0,
        yaw: 1000,
        isOrbiting: true,
        lens: "NORMAL",
      },
      store
    );
    const stored = JSON.parse(store.data[VIEW_PREFERENCES_KEY]);
    expect(stored.explosionFactor).toBe(EXPLODE_RANGE.max);
    expect(stored.pitch).toBe(PITCH_RANGE.min);
    expect(stored.yaw).toBe(YAW_RANGE.max);
  });
});
describe("view preference lens", () => {
  it("restores a known lens", () => {
    const prefs = normalizeViewPreferences({ lens: "THERMAL" });
    expect(prefs.lens).toBe("THERMAL");
  });

  it("falls back for an unknown lens", () => {
    const prefs = normalizeViewPreferences({ lens: "X-RAY" });
    expect(prefs.lens).toBe("NORMAL");
  });

  it("round-trips the lens through the store", () => {
    const store = memoryStore();
    saveViewPreferences(
      { ...DEFAULT_VIEW_PREFERENCES, lens: "GPR_GRID" },
      store
    );
    expect(loadViewPreferences(store).lens).toBe("GPR_GRID");
  });
});
