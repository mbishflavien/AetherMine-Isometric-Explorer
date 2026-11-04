export type LensMode = "NORMAL" | "RADIOMETRIC" | "GPR_GRID" | "THERMAL";

export const LENS_MODES: readonly LensMode[] = [
  "NORMAL",
  "RADIOMETRIC",
  "GPR_GRID",
  "THERMAL",
];

const LENS_FILTER_CLASSES: Record<LensMode, string> = {
  NORMAL: "",
  RADIOMETRIC: "hue-rotate-180 brightness-110 saturate-[2]",
  GPR_GRID:
    "saturate-0 contrast-150 brightness-75 invert-10 sepia-80 hue-rotate-[90deg] saturate-[3]",
  THERMAL: "invert-0 hue-rotate-[240deg] saturate-[2.5] brightness-110",
};

export function lensFilterClass(mode: LensMode): string {
  return LENS_FILTER_CLASSES[mode];
}
