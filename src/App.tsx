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
  ArrowUpRight,
  Volume2,
  VolumeX
} from "lucide-react";
import { SensorStream, MiningBlock, LedgerRecord } from "./types";
import MiningCanvas from "./components/MiningCanvas";
import Dashboard from "./components/Dashboard";
import { audioEngine } from "./components/AudioEngine";
import { useUtcClock } from "./hooks/useUtcClock";
import {
  createInitialBlocks,
  createInitialLedgerRecords,
  createInitialStreams,
} from "./data/seed";

const DRILL_TICK_MS = 150;
const DRILL_STEP = 0.05;

export default function App() {
  const [streams, setStreams] = useState<SensorStream[]>(createInitialStreams);
  const [blocks, setBlocks] = useState<MiningBlock[]>(createInitialBlocks);

  const [selectedBlockId, setSelectedBlockId] = useState<string>("A");
  const [isDrilling, setIsDrilling] = useState<boolean>(false);
  const [drillProgress, setDrillProgress] = useState<number>(0.0);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const utcTime = useUtcClock();
  const helpDialogRef = useRef<HTMLDivElement | null>(null);
  const [isMuted, setIsMuted] = useState(audioEngine.muted);

  // Blockchain Ledger for Chain of Custody logs
  const [ledgerRecords, setLedgerRecords] = useState<LedgerRecord[]>(
    createInitialLedgerRecords
  );

  // Handle stream updates
  const handleUpdateStream = (id: string, updates: Partial<SensorStream>) => {
    setStreams((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const drillAudioRef = useRef<{ stop: () => void } | null>(null);
  const drillCompletionGuard = useRef(false);

  const stopDrillAudio = () => {
    if (drillAudioRef.current) {
      drillAudioRef.current.stop();
      drillAudioRef.current = null;
    }
  };

  // Advance the drill on a fixed cadence; the updater stays a pure function of progress.
  useEffect(() => {
    if (!isDrilling) return;
    const timerId = window.setInterval(() => {
      setDrillProgress((prevProgress) => Math.min(prevProgress + DRILL_STEP, 1));
    }, DRILL_TICK_MS);
    return () => window.clearInterval(timerId);
  }, [isDrilling]);

  // Reset the completion guard whenever a new drilling run starts.
  useEffect(() => {
    if (isDrilling) {
      drillCompletionGuard.current = false;
    } else {
      stopDrillAudio();
    }
  }, [isDrilling]);

  // Finalize a completed drill exactly once: rewrite the block status and append the ledger entry.
  useEffect(() => {
    if (!isDrilling || drillProgress < 1 || drillCompletionGuard.current) return;
    drillCompletionGuard.current = true;

    setIsDrilling(false);
    stopDrillAudio();

    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);
    if (!selectedBlock) return;

    setBlocks((prevBlocks) =>
      prevBlocks.map((b) =>
        b.id === selectedBlockId ? { ...b, drillStatus: "MAPPED" } : b
      )
    );

    const newRecord: LedgerRecord = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp:
        new Date().toISOString().replace("T", " ").substring(0, 19) + " UTC",
      blockId: `Block ${selectedBlock.id} (${selectedBlock.lithology})`,
      grade: `${selectedBlock.grade} (Coltan: ${selectedBlock.mineralEst.coltan}%, Gold: ${selectedBlock.mineralEst.gold}%)`,
      tonnage: parseFloat((80 + Math.random() * 60).toFixed(1)),
      custodyParty: `Auto-Drone Carrier #${Math.floor(10 + Math.random() * 89)}`,
      chainHash:
        "0x" +
        Array.from({ length: 40 }, () =>
          Math.floor(Math.random() * 16).toString(16)
        ).join(""),
    };

    setLedgerRecords((prev) => [newRecord, ...prev]);
    audioEngine.playTransaction();
  }, [isDrilling, drillProgress, blocks, selectedBlockId]);

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

  const closeHelpModal = () => {
    audioEngine.playClick();
    setShowHelpModal(false);
  };

  useEffect(() => audioEngine.subscribe(setIsMuted), []);

  const handleSoundToggle = () => {
    audioEngine.toggleMute();
    audioEngine.playClick();
  };

  // Allow the diagnostics overlay to be dismissed with the keyboard.
  useEffect(() => {
    if (!showHelpModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowHelpModal(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showHelpModal]);

  // Move focus into the dialog while it is open and restore it on close.
  useEffect(() => {
    if (!showHelpModal) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    helpDialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [showHelpModal]);

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
          <div className="hidden lg:flex items-center gap-2.5 bg-[#090D15] p-1.5 px-3 rounded-lg border border-slate-800">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
            </span>
            <span className="text-[10px] font-mono text-slate-300">
              ORBITAL TELEMETRY: <strong className="text-white">ONLINE</strong>
            </span>
          </div>

          <div className="text-[11px] font-mono text-slate-400 hidden sm:block bg-slate-900 border border-slate-800 p-1.5 px-2.5 rounded">
            UTC CLAMP: <span className="text-[#FFB300]">{utcTime}</span>
          </div>

          <button
            onClick={handleSoundToggle}
            aria-label={isMuted ? "Enable sound" : "Mute sound"}
            aria-pressed={!isMuted}
            title={isMuted ? "Enable sound" : "Mute sound"}
            className="p-1.5 rounded-lg border border-[#1F2937] bg-[#121825] hover:bg-[#1A253A] text-slate-400 hover:text-[#00D4FF] transition duration-150"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => { audioEngine.playClick(); setShowHelpModal(true); }}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-[#00D4FF] bg-[#121825] hover:bg-[#1A253A] border border-[#1F2937] p-1.5 px-3 rounded-lg transition duration-150"
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
            onResetLedger={() => setLedgerRecords(createInitialLedgerRecords())}
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
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowHelpModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(event) => event.stopPropagation()}
              ref={helpDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="diagnostics-title"
              tabIndex={-1}
              className="bg-[#0D121F] border border-[#00D4FF]/40 rounded-xl p-5 md:p-6 max-w-2xl w-full text-slate-300 font-sans shadow-2xl relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/70"
            >
              <button 
                onClick={closeHelpModal}
                aria-label="Close diagnostics"
                className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Info className="w-5 h-5 text-[#00D4FF]" />
                <h2 id="diagnostics-title" className="text-base font-bold text-white font-mono uppercase tracking-wider">
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
                  onClick={closeHelpModal}
                  className="bg-[#00D4FF]/15 hover:bg-[#00D4FF]/35 text-[#00D4FF] border border-[#00D4FF]/40 font-mono font-bold text-xs py-2 px-4 rounded transition duration-150"
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
