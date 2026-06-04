/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HelpCircle, 
  Map, 
  Cpu, 
  ShieldAlert, 
  Info, 
  Compass, 
  TrendingUp, 
  X,
  Radio,
  Zap,
  CheckCircle,
  Database,
  ArrowUpRight
} from "lucide-react";
import { SensorStream, MiningBlock, LedgerRecord } from "./types";
import MiningCanvas from "./components/MiningCanvas";
import Dashboard from "./components/Dashboard";
import { audioEngine } from "./components/AudioEngine";

export default function App() {
  const [streams, setStreams] = useState<SensorStream[]>([
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
  ]);

  const [blocks, setBlocks] = useState<MiningBlock[]>([
    {
      id: "A",
      depth: "2.4m - Shallow Strata",
      subsurfaceType: "SHALLOW",
      lithology: "Silicified Quartzite",
      grade: "HIGH",
      mineralEst: { coltan: 68, gold: 27, rareEarths: 5 },
      drillStatus: "UNDRILLED"
    },
    {
      id: "B",
      depth: "5.8m - Shallow Strata",
      subsurfaceType: "SHALLOW",
      lithology: "Granitic Pegmatite",
      grade: "MEDIUM",
      mineralEst: { coltan: 38, gold: 12, rareEarths: 50 },
      drillStatus: "UNDRILLED"
    },
    {
      id: "C",
      depth: "18.2m - Deep Strata",
      subsurfaceType: "DEEP",
      lithology: "Precambrian Greenstone",
      grade: "HIGH",
      mineralEst: { coltan: 84, gold: 8, rareEarths: 8 },
      drillStatus: "MAPPED"
    },
    {
      id: "D",
      depth: "36.8m - Deep Strata",
      subsurfaceType: "DEEP",
      lithology: "Banded Iron Formation",
      grade: "LOW",
      mineralEst: { coltan: 14, gold: 64, rareEarths: 22 },
      drillStatus: "EXPLORED"
    }
  ]);

  const [selectedBlockId, setSelectedBlockId] = useState<string>("A");
  const [isDrilling, setIsDrilling] = useState<boolean>(false);
  const [drillProgress, setDrillProgress] = useState<number>(0.0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Blockchain Ledger for Chain of Custody logs
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>([
    {
      id: "TX-9042",
      timestamp: "2026-06-04 15:30:24 UTC",
      blockId: "Block C (Greenstone Base)",
      grade: "HIGH (Coltan: 84%)",
      tonnage: 122.4,
      custodyParty: "Operator Beta (Haul Carrier T-700)",
      chainHash: "0xc8a164b5e2df4bb8faf15dd8a463d1dbec2f9392"
    },
    {
      id: "TX-8914",
      timestamp: "2026-06-04 11:21:05 UTC",
      blockId: "Block D (Iron Band Base)",
      grade: "LOW (Gold: 64%)",
      tonnage: 94.6,
      custodyParty: "Operator Alpha (Manned Haul T-400A)",
      chainHash: "0x3bc14ffa49a1d476fbb33d64fc5a932bc3df7c04"
    }
  ]);

  // Handle stream updates
  const handleUpdateStream = (id: string, updates: Partial<SensorStream>) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const drillAudioRef = useRef<{ stop: () => void } | null>(null);

  // Active drilling ticking interval sequence simulated inside standard browser frame cycle
  useEffect(() => {
    let timerId: any;
    if (isDrilling) {
      timerId = setInterval(() => {
        setDrillProgress((prevProgress) => {
          if (prevProgress >= 1.0) {
            clearInterval(timerId);
            setIsDrilling(false);
            
            // Stop drilling sound safely
            if (drillAudioRef.current) {
              drillAudioRef.current.stop();
              drillAudioRef.current = null;
            }

            // Create new Immutable Ledger blockchain entry upon completed physical core scanning
            const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
            if (selectedBlock) {
              // Mark Block as fully explored
              setBlocks(prevBlocks =>
                prevBlocks.map(b => b.id === selectedBlockId ? { ...b, drillStatus: "MAPPED" } : b)
              );

              // Generate fake SHA-256 hex hash
              const randomHexHash = "0x" + Array.from({ length: 40 }, () => 
                Math.floor(Math.random() * 16).toString(16)
              ).join("");

              const newRecord: LedgerRecord = {
                id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + " UTC",
                blockId: `Block ${selectedBlock.id} (${selectedBlock.lithology})`,
                grade: `${selectedBlock.grade} (Coltan: ${selectedBlock.mineralEst.coltan}%, Gold: ${selectedBlock.mineralEst.gold}%)`,
                tonnage: parseFloat((80 + Math.random() * 60).toFixed(1)),
                custodyParty: `Auto-Drone Carrier #${Math.floor(10 + Math.random() * 89)}`,
                chainHash: randomHexHash
              };

              setLedgerRecords(prev => [newRecord, ...prev]);
              audioEngine.playTransaction();
            }

            return 0.0;
          }
          return prevProgress + 0.05; // 20 steps over 3 seconds aprox
        });
      }, 150);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isDrilling, selectedBlockId, blocks]);

  const handleTriggerDrill = () => {
    if (isDrilling) return;
    
    // Play Drill sound
    const drillSound = audioEngine.startDrillSound();
    if (drillSound) {
      drillAudioRef.current = drillSound;
    } else {
      audioEngine.playLaserSweep();
    }

    setDrillProgress(0.0);
    setIsDrilling(true);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#00D4FF]/30 selection:text-white">
      
      {/* 🚀 MAIN HEADER */}
      <header className="bg-[#0D1117] border-b border-[#1F2937]/50 h-16 px-4 md:px-6 flex items-center justify-between shadow-md z-50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#00D4FF] to-[#BF00FF] flex items-center justify-center border border-[#00D4FF]/40 shadow-lg shadow-[#00D4FF]/5">
            <Compass className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold text-white tracking-widest font-mono">
              AETHERMINE <span className="text-[#00D4FF]">STRATUM-V</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
              INTEGRATED ISOMETRIC 3D GIS & PYTORCH CLASSIFIER // SECURE PROTOCOL
            </p>
          </div>
        </div>

        {/* HUD state indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2.5 bg-[#090D15] p-1.5 px-3 rounded-lg border border-slate-850">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              ORBITAL TELEMETRY: <strong className="text-white">ONLINE</strong>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block bg-slate-900 border border-slate-800 p-1.5 px-2.5 rounded">
            UTC CLAMP: <span className="text-[#FFB300]">16:45:30</span>
          </div>

          <button
            onClick={() => { audioEngine.playClick(); setShowHelpModal(true); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00D4FF] bg-[#121825] hover:bg-[#1A253A] border border-[#1F2937] p-1.5 px-3 rounded-lg transition duration-155"
          >
            <HelpCircle className="w-4 h-4" /> <span className="hidden sm:inline">Diagnostics & Specs</span>
          </button>
        </div>
      </header>

      {/* 🔮 MAIN LAYOUT GRIDS */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Interactive 3D Exploded Layer Canvas */}
        <section className="lg:col-span-6 xl:col-span-7 flex flex-col justify-between" id="canvas-panel">
          <MiningCanvas
            streams={streams}
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(id) => setSelectedBlockId(id)}
            isDrilling={isDrilling}
            activeDrillOffset={drillProgress}
            ledgersCount={ledgerRecords.length}
          />
        </section>

        {/* Right Column: AI Neural Pipeline & Secure Ledger Dashboard */}
        <section className="lg:col-span-6 xl:col-span-5 flex flex-col" id="dashboard-panel">
          <Dashboard
            streams={streams}
            onUpdateStream={handleUpdateStream}
            blocks={blocks}
            selectedBlockId={selectedBlockId}
            onSelectBlock={(id) => setSelectedBlockId(id)}
            isDrilling={isDrilling}
            onTriggerDrill={handleTriggerDrill}
            drillProgress={drillProgress}
            ledgerRecords={ledgerRecords}
            onAddLedgerRecord={(rec) => setLedgerRecords(prev => [rec, ...prev])}
          />
        </section>

      </main>

      {/* 🚀 SUB-SURFACE CONTEXTUAL GLOSSARY FOOTER */}
      <footer className="bg-[#090D15] border-t border-[#1F2937]/50 h-14 shrink-0 flex items-center justify-between px-6 text-[10px] font-mono text-slate-500">
        <div>
          SEC_KEY: <strong className="text-slate-400">AES_GCM_256</strong> │ STATUS: <span className="text-[#39FF14]">FUSED</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-slate-500">
          <span>COOPERATIVE AGENTS: PYTORCH OCR v2.10</span>
          <span>•</span>
          <span>CRYPTO RECEIPTS SHIELDED</span>
        </div>
        <div>
          DESIGNS FOR FLUID REALISM © 2026 AETHERMINE CO.
        </div>
      </footer>

      {/* 🚀 DIAGNOSTICS & SYSTEM MANUAL MODAL */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D121F] border border-[#00D4FF]/40 rounded-xl p-5 md:p-6 max-w-2xl w-full text-slate-300 font-sans shadow-2xl relative"
            >
              <button 
                onClick={() => { audioEngine.playClick(); setShowHelpModal(false); }}
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Info className="w-5 h-5 text-[#00D4FF]" />
                <h2 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Stratum-V Deep-Tech Diagnostic Manual
                </h2>
              </div>

              <div className="space-y-4 text-xs md:text-sm leading-relaxed">
                <p>
                  Welcome to the control center of **AetherMine Stratum-V**, a next-generation autonomous mining and geophysics telemetry integration hub. Inspired by tactical GIS systems, modern sci-fi interfaces and clean blockchain tracking, this app models a deep-tech exploratory site.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                  <div className="p-3 bg-slate-950/75 rounded-lg border border-slate-800">
                    <h3 className="font-bold text-white font-mono text-xs mb-1.5 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-[#39FF14]" /> Multi-Sensor GIS
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Toggle exploration slices from the lower left bar. Use the range slider on the right to manually explode the geology columns inside the interactive 3D layer-cake representation dynamically.
                    </p>
                  </div>

                  <div className="p-3 bg-slate-950/75 rounded-lg border border-slate-800">
                    <h3 className="font-bold text-white font-mono text-xs mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#FFB300]" /> PyTorch ML Classifier
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Simulates active telemetry routing. Enable, disable, or calibrate the signal density sliders of the 5 spectra bands. The neural pipeline automatically recalculates confidence coefficients in real-time.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-xs font-mono text-[#BF00FF] uppercase mb-1">
                    Excavation Protocol & Ledger
                  </h3>
                  <p className="text-xs text-slate-400 leading-normal">
                    Select a block on the active plate, then click "**Engage Excavation Protocol**". The laser core drill shoots particles from the drone core down, resolving complex geological layers. Upon success, a digital block receipt with SHA-256 validation is appended to the Immutable Chain-of-Custody ledger tab.
                  </p>
                </div>

                <div className="bg-[#122A21] border border-[#39FF14]/30 p-2 text-[11px] font-mono rounded text-[#A7F3D0] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-ping" />
                  Telemetry verified. Fully active localized browser synthesizers ready for sonar pulses.
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => { audioEngine.playClick(); setShowHelpModal(false); }}
                  className="bg-[#00D4FF]/15 hover:bg-[#00D4FF]/35 text-[#00D4FF] border border-[#00D4FF]/40 font-mono font-bold text-xs py-2 px-4 rounded transition duration-155"
                >
                  Confirm Diagnostics & Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      </div>
    );
  }
