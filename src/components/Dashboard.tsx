/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Cpu,
  Play,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  X,
  Download,
} from "lucide-react";
import { SensorStream, MiningBlock, LedgerRecord } from "../types";
import { sumTonnage } from "../lib/ledger";
import {
  loadDashboardTab,
  saveDashboardTab,
  type DashboardTab,
} from "../lib/dashboardPrefs";
import { audioEngine } from "./AudioEngine";
import StreamIcon from "./StreamIcon";
import {
  computeConfidenceScore,
  gradeForConfidence,
  gradeMatchesFilter,
} from "../lib/geology";
import { drillDepthMeters, formatDrillPercent } from "../lib/drill";
import { relativeTime } from "../lib/time";
import { buildLedgerCsv, ledgerCsvFilename } from "../lib/csv";
import { copyText } from "../lib/clipboard";
import {
  isLedgerGradeFilter,
  loadLedgerGradeFilter,
  saveLedgerGradeFilter,
  type LedgerGradeFilter,
} from "../lib/ledgerPrefs";

interface DashboardProps {
  streams: SensorStream[];
  onUpdateStream: (id: string, updates: Partial<SensorStream>) => void;
  blocks: MiningBlock[];
  selectedBlockId: string;
  onSelectBlock: (id: string) => void;
  isDrilling: boolean;
  onTriggerDrill: () => void;
  drillProgress: number;
  ledgerRecords: LedgerRecord[];
  onAddLedgerRecord: (record: LedgerRecord) => void;
  onResetLedger: () => void;
}

