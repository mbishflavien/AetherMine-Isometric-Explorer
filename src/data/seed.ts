import type { LedgerRecord, MiningBlock, SensorStream } from "../types";

export function createInitialStreams(): SensorStream[] {
  return [
    {
      id: "sat",
      name: "Satellite LiDAR Terrain Ortho-Mesh",
      type: "Satellite",
      status: "ACTIVE",
      frequency: 1.42, // GHz
      signalStrength: 85,
      accuracy: 0.88,
      color: "#00D4FF",
      dataHistory: [40, 50, 48, 52, 60, 55, 62],
    },
    {
      id: "hyper",
      name: "Airborne SWIR Hyperspectral Camera",
      type: "Hyperspectral",
      status: "ACTIVE",
      frequency: 443.0, // THz
      signalStrength: 92,
      accuracy: 0.94,
      color: "#FFB300",
      dataHistory: [80, 85, 90, 88, 92, 94, 92],
    },
    {
      id: "gamma",
      name: "Crystalline Thallium Gamma-Ray Sensor",
      type: "Gamma-Ray",
      status: "ACTIVE",
      frequency: 18.4, // GHz
      signalStrength: 78,
      accuracy: 0.84,
      color: "#BF00FF",
      dataHistory: [60, 62, 59, 65, 70, 68, 74],
    },
    {
      id: "gpr",
      name: "High-Frequency dual 400MHz GPR Cart",
      type: "GPR",
      status: "ACTIVE",
      frequency: 0.4, // GHz
      signalStrength: 95,
      accuracy: 0.96,
      color: "#39FF14",
      dataHistory: [90, 92, 91, 95, 95, 96, 95],
    },
    {
      id: "em",
      name: "Transient Electromagnetic Magnetometer",
      type: "EM-Mag",
      status: "ACTIVE",
      frequency: 0.05, // GHz
      signalStrength: 72,
      accuracy: 0.82,
      color: "#FF3D00",
      dataHistory: [50, 55, 60, 58, 62, 66, 70],
    },
  ];
}

export function createInitialBlocks(): MiningBlock[] {
  return [
    {
      id: "A",
      depth: "2.4m - Shallow Strata",
      subsurfaceType: "SHALLOW",
      lithology: "Silicified Quartzite",
      grade: "HIGH",
      mineralEst: { coltan: 68, gold: 27, rareEarths: 5 },
      drillStatus: "UNDRILLED",
    },
    {
      id: "B",
      depth: "5.8m - Shallow Strata",
      subsurfaceType: "SHALLOW",
      lithology: "Granitic Pegmatite",
      grade: "MEDIUM",
      mineralEst: { coltan: 38, gold: 12, rareEarths: 50 },
      drillStatus: "UNDRILLED",
    },
    {
      id: "C",
      depth: "18.2m - Deep Strata",
      subsurfaceType: "DEEP",
      lithology: "Precambrian Greenstone",
      grade: "HIGH",
      mineralEst: { coltan: 84, gold: 8, rareEarths: 8 },
      drillStatus: "MAPPED",
    },
    {
      id: "D",
      depth: "36.8m - Deep Strata",
      subsurfaceType: "DEEP",
      lithology: "Banded Iron Formation",
      grade: "LOW",
      mineralEst: { coltan: 14, gold: 64, rareEarths: 22 },
      drillStatus: "EXPLORED",
    },
  ];
}

export function createInitialLedgerRecords(): LedgerRecord[] {
  return [
    {
      id: "TX-9042",
      timestamp: "2026-06-04 15:30:24 UTC",
      blockId: "Block C (Greenstone Base)",
      grade: "HIGH (Coltan: 84%)",
      tonnage: 122.4,
      custodyParty: "Operator Beta (Haul Carrier T-700)",
      chainHash: "0xc8a164b5e2df4bb8faf15dd8a463d1dbec2f9392",
    },
    {
      id: "TX-8914",
      timestamp: "2026-06-04 11:21:05 UTC",
      blockId: "Block D (Iron Band Base)",
      grade: "LOW (Gold: 64%)",
      tonnage: 94.6,
      custodyParty: "Operator Alpha (Manned Haul T-400A)",
      chainHash: "0x3bc14ffa49a1d476fbb33d64fc5a932bc3df7c04",
    },
  ];
}
