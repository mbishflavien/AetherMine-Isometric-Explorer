/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SensorStream {
  id: string;
  name: string;
  type: "Satellite" | "Hyperspectral" | "Gamma-Ray" | "GPR" | "EM-Mag";
  status: "ACTIVE" | "STANDBY" | "NOISY";
  frequency: number; // in GHz or MHz
  signalStrength: number; // 0 - 100
  accuracy: number; // 0.0 - 1.0
  color: string;
  dataHistory: number[];
}

export interface MiningBlock {
  id: string;
  depth: string;
  subsurfaceType: "SHALLOW" | "DEEP";
  lithology: string;
  grade: "HIGH" | "MEDIUM" | "LOW" | "TRACE" | "EMPTY";
  mineralEst: {
    coltan: number; // %
    gold: number; // %
    rareEarths: number; // %
  };
  drillStatus: "UNDRILLED" | "EXPLORED" | "DRILLING" | "MAPPED";
}

export interface LedgerRecord {
  id: string;
  timestamp: string;
  blockId: string;
  grade: string;
  chainHash: string;
  tonnage: number;
  custodyParty: string;
}

export interface LayerMetadata {
  id: string;
  title: string;
  depthLabel: string;
  specs: string[];
  visualHighlights: string[];
  active: boolean;
}