export default function Dashboard({
  streams,
  onUpdateStream,
  blocks,
  selectedBlockId,
  onSelectBlock,
  isDrilling,
  onTriggerDrill,
  drillProgress,
  ledgerRecords,
  onAddLedgerRecord,
  onResetLedger,
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>(loadDashboardTab);
  const [searchText, setSearchText] = useState("");
  const [filterGrade, setFilterGrade] = useState<LedgerGradeFilter>(loadLedgerGradeFilter);
  const [learningRate, setLearningRate] = useState(0.005);
  const [epochsCount, setEpochsCount] = useState(150);
  const [weightsStatus, setWeightsStatus] = useState("STABLE");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Remember which half of the console the operator was last using.
  useEffect(() => {
    saveDashboardTab(activeTab);
  }, [activeTab]);

  // Live pipeline metrics derived from the active sensor bands
  const activeCount = streams.filter((s) => s.status === "ACTIVE").length;
  const confidenceScore = computeConfidenceScore(streams);
  const mineralGrade = gradeForConfidence(confidenceScore);

  // Get active block stats
  const activeBlock = blocks.find((b) => b.id === selectedBlockId);

  // Continuous micro weight variance simulation to look like live machine learning epochs
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setWeightsStatus(Math.random() > 0.9 ? "OPTIMIZING" : "STABLE");
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleStreamToggle = (id: string, currentStatus: "ACTIVE" | "STANDBY" | "NOISY") => {
    audioEngine.playClick();
    const nextStatus = currentStatus === "ACTIVE" ? "STANDBY" : "ACTIVE";
    onUpdateStream(id, { status: nextStatus });
  };

  const handleStrengthChange = (id: string, val: number) => {
    onUpdateStream(id, { signalStrength: val });
  };


  // Filter ledger records
  const filteredLedgers = useMemo(() => {
    return ledgerRecords.filter((rec) => {
      const matchesSearch =
        rec.id.toLowerCase().includes(searchText.toLowerCase()) ||
        rec.chainHash.toLowerCase().includes(searchText.toLowerCase()) ||
        rec.custodyParty.toLowerCase().includes(searchText.toLowerCase());
      const matchesGrade = gradeMatchesFilter(rec.grade, filterGrade);
      return matchesSearch && matchesGrade;
    });
  }, [ledgerRecords, searchText, filterGrade]);

  const totalTonnage = useMemo(() => sumTonnage(ledgerRecords), [ledgerRecords]);

  const handleCopyHash = async (hash: string) => {
    audioEngine.playClick();
    const copied = await copyText(hash);
    if (!copied) return;
    setCopiedHash(hash);
    window.setTimeout(() => {
      setCopiedHash((current) => (current === hash ? null : current));
    }, 2000);
  };

  const handleExportCsv = () => {
    audioEngine.playClick();
    const blob = new Blob([buildLedgerCsv(filteredLedgers)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = ledgerCsvFilename();
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full flex flex-col bg-[#0D1117] border border-[#1F2937]/50 rounded-xl overflow-hidden shadow-2xl h-full min-h-[580px]">
      
      {/* Control Room / LEDGER tabs bar */}
      <div className="flex bg-[#0A0D14] border-b border-[#1F2937]/40 h-12 shrink-0 items-center justify-between px-3">
        <div className="flex gap-2" role="tablist" aria-label="Dashboard views">
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab("ML_PIPELINE"); }}
            role="tab"
            id="ml-pipeline-tab"
            aria-selected={activeTab === "ML_PIPELINE"}
            aria-controls="ml-pipeline-panel"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition duration-150 flex items-center gap-2 ${
              activeTab === "ML_PIPELINE" 
                ? "bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" /> NEURAL ML CORE
          </button>
          
          <button
            onClick={() => { audioEngine.playClick(); setActiveTab("BLOCK_LEDGER"); }}
            role="tab"
            id="block-ledger-tab"
            aria-selected={activeTab === "BLOCK_LEDGER"}
            aria-controls="block-ledger-panel"
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-wider transition duration-150 flex items-center gap-2 ${
              activeTab === "BLOCK_LEDGER" 
                ? "bg-[#5DDB50]/15 text-[#39FF14] border border-[#39FF14]/30" 
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> CHAIN OF CUSTODY LEDGER
          </button>
        </div>

        <div className="text-[10px] font-mono text-slate-500 hidden md:block">
          EPOCH CLOCK: <span className="text-[#FFB300] font-bold">L-8932</span>
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "ML_PIPELINE" ? (
            <motion.div
              key="pipeline"
              role="tabpanel"
              id="ml-pipeline-panel"
              aria-labelledby="ml-pipeline-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 xl:grid-cols-12 gap-5"
            >
              {/* Left Column: 5 Multi-spectral Stream controllers */}
              <div className="xl:col-span-7 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h3 className="text-xs font-mono font-bold tracking-widest text-[#00D4FF] uppercase flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Sensor Stream Configurator
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                    Active Streams: {activeCount}/5
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {streams.map((stream) => {
                    const isActive = stream.status === "ACTIVE";
                    return (
                      <div
                        key={stream.id}
                        className={`p-3 rounded-lg border transition duration-200 flex flex-col gap-2 ${
                          isActive 
                            ? "bg-[#111A2E]/50 border-[#00D4FF]/35" 
                            : "bg-[#090D15]/40 border-slate-800/70 opacity-60"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded bg-slate-900 border border-slate-700">
                              <StreamIcon type={stream.type} />
                            </span>
                            <div>
                              <div className="text-xs font-bold text-white leading-tight">
                                {stream.name}
                              </div>
                              <div className="text-[9px] font-mono text-slate-400">
                                TYPE: {stream.type}  │  FREQ: {stream.frequency} GHz
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              isActive 
                                ? "bg-[#39FF14]/10 text-[#39FF14]" 
                                : "bg-slate-950 text-slate-500"
                            }`}>
                              {stream.status}
                            </span>
                            <button
                              onClick={() => handleStreamToggle(stream.id, stream.status)}
                              aria-pressed={isActive}
                              className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded transition duration-150 ${
                                isActive 
                                  ? "bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#FF5A5A]" 
                                  : "bg-[#00D4FF]/15 hover:bg-[#00D4FF]/25 text-[#00D4FF]"
                              }`}
                            >
                              {isActive ? "STANDBY" : "ENGAGE"}
                            </button>
                          </div>
                        </div>

                        {isActive && (
                          <div className="flex items-center gap-4 text-[10px] font-mono mt-1 pt-1.5 border-t border-slate-800/40">
                            <span className="text-slate-400 shrink-0">Signal Density:</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={stream.signalStrength}
                              onChange={(e) => handleStrengthChange(stream.id, parseInt(e.target.value))}
                              aria-label={`Signal density for ${stream.name}`}
                              aria-valuetext={`${stream.signalStrength} percent`}
                              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                            />
                            <span className="text-[#00D4FF] font-bold w-12 text-right">
                              {stream.signalStrength}%
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simulated Neural Layer properties */}
                <div className="p-3 bg-slate-900/40 border border-slate-800 rounded-lg flex flex-wrap gap-x-5 gap-y-2 mt-1">
                  <div className="text-[10px] font-mono text-slate-400">
                    PyTorch LR: <span className="text-white">{learningRate}</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Classification Loss: <span className="text-[#39FF14]">0.024 RMS</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Model Weights: <span className="text-[#FFB300] font-semibold">{weightsStatus}</span>
                  </div>
                  <div className="text-[10px] font-mono text-[#00D4FF] text-right ml-auto">
                    Epoch Count: {epochsCount}
                  </div>
                </div>
              </div>

              {/* Right Column: Server Convergence, Metrics & Execution Console */}
              <div className="xl:col-span-5 flex flex-col gap-4">
                
                {/* Visual convergence display - 5 fibers merging into PyTorch */}
                <div className="p-4 bg-[#0A0D14]/80 border border-[#1F2937]/50 rounded-xl relative overflow-hidden flex flex-col items-center">
                  <div className="absolute top-2 left-2 text-[8px] font-mono text-slate-500 uppercase tracking-widest leading-none">
                    Data Convergence Hub
                  </div>
                  
                  {/* Streaming Lines visualization */}
                  <div className="h-20 w-full flex items-center justify-between px-6 relative mt-1">
                    {/* Fiber connectors left side */}
                    <div className="flex flex-col gap-1.5 shrink-0">
                      {streams.map((s) => (
                        <div key={s.id} className="h-2 w-2 rounded-full" style={{ backgroundColor: s.status === "ACTIVE" ? s.color : "#4B5563" }} />
                      ))}
                    </div>

                    {/* Server image representing torch classifier */}
                    <div className="relative h-14 w-14 bg-gradient-to-br from-[#121825] to-[#1E293B] hover:to-[#2A3B58] transition-colors rounded-xl border border-dashed border-[#00D4FF] flex flex-col items-center justify-center shadow-lg cursor-pointer">
                      <Cpu className="w-6 h-6 text-[#00D4FF] animate-pulse" />
                      <div className="text-[7px] font-mono text-slate-400 mt-1 uppercase font-bold text-center">PYTORCH CLS</div>
                      
                      {/* Convergence particle circles */}
                      <span className="absolute w-20 h-20 border border-[#00D4FF]/30 rounded-full animate-ping pointer-events-none" style={{ animationDuration: "3s" }} />
                    </div>

                    {/* Glowing Stream vectors routing to server */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                      {streams.map((s, idx) => {
                        const active = s.status === "ACTIVE";
                        return (
                          <line
                            key={s.id}
                            x1="32"
                            y1={15 + idx * 12}
                            x2="155"
                            y2="40"
                            stroke={active ? s.color : "#374151"}
                            strokeWidth={active ? 1.5 : 0.5}
                            strokeDasharray={active ? "4 3" : ""}
                            className={active ? "animate-pulse" : ""}
                            opacity={active ? 0.8 : 0.25}
                          />
                        );
                      })}
                    </svg>

                    <div className="text-[9px] font-mono text-[#39FF14] animate-pulse shrink-0 bg-slate-900 border border-[#39FF14]/30 px-1.5 py-0.5 rounded font-semibold self-center">
                      ⚡ REAL_TIME_PASS
                    </div>
                  </div>

                  <div className="text-[10px] font-mono text-center text-slate-400 border-t border-slate-800/70 w-full pt-2">
                    Server Core Label: <strong className="text-white">"Core ML Pipeline │ PyTorch Classifier"</strong>
                  </div>
                </div>

                {/* Dashboard Metrics Output Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  
                  {/* Confidence Score Panel */}
                  <div className="p-4 bg-slate-900/45 border border-slate-800 rounded-xl relative overflow-hidden">
                    <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-1">
                      CONFIDENCE SCORE
                    </div>
                    <div className="text-3xl font-mono font-bold text-[#39FF14] tracking-tight">
                      {confidenceScore}%
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      {confidenceScore > 80 
                        ? "Predictive mapping resolved with premium certainty." 
                        : "Low telemetry. Consider activating more stream bands."}
                    </p>
                    <div className="absolute right-3 top-3">
                      <ShieldCheck className="w-4 h-4 text-[#39FF14] opacity-50" />
                    </div>
                  </div>

                  {/* Mineral Grade Panel */}
                  <div className="p-4 bg-slate-900/45 border border-slate-800 rounded-xl relative overflow-hidden">
                    <div className="text-[9px] font-mono text-slate-400 tracking-wider uppercase mb-1">
                      MINERAL GRADE EST.
                    </div>
                    <div className="text-3xl font-mono font-bold text-[#FFB300] tracking-tight">
                      {mineralGrade}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 leading-tight">
                      Target block coltan-tantalum ratio estimated as extremely viable.
                    </p>
                    <div className="absolute right-3 top-3">
                      <TrendingUp className="w-4 h-4 text-[#FFB300] opacity-50" />
                    </div>
                  </div>

                </div>

                {/* Next Execution Target Selector and Drill Panel */}
                <div className="p-4 bg-[#111622] border border-[#FFB300]/30 rounded-xl flex flex-col gap-3">
                  
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div>
                      <div className="text-[9px] font-mono font-bold text-[#FFB300] tracking-wider uppercase">
                        NEXT EXECUTION PLAN
                      </div>
                      <div className="text-xs font-bold text-white mt-0.5">
                        Optimized Target: <span className="text-[#FFB300]">Block {selectedBlockId}</span>
                      </div>
                    </div>
                    
                    {/* Tiny Target Status */}
                    <div className="text-right">
                      <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded text-amber-300">
                        EST_STRATA_GPR_V2
                      </span>
                    </div>
                  </div>

                  {/* Block quick selection buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {blocks.map((b) => {
                      const isSel = b.id === selectedBlockId;
                      return (
                        <button
                          key={b.id}
                          onClick={() => {
                            audioEngine.playClick();
                            onSelectBlock(b.id);
                          }}
                          className={`py-1.5 rounded text-xs font-mono font-semibold tracking-wide border transition duration-150 ${
                            isSel 
                              ? "bg-[#FFB300]/20 text-[#FFB300] border-[#FFB300]" 
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                          }`}
                        >
                          BLK {b.id}
                        </button>
                      );
                    })}
                  </div>

                  {/* Block Metadata HUD details */}
                  {activeBlock && (
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-900 mt-0.5">
                      <div>Lithology: <span className="text-white font-semibold">{activeBlock.lithology}</span></div>
                      <div>Depth: <span className="text-[#39FF14]">{activeBlock.depth}</span></div>
                      <div>Gold: <span className="text-[#FFB300] font-semibold">{activeBlock.mineralEst.gold}%</span></div>
                      <div>Coltan: <span className="text-[#00D4FF] font-semibold">{activeBlock.mineralEst.coltan}%</span></div>
                    </div>
                  )}

                  {/* Drilling Excitation Control */}
                  <div className="mt-1">
                    {isDrilling ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] font-mono text-[#FF3D00] font-bold">
                          <span>DRILL PROBING SEQUENCE ACTIVE...</span>
                          <span>{formatDrillPercent(drillProgress)}</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                          <motion.div
                            className="bg-gradient-to-r from-[#FF3D00] to-[#FFBF00] h-full"
                            animate={{ width: `${drillProgress * 100}%` }}
                            transition={{ ease: "linear" }}
                          />
                        </div>
                        <p className="text-[9px] text-[#FF5A5A] font-mono">
                          Transmitting core telemetry from {drillDepthMeters(drillProgress).toFixed(1)}m subsurface to PyTorch Classifier.
                        </p>
                      </div>
                    ) : (
                      <button
                        onClick={onTriggerDrill}
                        disabled={isDrilling}
                        className="w-full py-3 rounded-lg bg-gradient-to-r from-[#FF8F00] to-[#FF3D00] hover:from-[#FFA000] hover:to-[#FF5722] text-white font-mono font-bold tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
                      >
                        <Play className="w-4 h-4" /> ENGAGE EXCAVATION PROTOCOL
                      </button>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          ) : (
            <motion.div
              key="ledger"
              role="tabpanel"
              id="block-ledger-panel"
              aria-labelledby="block-ledger-tab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex flex-col gap-4 h-full"
            >
              {/* Blockchain Header and description */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-mono font-bold tracking-wider text-[#39FF14] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" /> Immutable Chain-of-Custody Log
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verified digital block cryptographic signatures validating mineral grade, physical tonnage, and transfer history. Every excavation is timestamped and recorded.
                  </p>
                </div>
                
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={handleExportCsv}
                    disabled={filteredLedgers.length === 0}
                    className="text-[10px] font-mono text-[#39FF14] hover:underline flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded border border-slate-800 disabled:opacity-40 disabled:no-underline"
                  >
                    <Download className="w-3" /> Export CSV
                  </button>

                  {/* Reset button to clear ledger back to genesis */}
                  <button
                    onClick={() => {
                      audioEngine.playSonarPing();
                      setSearchText("");
                      setFilterGrade("ALL");
                      onResetLedger();
                    }}
                    className="text-[10px] font-mono text-[#00D4FF] hover:underline flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded border border-slate-800"
                  >
                    <RefreshCw className="w-3" /> Reload Genesis State
                  </button>
                </div>
              </div>

              {/* Filters & Search Row */}
              <div className="flex flex-col sm:flex-row gap-3 bg-slate-900/40 p-3 rounded-lg border border-slate-800">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by block ID, hash signature, or custody party..."
                    aria-label="Search ledger records"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00D4FF]"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs text-slate-400">Grade:</span>
                  <select
                    value={filterGrade}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isLedgerGradeFilter(value)) setFilterGrade(value);
                    }}
                    aria-label="Filter ledger by grade"
                    className="bg-slate-950 border border-slate-800 text-xs text-white rounded-md py-1.5 px-3 focus:outline-none"
                  >
                    <option value="ALL">All Grades</option>
                    <option value="HIGH">High Grade</option>
                    <option value="MEDIUM">Medium Grade</option>
                    <option value="LOW">Low Grade</option>
                  </select>
                </div>

                {(searchText || filterGrade !== "ALL") && (
                  <button
                    onClick={() => {
                      audioEngine.playClick();
                      setSearchText("");
                      setFilterGrade("ALL");
                    }}
                    className="text-[10px] font-mono text-[#00D4FF] hover:underline flex items-center gap-1 px-2 shrink-0"
                  >
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>

              <p className="sr-only" role="status" aria-live="polite">
                {ledgerRecords[0]
                  ? `Newest receipt ${ledgerRecords[0].id} for ${ledgerRecords[0].blockId}.`
                  : "No receipts recorded yet."}
              </p>

              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span role="status" aria-live="polite">
                  Showing {filteredLedgers.length} of {ledgerRecords.length} receipts
                </span>
                <span>FILTER: {filterGrade} │ QUERY: {searchText ? searchText : "none"}</span>
              </div>

              {/* Ledger list */}
              <div className="flex-1 overflow-y-auto max-h-[340px] pr-1 flex flex-col gap-2.5">
                {filteredLedgers.length > 0 ? (
                  filteredLedgers.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 bg-[#0A0D14] border border-slate-800 hover:border-slate-700/80 rounded-lg transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-slate-900 border border-[#39FF14]/30 text-[#39FF14] px-1.5 py-0.5 rounded font-mono font-semibold">
                            BLOCK #{rec.id}
                          </span>
                          <span className="text-xs text-white font-bold font-mono">
                            Target Resource Block: {rec.blockId}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-[#FFB300]" /> {rec.timestamp}
                          <span className="text-slate-600">({relativeTime(rec.timestamp)})</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <div className="text-[9px] font-mono text-slate-500">GRADE RATING:</div>
                          <div className={`font-bold font-mono ${
                            rec.grade === "HIGH" ? "text-[#39FF14]" : "text-[#FFB300]"
                          }`}>
                            {rec.grade}
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-mono text-slate-500">EXTRACTED TONNAGE:</div>
                          <div className="text-slate-200 font-mono font-semibold">
                            {rec.tonnage} Metric Tons
                          </div>
                        </div>

                        <div>
                          <div className="text-[9px] font-mono text-slate-500">AUDITOR PARTY:</div>
                          <div className="text-slate-300 font-mono">
                            {rec.custodyParty}
                          </div>
                        </div>

                        <div className="col-span-1">
                          <div className="flex items-center justify-between gap-1">
                            <div className="text-[9px] font-mono text-slate-500">CRYPTOGRAPHIC SIGNATURE:</div>
                            <button
                              onClick={() => void handleCopyHash(rec.chainHash)}
                              aria-label={`Copy the hash for ${rec.id}`}
                              className="text-[9px] font-mono text-[#00D4FF] hover:underline shrink-0"
                            >
                              {copiedHash === rec.chainHash ? "Copied" : "Copy"}
                            </button>
                          </div>
                          <div className="text-[9px] text-[#00D4FF] font-mono break-all leading-tight bg-slate-950 p-1 border border-slate-900 rounded">
                            {rec.chainHash}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500 flex flex-col items-center justify-center gap-2 bg-[#0A0D14]/30 rounded-lg border border-dashed border-slate-800">
                    <AlertCircle className="w-6 h-6 text-slate-600" />
                    <span className="text-xs font-mono">No matching verified ledger logs found in local database.</span>
                  </div>
                )}
              </div>

              {/* Total volume ledger indicator */}
              <div className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-500">
                <div>HASH CODE REGISTER CONTEXT: <strong className="text-slate-400">ROOT_CHAIN_PUB_PROD</strong></div>
                <div>TOTAL HAULED: <strong className="text-[#39FF14]">{totalTonnage.toFixed(1)} t</strong></div>
                <div>SEC_SYSTEM: <span className="text-[#39FF14]">SSL_HASH_OK</span></div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
