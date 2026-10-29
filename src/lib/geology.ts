import type { MiningBlock, SensorStream } from "../types";

export type MineralGrade = MiningBlock["grade"];

export function computeConfidenceScore(streams: SensorStream[]): number {
  const active = streams.filter((stream) => stream.status === "ACTIVE");
  const base = active.length * 18;
  const averageStrength =
    active.reduce((total, stream) => total + stream.signalStrength, 0) /
    (active.length || 1);
  return Math.min(Math.max(Math.round(base + averageStrength * 0.1), 12), 99);
}

export function gradeForConfidence(score: number): MineralGrade {
  if (score > 85) return "HIGH";
  if (score > 60) return "MEDIUM";
  if (score > 35) return "LOW";
  if (score > 15) return "TRACE";
  return "EMPTY";
}

export function gradeMatchesFilter(grade: string, filter: string): boolean {
  return filter === "ALL" || grade.startsWith(filter);
}
