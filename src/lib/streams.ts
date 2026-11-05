import type { SensorStream } from "../types";

export function countActiveStreams(streams: SensorStream[]): number {
  return streams.filter((stream) => stream.status === "ACTIVE").length;
}

export function activeBandLabel(streams: SensorStream[]): string {
  return `${countActiveStreams(streams)}/${streams.length}`;
}
