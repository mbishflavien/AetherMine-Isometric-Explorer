/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MiningCanvas.tsx
 * High-tech interactive 3D Exploded Layer Stack visualizing a futuristic deep-tech mine site.
 * Utilizes high-fidelity generated images for realistic visual representation.
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Volume2,
  VolumeX,
  Layers,
  Sliders,
  Info,
  RefreshCw,
  Focus,
} from "lucide-react";
import { SensorStream, MiningBlock } from "../types";
import { layers, type Hotspot } from "../data/layers";
import {
  DEFAULT_VIEW_PREFERENCES,
  loadViewPreferences,
  saveViewPreferences,
} from "../lib/viewPrefs";
import { audioEngine } from "./AudioEngine";

interface MiningCanvasProps {
  streams: SensorStream[];
  blocks: MiningBlock[];
  selectedBlockId: string;
  onSelectBlock: (id: string) => void;
  isDrilling: boolean;
  activeDrillOffset: number; // 0 to 1
  ledgersCount: number;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


export default function MiningCanvas({
  streams,
  blocks,
  selectedBlockId,
  onSelectBlock,
  isDrilling,
  activeDrillOffset,
  ledgersCount,
}: MiningCanvasProps) {
  const [initialView] = useState(() =>
    loadViewPreferences(undefined, {
      ...DEFAULT_VIEW_PREFERENCES,
      isOrbiting: !prefersReducedMotion(),
    })
  );

  // 3D Controls
  const [explosionFactor, setExplosionFactor] = useState<number>(
    initialView.explosionFactor
  );
  const [pitch, setPitch] = useState<number>(initialView.pitch);
  const [yaw, setYaw] = useState<number>(initialView.yaw);
  const [roll, setRoll] = useState<number>(0); // -180 to 180
  const [isOrbiting, setIsOrbiting] = useState<boolean>(
    initialView.isOrbiting
  );
  const [isMuted, setIsMuted] = useState<boolean>(audioEngine.muted);
  
  // Tab/Focus settings
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null); // null = stacked, otherwise single-view active
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [activeLens, setActiveLens] = useState<"NORMAL" | "RADIOMETRIC" | "GPR_GRID" | "THERMAL">("NORMAL");


