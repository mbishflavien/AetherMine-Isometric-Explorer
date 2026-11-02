import { describe, expect, it } from "vitest";
import { layers } from "./layers";
import {
  createInitialBlocks,
  createInitialLedgerRecords,
  createInitialStreams,
} from "./seed";

describe("initial streams", () => {
  const streams = createInitialStreams();

  it("uses unique ids and a known status", () => {
    expect(new Set(streams.map((stream) => stream.id)).size).toBe(streams.length);
    for (const stream of streams) {
      expect(["ACTIVE", "STANDBY", "NOISY"]).toContain(stream.status);
      expect(stream.signalStrength).toBeGreaterThanOrEqual(0);
      expect(stream.signalStrength).toBeLessThanOrEqual(100);
    }
  });
});

describe("initial blocks", () => {
  const blocks = createInitialBlocks();

  it("uses unique ids and valid grades", () => {
    expect(new Set(blocks.map((block) => block.id)).size).toBe(blocks.length);
    for (const block of blocks) {
      expect(["HIGH", "MEDIUM", "LOW", "TRACE", "EMPTY"]).toContain(block.grade);
    }
  });

  it("keeps mineral estimates within a full sample", () => {
    for (const block of blocks) {
      const { coltan, gold, rareEarths } = block.mineralEst;
      expect(coltan + gold + rareEarths).toBeLessThanOrEqual(100);
    }
  });
});

describe("initial ledger", () => {
  const records = createInitialLedgerRecords();

  it("uses unique ids and well-formed hashes", () => {
    expect(new Set(records.map((record) => record.id)).size).toBe(records.length);
    for (const record of records) {
      expect(record.chainHash).toMatch(/^0x[0-9a-f]{40}$/);
      expect(record.timestamp.endsWith("UTC")).toBe(true);
    }
  });
});

describe("layer catalogue", () => {
  it("has one entry per stratum index", () => {
    const indices = layers.map((layer) => layer.index).sort((a, b) => a - b);
    expect(indices).toEqual([0, 1, 2, 3, 4]);
    expect(new Set(layers.map((layer) => layer.id)).size).toBe(layers.length);
  });

  it("places every hotspot inside the frame with unique codes", () => {
    const hotspotIds = layers.flatMap((layer) => layer.hotspots.map((hs) => hs.id));
    expect(new Set(hotspotIds).size).toBe(hotspotIds.length);

    for (const layer of layers) {
      for (const hotspot of layer.hotspots) {
        expect(hotspot.left).toMatch(/^\d+%$/);
        expect(hotspot.top).toMatch(/^\d+%$/);
        expect(parseInt(hotspot.left, 10)).toBeLessThanOrEqual(100);
        expect(parseInt(hotspot.top, 10)).toBeLessThanOrEqual(100);
      }
    }
  });
});
