export const DRILL_TICK_MS = 150;
export const DRILL_STEP = 0.05;
export const DRILL_MAX_DEPTH_METERS = 50;

export function advanceDrill(progress: number): number {
  return Math.min(progress + DRILL_STEP, 1);
}

export function drillDepthMeters(progress: number): number {
  return progress * DRILL_MAX_DEPTH_METERS;
}

export function formatDrillPercent(progress: number): string {
  return `${(progress * 100).toFixed(0)}%`;
}