  // Auto-Orbit controller effect
  useEffect(() => {
    if (!isOrbiting || activeLayerId) return;

    const ORBIT_TICK_MS = 30;
    const ORBIT_STEP_DEG = 0.15;
    let frameId = 0;
    let lastTick = performance.now();

    const step = (now: number) => {
      if (now - lastTick >= ORBIT_TICK_MS) {
        lastTick = now;
        setYaw((prev) => {
          let next = prev + ORBIT_STEP_DEG;
          if (next > 180) next -= 360;
          return next;
        });
      }
      frameId = window.requestAnimationFrame(step);
    };

    frameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frameId);
  }, [isOrbiting, activeLayerId]);

  // Persist the camera once it settles; continuous orbiting would write on every frame.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      saveViewPreferences({ explosionFactor, pitch, yaw, isOrbiting });
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [explosionFactor, pitch, yaw, isOrbiting]);

  // Keep the local mute indicator in sync with every other audio control.
  useEffect(() => audioEngine.subscribe(setIsMuted), []);

  const handleMuteToggle = () => {
    audioEngine.toggleMute();
    audioEngine.playClick();
  };

  const handleSelectLayer = (id: string | null) => {
    audioEngine.playSonarPing();
    setActiveLayerId(id);
    setSelectedHotspot(null); // reset hotspot when layer swaps
  };

  const handleHotspotSelect = (e: React.MouseEvent, hs: Hotspot) => {
    e.stopPropagation();
    audioEngine.playLaserSweep();
    setSelectedHotspot(hs);
  };

  const lastSliderClickRef = useRef(0);
  const playSliderClick = () => {
    const now = performance.now();
    if (now - lastSliderClickRef.current < 120) return;
    lastSliderClickRef.current = now;
    audioEngine.playClick();
  };

  // Get active selected layer metadata
  const currentLayer = layers.find((l) => l.id === activeLayerId);

  // Determine standard colors for cosmetic overlays based on selected activeLens
  const getLensColorFilter = () => {
    switch(activeLens) {
      case "RADIOMETRIC": return "hue-rotate-180 brightness-110 saturate-[2]";
      case "GPR_GRID": return "saturate-0 contrast-150 brightness-75 invert-10 sepia-80 hue-rotate-[90deg] saturate-[3]";
      case "THERMAL": return "invert-0 hue-rotate-[240deg] saturate-[2.5] brightness-110";
      default: return "";
    }
  };

  return (
    <div id="interactive-mining-canvas" className="relative w-full h-[620px] md:h-[720px] bg-[#080B11] border border-[#1F2937]/50 rounded-xl overflow-hidden shadow-2xl flex flex-col font-sans select-none">
      
      {/* 🚀 SCREEN HUD HEADER BLOCK */}
      <div className="absolute top-0 left-0 right-0 h-12 bg-[#0D121F]/90 backdrop-blur-md border-b border-[#1F2937]/50 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-[#00D4FF] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-widest text-[#ECEFF4] flex items-center gap-2">
            AETHERMINE // MULTI-SPECTRAL 3D COLUMN INTERFACES
          </span>
        </div>

        {/* System parameters, reload presets, and Sound Toggles */}
        <div className="flex items-center gap-4">
          
          <button
            onClick={() => {
              audioEngine.playSonarPing();
              setExplosionFactor(1.2);
              setPitch(60);
              setYaw(-45);
              setIsOrbiting(true);
              setActiveLayerId(null);
              setSelectedHotspot(null);
              setActiveLens("NORMAL");
            }}
            className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white hover:border-slate-700 transition flex items-center gap-1.5"
            aria-label="Reset the 3D view to its default settings"
            title="Reset Illustration View to Default Settings"
          >
            <RefreshCw className="w-3 h-3" /> Reset View
          </button>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded leading-none hidden sm:block">
            LEDGERS AUTH: <span className="text-[#39FF14] font-bold">{ledgersCount} CERT</span>
          </span>

          <button
            onClick={handleMuteToggle}
            aria-label={isMuted ? "Enable sound" : "Mute sound"}
            aria-pressed={!isMuted}
            className={`p-1.5 rounded transition ${
              isMuted ? "text-slate-500 hover:text-slate-300" : "text-[#00D4FF] bg-[#00D4FF]/10 border border-[#00D4FF]/25"
            }`}
            title={isMuted ? "Unmute Audio Loop Feedback" : "Mute Audio Feed"}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 🔮 MAIN LAYOUT SPLITTER */}
      <div className="flex-1 w-full relative flex flex-col lg:flex-row pt-12 text-slate-200 overflow-hidden">
        
        {/* LEFT COMPONENT COLUMN: THE 3D DECKS GRID */}
        <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
          
          {/* Cosmic Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
          
          {/* Dynamic Laser Drill Piercing animation when Drilling */}
          {isDrilling && (
            <div 
              style={{
                left: "50%",
                transform: "translateX(-50%)",
                width: "4px"
              }}
              className="absolute top-0 bottom-0 z-40 pointer-events-none"
            >
              {/* Outer Beam Glow */}
              <div className="absolute inset-0 bg-[#FFB300] blur-[4px] opacity-75" />
              {/* Core Solid Laser */}
              <div className="absolute inset-x-px top-0 bottom-0 bg-white" />
              {/* Drill particles spray at bottom */}
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 h-8 w-8 rounded-full border-4 border-dashed border-[#39FF14] animate-spin" />
              
              {/* Driller Status Text overlay */}
              <div className="absolute top-[40%] right-4 bg-slate-950/90 border border-[#FF3D00] text-[#FF3D00] font-mono text-[9px] font-bold px-2 py-1 rounded-md tracking-wider">
                CORE DRILL SCANNING SUBSURFACE BLOCK {selectedBlockId}...
              </div>
            </div>
          )}

          {/* Render the 5 Layers inside the interactive Perspective Deck */}
          {!activeLayerId ? (
            <div 
              className="relative w-[360px] h-[360px] md:w-[460px] md:h-[460px] cursor-grab active:cursor-grabbing flex items-center justify-center transition-all duration-300"
              style={{
                perspective: "1200px"
              }}
            >
              {/* Actual 3D Container Stack mapped by Pitch, Yaw, and Roll variables */}
              <div
                className="relative w-[280px] h-[190px] md:w-[320px] md:h-[210px] transition-transform duration-75"
                style={{
                  transform: `rotateX(${pitch}deg) rotateY(${roll}deg) rotateZ(${yaw}deg)`,
                  transformStyle: "preserve-3d"
                }}
              >
                {/* Visual Inter-layer electromagnetic scanner beam projection when normal */}
                <div
                  className="animate-scanner-beam absolute inset-x-0 bg-gradient-to-t from-[#00D4FF]/0 via-[#00D4FF]/12 to-[#BF00FF]/0 border-y border-[#00D4FF]/30 pointer-events-none"
                  style={{
                    height: "100%",
                    transform: "translateZ(100px)",
                    transformStyle: "preserve-3d"
                  }}
                />

                {/* Stacking actual individual layers inside the Exploded Layer-cake columns */}
                {layers.slice().reverse().map((layer) => {
                  const zTranslate = layer.index * explosionFactor * 52;
                  
                  return (
                    <button
                      type="button"
                      key={layer.id}
                      onClick={() => handleSelectLayer(layer.id)}
                      aria-label={`Focus layer ${layer.id}: ${layer.title}`}
                      className="absolute inset-0 bg-slate-900/60 rounded-lg border border-slate-700/60 hover:border-[#00D4FF]/80 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-[#00D4FF]/10 cursor-pointer transition-all duration-300 group text-left"
                      style={{
                        transform: `translateZ(${zTranslate}px)`,
                        transformStyle: "preserve-3d",
                        backfaceVisibility: "visible"
                      }}
                    >
                      {/* Image render representing the realistic mine cross-section strata */}
                      <div className="absolute inset-1 rounded bg-[#0b0c10] overflow-hidden">
                        <img
                          src={layer.imageUrl}
                          alt={layer.title}
                          loading="lazy"
                          decoding="async"
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition duration-300 pointer-events-none ${getLensColorFilter()} ${
                            isDrilling ? "contrast-115 grayscale-[15%]" : ""
                          }`}
                        />
                        {/* Shading overlay based on deck position */}
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition duration-200" />
                        
                        {/* Dynamic Sweep Grid Laser Bar Overlay */}
                        <div className="animate-scan-sweep absolute inset-x-0 h-0.5 bg-[#39FF14] shadow-md shadow-[#39FF14]" />
                      </div>

                      {/* Small Neon Border and text callouts */}
                      <div className="absolute bottom-2 left-2.5 z-20 bg-slate-950/95 p-1.5 px-2.5 rounded border border-slate-800 flex items-center gap-1.5 font-mono text-[9px] text-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                        <span className="font-bold text-white uppercase">{layer.id}</span> │ {layer.depthLabel}
                      </div>

                      {/* Sparkle corner decorations */}
                      <span className="absolute top-1 left-1 block h-1 w-1 bg-[#00D4FF] rounded-full opacity-60" />
                      <span className="absolute bottom-1 right-1 block h-1 w-1 bg-[#BF00FF] rounded-full opacity-60" />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            
            // INDIVIDUAL ACTIVE FOCUS ZOOMED LAYER VIEW WITH PINS
            <div className="relative w-full max-w-[560px] aspect-[16/10] bg-[#0B0D13] border border-slate-700 rounded-lg p-1.5 shadow-2xl overflow-hidden flex flex-col justify-between">
              
              {/* Lens overlay, metadata labels, and visual grid triggers */}
              <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
                <span className="p-1 rounded bg-[#0D121F] border border-slate-800 text-[10px] font-mono text-[#00D4FF] font-semibold">
                  FOCUS ZOOM // LAYER_{currentLayer?.id.toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentLayer?.depthLabel}
                </span>
              </div>

              {/* Lens Selection HUD Toggle */}
              <div className="absolute top-3 right-4 z-20 flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-md border border-slate-800/80">
                <span className="text-[8px] font-mono text-slate-500 mr-1.5 px-1 font-bold">LENS:</span>
                {(["NORMAL", "RADIOMETRIC", "GPR_GRID", "THERMAL"] as const).map((lns) => (
                  <button
                    key={lns}
                    onClick={() => { audioEngine.playClick(); setActiveLens(lns); }}
                    aria-pressed={activeLens === lns}
                    className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded transition ${
                      activeLens === lns 
                        ? "bg-[#00D4FF]/15 text-[#00D4FF] border border-[#00D4FF]/30" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {lns}
                  </button>
                ))}
              </div>

              {/* Center zoom image container */}
              <div className="relative flex-1 rounded overflow-hidden bg-slate-950">
                <img
                  src={currentLayer?.imageUrl}
                  alt={currentLayer?.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all duration-300 ${getLensColorFilter()}`}
                />

                {/* Grid Scan sweep bar overlay */}
                <div className="animate-scan-sweep absolute inset-x-0 h-[2px] bg-sky-400 shadow-md shadow-sky-500" />

                {/* Subsurface drill location crosshairs if zoomed layer is shallow/surface */}
                {(currentLayer?.id === "shallow" || currentLayer?.id === "surface") && (
                  <div 
                    className="absolute left-[64%] top-[30%] pointer-events-none flex flex-col items-center justify-center"
                  >
                    <div className="h-5 w-5 rounded-full border border-dashed border-[#FFB300] animate-spin" />
                    <span className="text-[8px] font-mono text-[#FFB300] bg-slate-950 px-1 rounded mt-0.5 border border-slate-800">
                      DRILL_TARGET
                    </span>
                  </div>
                )}

                {/* Render Interactive pulsating hotspot pins overlaid directly on target coordinates */}
                {currentLayer?.hotspots.map((hs) => {
                  const isSel = selectedHotspot?.id === hs.id;
                  return (
                    <button
                      key={hs.id}
                      onClick={(e) => handleHotspotSelect(e, hs)}
                      style={{
                        left: hs.left,
                        top: hs.top
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
                      title={`Click parameters for: ${hs.name}`}
                      aria-label={`Inspect ${hs.name}`}
                    >
                      {/* Pulse rings */}
                      <span className="absolute inline-flex h-8 w-8 -left-2.5 -top-2.5 rounded-full bg-[#00D4FF]/20 animate-ping" />
                      <span className="relative flex h-3 w-3 items-center justify-center">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          isSel ? "bg-[#39FF14]" : "bg-[#00D4FF]"
                        }`}></span>
                        <span className={`relative inline-flex rounded-full h-2 w-2 ${
                          isSel ? "bg-[#39FF14]" : "bg-white border border-[#00D4FF]"
                        }`}></span>
                      </span>

                      {/* Pulse hover tags */}
                      <div className="absolute left-1/2 -translate-x-1/2 top-4 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition whitespace-nowrap bg-slate-950 border border-slate-800 p-1 px-2 rounded text-[9px] font-mono text-white pointer-events-none">
                        + Inspect: {hs.name}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Close zooming/focus pane slider control */}
              <div className="bg-[#0D121F] border-t border-slate-800 px-3 py-2 flex items-center justify-between font-mono text-[10px]">
                <div className="text-slate-400">
                  Click pins on illustration to display specific metrics.
                </div>
                <button
                  onClick={() => handleSelectLayer(null)}
                  className="bg-slate-900 hover:bg-slate-800 p-1 px-3 border border-slate-700 text-white rounded font-bold uppercase transition"
                >
                  ← Return to 3D Stack View
                </button>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT CONTROL PANEL COLUMN: DIAGNOSTIC DATA & SPECS */}
        <div className="w-full lg:w-72 xl:w-80 shrink-0 bg-[#0B0F19]/95 border-t lg:border-t-0 lg:border-l border-[#1F2937]/50 flex flex-col p-4 overflow-y-auto">
          
          {/* Main Selection Details Section */}
          <div className="flex-1 space-y-4">
            
            <div className="border-b border-slate-800 pb-2.5">
              <span className="text-[10px] font-mono text-[#FFB300] tracking-wider uppercase font-bold flex items-center gap-1.5 mb-1">
                <Sliders className="w-3.5 h-3.5" /> 3D Controller Unit
              </span>
              <h2 className="text-xs font-mono font-bold text-white tracking-widest uppercase">
                CALIBRATE GIS SYSTEM
              </h2>
            </div>

            {/* If Stack View or Zooms, adapt sliders and values */}
            {!activeLayerId ? (
              <div className="space-y-3.5 bg-slate-950/70 p-3 rounded-lg border border-slate-800/80">
                
                {/* 1. Explode Column Slide */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">3D Explode Distance:</span>
                    <strong className="text-[#00D4FF]">{(explosionFactor * 100).toFixed(0)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0.30"
                    max="2.10"
                    step="0.05"
                    aria-label="Vertical explode distance"
                    value={explosionFactor}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setExplosionFactor(val);
                      playSliderClick();
                    }}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#00D4FF]"
                  />
                </div>

                {/* 2. Yaw Control Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">3D Stack Orientation (Yaw):</span>
                    <strong className="text-slate-300">{Math.round(yaw)}°</strong>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="1"
                    aria-label="3D stack yaw angle"
                    value={yaw}
                    disabled={isOrbiting}
                    onChange={(e) => {
                      setYaw(parseInt(e.target.value));
                    }}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#BF00FF] disabled:opacity-30"
                  />
                </div>

                {/* 3. Pitch control slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="text-slate-400">3D Stack Tilt (Pitch):</span>
                    <strong className="text-slate-300">{Math.round(pitch)}°</strong>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="85"
                    step="1"
                    aria-label="3D stack pitch angle"
                    value={pitch}
                    onChange={(e) => {
                      setPitch(parseInt(e.target.value));
                    }}
                    className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-[#39FF14]"
                  />
                </div>

                {/* Orbitor Sync Toggle */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-900">
                  <span className="text-[10px] font-mono text-slate-500">Auto rotating 3D orbit:</span>
                  <button
                    onClick={() => { audioEngine.playClick(); setIsOrbiting(!isOrbiting); }}
                    aria-pressed={isOrbiting}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                      isOrbiting 
                        ? "bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/30" 
                        : "bg-slate-900 text-slate-400 border-slate-800"
                    }`}
                  >
                    {isOrbiting ? "ORBIT_ACTIVE" : "PAUSED"}
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-800 relative space-y-2">
                <span className="text-[9px] font-mono text-[#BF00FF] font-bold block uppercase pb-1 border-b border-slate-900">
                  Active Layer Details
                </span>
                
                <div className="text-xs text-slate-200 font-bold leading-normal">
                  {currentLayer?.title}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {currentLayer?.description}
                </p>

                <div className="text-[9px] font-mono text-slate-500 space-y-1.5 pt-1.5 border-t border-slate-900/60">
                  <div className="flex justify-between">
                    <span>Depth rating:</span>
                    <strong className="text-[#39FF14]">{currentLayer?.depthLabel}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Specs telemetry:</span>
                    <span className="text-right text-white">{currentLayer?.specs.join(" │ ")}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Context/Hotspot Details Panel */}
            <div className="flex-1 space-y-3 pt-2">
              <span className="text-[10px] font-mono text-[#39FF14] tracking-wider uppercase font-bold flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Core Diagnostic Hub
              </span>

              {selectedHotspot ? (
                <div className="p-4 bg-[#0A0D14] border border-[#00D4FF]/40 rounded-xl space-y-3 relative shadow-lg shadow-black/40">
                  <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#39FF14] animate-ping" />
                  
                  <div>
                    <span className="text-[8px] font-mono text-[#00D4FF] font-bold tracking-widest leading-none uppercase">
                      INSPECTED TARGET CODE
                    </span>
                    <h3 className="text-xs font-bold text-white font-mono leading-tight mt-0.5">
                      {selectedHotspot.name}
                    </h3>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    {selectedHotspot.description}
                  </p>

                  {/* Hotspot list dynamic parameters rendering */}
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 space-y-1.5">
                    <span className="text-[8px] font-mono text-slate-500 block font-bold leading-none uppercase mb-1">
                      Target Core Metrics:
                    </span>
                    {selectedHotspot.metrics.map((m, idx) => (
                      <div key={idx} className="flex justify-between text-[10px] font-mono">
                        <span className="text-slate-400">{m.split(":")[0]}:</span>
                        <span className="text-white font-bold">{m.split(":")[1]}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => { audioEngine.playClick(); setSelectedHotspot(null); }}
                    className="w-full py-1.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white hover:border-slate-700 transition"
                  >
                    Clear Focus Targets
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 border border-slate-800 border-dashed rounded-xl text-center py-8">
                  <Focus className="w-5 h-5 text-slate-600 mx-auto mb-2 animate-pulse" />
                  <span className="text-[11px] font-mono text-slate-500 block leading-normal">
                    {activeLayerId 
                      ? "Pulsing targets represent active structural features. Click those pins directly on the illustration to extract localized geophysics." 
                      : "Explore the isometric blocks above. Click a stack layer to zoom/flatten and explore detailed technical features."}
                  </span>
                </div>
              )}

            </div>

          </div>

          {/* Quick Strata Selectors Bar in the Sidebar */}
          <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col gap-1 text-[11px] font-mono">
            <span className="text-[9px] text-[#00D4FF] uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Layer Selectors
            </span>
            <div className="grid grid-cols-5 gap-1">
              {layers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleSelectLayer(l.id)}
                  aria-label={`Focus the ${l.title} layer`}
                  aria-pressed={activeLayerId === l.id}
                  style={{
                    backgroundColor: activeLayerId === l.id ? `${l.color}15` : "",
                    borderColor: activeLayerId === l.id ? l.color : "#1e293b"
                  }}
                  className={`py-1 rounded text-center text-[9px] font-semibold border uppercase transition ${
                    activeLayerId === l.id 
                      ? "text-white font-bold" 
                      : "text-slate-400 border-slate-800 bg-slate-900 hover:text-white"
                  }`}
                >
                  {l.id}
                </button>
              ))}
            </div>
            {activeLayerId && (
              <button
                onClick={() => handleSelectLayer(null)}
                className="mt-1.5 text-center text-[10px] text-slate-500 hover:text-slate-200 hover:underline"
              >
                ← View all 3D stack columns
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
