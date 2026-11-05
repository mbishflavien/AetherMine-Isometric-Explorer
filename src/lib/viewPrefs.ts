import {
  getBrowserStorage,
  readJson,
  writeJson,
  type KeyValueStore,
} from "./storage";
import { LENS_MODES, type LensMode } from "./lens";

export interface ViewPreferences {
  explosionFactor: number;
  pitch: number;
  yaw: number;
  isOrbiting: boolean;
  lens: LensMode;
}

export const VIEW_PREFERENCES_KEY = "aethermine:view-prefs";

export const EXPLODE_RANGE = { min: 0.3, max: 2.1 } as const;
export const PITCH_RANGE = { min: 20, max: 85 } as const;
export const YAW_RANGE = { min: -180, max: 180 } as const;

export const DEFAULT_VIEW_PREFERENCES: ViewPreferences = {
  explosionFactor: 1.2,
  pitch: 60,
  yaw: -45,
  isOrbiting: true,
  lens: "NORMAL",
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function isLensMode(value: unknown): value is LensMode {
  return (
    typeof value === "string" &&
    (LENS_MODES as readonly string[]).includes(value)
  );
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function normalizeViewPreferences(
  input: unknown,
  fallback: ViewPreferences = DEFAULT_VIEW_PREFERENCES
): ViewPreferences {
  const source =
    typeof input === "object" && input !== null
      ? (input as Partial<ViewPreferences>)
      : {};

  return {
    explosionFactor: isFiniteNumber(source.explosionFactor)
      ? clamp(source.explosionFactor, EXPLODE_RANGE.min, EXPLODE_RANGE.max)
      : fallback.explosionFactor,
    pitch: isFiniteNumber(source.pitch)
      ? clamp(source.pitch, PITCH_RANGE.min, PITCH_RANGE.max)
      : fallback.pitch,
    yaw: isFiniteNumber(source.yaw)
      ? clamp(source.yaw, YAW_RANGE.min, YAW_RANGE.max)
      : fallback.yaw,
    isOrbiting:
      typeof source.isOrbiting === "boolean"
        ? source.isOrbiting
        : fallback.isOrbiting,
    lens: isLensMode(source.lens) ? source.lens : fallback.lens,
  };
}

export function loadViewPreferences(
  storage: KeyValueStore | null = getBrowserStorage(),
  fallback?: ViewPreferences
): ViewPreferences {
  return normalizeViewPreferences(
    readJson<unknown>(storage, VIEW_PREFERENCES_KEY),
    fallback
  );
}

export function saveViewPreferences(
  preferences: ViewPreferences,
  storage: KeyValueStore | null = getBrowserStorage()
): void {
  writeJson(storage, VIEW_PREFERENCES_KEY, normalizeViewPreferences(preferences));
}
