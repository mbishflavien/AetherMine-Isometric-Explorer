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
  Compass, 
  HelpCircle,
  Activity,
  Sliders,
  Maximize2,
  Minimize2,
  Zap,
  Cpu,
  Info,
  Radio,
  Eye,
  RefreshCw,
  Focus
} from "lucide-react";
import { SensorStream, MiningBlock } from "../types";
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

interface Hotspot {
  id: string;
  name: string;
  description: string;
  left: string; // absolute %
  top: string; // absolute %
  metrics: string[];
}

export default function MiningCanvas({
  streams,
  blocks,
  selectedBlockId,
  onSelectBlock,
  isDrilling,
  activeDrillOffset,
  ledgersCount,
}: MiningCanvasProps) {
  // 3D Controls
  const [explosionFactor, setExplosionFactor] = useState<number>(1.2); // 0.4 to 2.2
  const [pitch, setPitch] = useState<number>(60); // 30 to 80 deg
  const [yaw, setYaw] = useState<number>(-45); // -180 to 180 deg
  const [roll, setRoll] = useState<number>(0); // -180 to 180
  const [isOrbiting, setIsOrbiting] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  
  // Tab/Focus settings
  const [activeLayerId, setActiveLayerId] = useState<string | null>(null); // null = stacked, otherwise single-view active
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [scanFlicker, setScanFlicker] = useState<number>(0);
  const [activeLens, setActiveLens] = useState<"NORMAL" | "RADIOMETRIC" | "GPR_GRID" | "THERMAL">("NORMAL");

  // Define layers matching the realistic generated illustrations
  const layers = [
    {
      id: "sky",
      index: 4,
      title: "Sky Spectrometry Layer",
      subtitle: "Airborne remote geophysical scan",
      imageUrl: "/src/assets/images/sky_layer_1780592814628.png",
      color: "#00D4FF",
      depthLabel: "Altitude: 60m AGL",
      radarTitle: "LIDAR & MAGNETOMETRICS",
      description: "Airborne survey utilizing magnetic gradiometers and hyperspectral sensors to establish preliminary elements mapping.",
      specs: ["Drone speed: 12 m/s", "Sensors: Gamma Gradiometer", "Wavelength: 400-1000nm"],
      hotspots: [
        {
          id: "drone_core",
          name: "Sky-Ranger Glide Drone",
          description: "Autonomous high-altitude fixed-wing drone capturing terrain topography meshes and magnetic variables.",
          left: "48%",
          top: "35%",
          metrics: ["Model: Sky-Ranger X5", "GNSS Accuracy: 1.2cm", "Aero Speed: 42 km/h", "Signal Latency: 4ms"]
        },
        {
          id: "gamma_scanner",
          name: "Gamma-Ray Spectrometer Array",
          description: "High-sensitivity sensor scanning terrestrial gamma emissions to isolate surface potassium, uranium, and thorium levels.",
          left: "51%",
          top: "65%",
          metrics: ["Spectral Bounds: 256 Ch", "Resolution: >100 Bands", "Emission Target: K/U/Th", "Confidence: 94.2%"]
        },
        {
          id: "optical_grid",
          name: "Hyperspectral Laser Projection",
          description: "Sweep grid parsing multispectral ground reflections to trace heavy mineral outcroppings.",
          left: "32%",
          top: "52%",
          metrics: ["Laser Class: 4B Pulsed", "LiDAR Pitch: 120°", "Sweep Velocity: 4500Hz", "Point Density: 400/m²"]
        }
      ]
    },
    {
      id: "surface",
      index: 3,
      title: "Contour-Property Surface Layer",
      subtitle: "GIS contour grids & hauling systems",
      imageUrl: "/src/assets/images/surface_layer_1780592833090.png",
      color: "#FFB300",
      depthLabel: "Altitude: 0m (Surface)",
      radarTitle: "GIS TOPOGRAPHIC PLATE",
      description: "Main operations ground level showing GPS sensor grid vectors, hi-vis exploration surveyors, and the heavy haul truck transport route.",
      specs: ["Slope Gradient: 4.8°", "Sensor nodes: 15m intervals", "Tonnage active: 104 Tons"],
      hotspots: [
        {
          id: "autonomous_hauler",
          name: "Heavy-Duty Autonomous Dump Truck",
          description: "Autonomous heavy-duty vehicle ferrying extracted mineral ore securely. Logs load limits and logs signatures back to blockchain registers on departure.",
          left: "45%",
          top: "54%",
          metrics: ["Unit ID: HAUL_T400_07", "Load Limit: 104 Metric Tons", "Drive Cell: Dual EV Cell", "Custody state: VERIFIED_C3"]
        },
        {
          id: "surveyor_operators",
          name: "High-Frequency Ground-Penetrating Surveyor",
          description: "Field personnel carting ground-penetrating radar arrays to trace shallow water tables and primary quartz deposits.",
          left: "28%",
          top: "44%",
          metrics: ["Crew: Operator Crew B", "Cart frequency: 400MHz", "GPR Penetration: 10m", "GNSS state: FUSED"]
        },
        {
          id: "em_receivers",
          name: "GPS Property boundary sensor node",
          description: "Seeded telemetry node receiving ground resonance responses from the underlying strata.",
          left: "75%",
          top: "62%",
          metrics: ["Node Code: SENTINEL_11", "Voltage read: 42.4 mV", "Battery power: 96%", "Link status: ONLINE"]
        }
      ]
    },
    {
      id: "shallow",
      index: 2,
      title: "Shallow Strata Layer (<10m)",
      subtitle: "Lode veins & GPR profiles",
      imageUrl: "/src/assets/images/shallow_layer_1780592847776.png",
      color: "#39FF14",
      depthLabel: "Depth: 0m to 10m",
      radarTitle: "GPR STRATA PROFILER",
      description: "Subsurface quartzite bedding. Hosts rich tantalum, coltan, and quartz gold veins directly targetable with exploration drills.",
      specs: ["Bedrock: Quartz Schist", "Clay index: 8% low", "Attenuate rate: 15 dB/m"],
      hotspots: [
        {
          id: "gold_quartz",
          name: "Gold-Coltan Quartz Matrix",
          description: "DENSE hydro-thermal quartz structure rich in columbite elements and granular gold outcroppings.",
          left: "40%",
          top: "45%",
          metrics: ["Gold Grade: 7.8 g/t", "Coltan Index: 68%", "Lode density: 2.7g/cm³", "Status: Highly Economical"]
        },
        {
          id: "drill_target_block_A",
          name: "Target Exploration Block A",
          description: "Direct targeted coordinate within standard GPR survey limits. Readily accessible at shallow depth.",
          left: "64%",
          top: "32%",
          metrics: ["Drill Depth: 3.2 Meters", "Type: Silicified Quartzite", "Density rating: OPTIMAL", "Class: HIGH-GRADE"]
        },
        {
          id: "radar_arrays_propagation",
          name: "Radar Wave Propagation",
          description: "Aqueous boundaries bouncing microwave pulses to calculate clay content and spatial strata lines.",
          left: "25%",
          top: "65%",
          metrics: ["Radar Attenuation: 15 dB/m", "Permittivity: 6.4", "Grid resolution: 10cm", "Wave speed: 0.12m/ns"]
        }
      ]
    },
    {
      id: "deep",
      index: 1,
      title: "Deep Subsurface Layer (<50m)",
      subtitle: "Bedrock fractures & EM anomalies",
      imageUrl: "/src/assets/images/deep_layer_1780592859219.png",
      color: "#BF00FF",
      depthLabel: "Depth: 10m to 50m",
      radarTitle: "EM-MAGNETIC DEPTHS",
      description: "Dense basement rock bed housing primary shear fault lines and high-conductivity metallic gold megastructures.",
      specs: ["Basement: Precambrian Gneiss", "Heat slope: +1.2°C/m", "Moisture: extreme dry"],
      hotspots: [
        {
          id: "deep_anomalous_reservoir",
          name: "Conductive Metal Anomaly Body",
          description: "Massive high-conductivity ore body located at 38m depth, indicating dense tantalum oxides aggregation.",
          left: "54%",
          top: "50%",
          metrics: ["Est Volume: ~45k m³", "Phase Angle: 142°", "Estimated Grade: 94.2%", "Core index: BLOCK B TARGET"]
        },
        {
          id: "shear_fault_fissure",
          name: "Planetary Tectonic Fault Zone",
          description: "Historic high-pressure fracture that acted as primary hydrothermal feed vein during metamorphic mineral accretion.",
          left: "32%",
          top: "32%",
          metrics: ["Shear Dip: 74° East", "Displacement: 12.4m", "Groundwater Flow: Locked", "Seismic State: INERT"]
        },
        {
          id: "magnetic_wavefronts",
          name: "Low-Frequency EM Magnetic Gradient",
          description: "Radiating electromagnetic wavefront contours identifying deep geological borders.",
          left: "72%",
          top: "66%",
          metrics: ["Mag Susceptibility: Extreme", "Coercive field: High", "EM Depth resolved: 50m", "Anomaly ID: ANOM_DEEP_C"]
        }
      ]
    },
    {
      id: "ml_pipeline",
      index: 0,
      title: "PyTorch ML Core Layer",
      subtitle: "Neural data convergence system",
      imageUrl: "/src/assets/images/ml_pipeline_1780592873835.png",
      color: "#FF3D00",
      depthLabel: "Core Processing Server",
      radarTitle: "AI TELEMETRY CONVERGENCE",
      description: "Aggregated server system housing our model weights, training pipeline, and automated ledger hash verification loop.",
      specs: ["Neural Model: Pytorch ResNet", "Loss margin: 0.024 RMS", "Epoch Sync: 15s Cycle"],
      hotspots: [
        {
          id: "neural_classification_processors",
          name: "Neural Model Processing Unit",
          description: "High-octane accelerator matrix routing multi-spectral arrays to parse grade predictions securely.",
          left: "50%",
          top: "45%",
          metrics: ["Accelerate: FP16 Tensor", "LR Rate: 0.005 Adaptive", "Weights status: OPTIMIZED", "Model ID: STRATUM_V5"]
        },
        {
          id: "telemetry_fiber_streams",
          name: "Telemetry Integration Multiplexer",
          description: "Subsurface fiber paths aggregating magnetic, radar, and radiometric signal streams synchronously.",
          left: "30%",
          top: "35%",
          metrics: ["Multiplex Speed: 40Gb/s", "Fibers matched: 5 / 5 online", "Sync Mode: Real-Time Pass", "Loss Ratio: 0.00%"]
        },
        {
          id: "holographic_dashboard_admin",
          name: "Holographic Admin Console Interface",
          description: "Real-time interactive dashboard visualizing physical metrics and blockchain ledgers synchronously.",
          left: "70%",
          top: "55%",
          metrics: ["Telemetry Link: FUSED", "UTC Clamp: 16:45:30", "Verified Blocks: Live synced", "Admin state: ACCESS_OK"]
        }
      ]
    }
  ];

  // Auto-Orbit controller effect
  useEffect(() => {
    let animationId: any;
    if (isOrbiting && !activeLayerId) {
      animationId = setInterval(() => {
        setYaw((prev) => {
          let next = prev + 0.15;
          if (next > 180) next = -180;
          return next;
        });
      }, 30);
    }
    return () => {
      if (animationId) clearInterval(animationId);
    };
  }, [isOrbiting, activeLayerId]);

  // Periodic sensor flicker mapping
  useEffect(() => {
    const interval = setInterval(() => {
      setScanFlicker((prev) => (prev + 1) % 100);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setMute(nextMute);
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

  const activeBlockObject = blocks.find(b => b.id === selectedBlockId);

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
            title="Reset Illustration View to Default Settings"
          >
            <RefreshCw className="w-3 h-3" /> Reset View
          </button>

          <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded leading-none hidden sm:block">
            LEDGERS AUTH: <span className="text-[#39FF14] font-bold">{ledgersCount} CERT</span>
          </span>

          <button
            onClick={handleMuteToggle}
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
              className="absolute top-0 bottom-0 z-35 pointer-events-none"
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
                {scanFlicker % 20 < 4 && (
                  <div 
                    className="absolute inset-x-0 bg-gradient-to-t from-[#00D4FF]/0 via-[#00D4FF]/12 to-[#BF00FF]/0 border-y border-[#00D4FF]/30 pointer-events-none"
                    style={{
                      height: "100%",
                      transform: "translateZ(100px)",
                      transformStyle: "preserve-3d"
                    }}
                  />
                )}

                {/* Stacking actual individual layers inside the Exploded Layer-cake columns */}
                {layers.slice().reverse().map((layer) => {
                  const zTranslate = layer.index * explosionFactor * 52;
                  
                  return (
                    <div
                      key={layer.id}
                      onClick={() => handleSelectLayer(layer.id)}
                      className="absolute inset-0 bg-slate-900/60 rounded-lg border border-slate-700/60 hover:border-[#00D4FF]/80 hover:bg-slate-900/90 hover:shadow-2xl hover:shadow-[#00D4FF]/10 cursor-pointer transition-all duration-300 group"
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
                          referrerPolicy="no-referrer"
                          className={`w-full h-full object-cover transition duration-300 pointer-events-none ${getLensColorFilter()} ${
                            isDrilling ? "contrast-115 grayscale-[15%]" : ""
                          }`}
                        />
                        {/* Shading overlay based on deck position */}
                        <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition duration-200" />
                        
                        {/* Dynamic Sweep Grid Laser Bar Overlay */}
                        <div 
                          className="absolute inset-x-0 h-0.5 bg-[#39FF14] shadow-md shadow-[#39FF14]"
                          style={{
                            top: `${(scanFlicker * 1.5) % 100}%`
                          }}
                        />
                      </div>

                      {/* Small Neon Border and text callouts */}
                      <div className="absolute bottom-2 left-2.5 z-20 bg-slate-950/95 p-1.5 px-2.5 rounded border border-slate-800 flex items-center gap-1.5 font-mono text-[9px] text-[#A7F3D0]">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: layer.color }} />
                        <span className="font-bold text-white uppercase">{layer.id}</span> │ {layer.depthLabel}
                      </div>

                      {/* Sparkle corner decorations */}
                      <span className="absolute top-1 left-1 block h-1 w-1 bg-[#00D4FF] rounded-full opacity-60" />
                      <span className="absolute bottom-1 right-1 block h-1 w-1 bg-[#BF00FF] rounded-full opacity-60" />
                    </div>
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
                <div 
                  className="absolute inset-x-0 h-[2px] bg-sky-400 shadow-md shadow-sky-500"
                  style={{ top: `${(scanFlicker * 1.5) % 100}%` }}
                />

                {/* Subsurface drill location crosshairs if zoomed layer is shallow/surface */}
                {(currentLayer?.id === "shallow" || currentLayer?.id === "surface") && (
                  <div 
                    className="absolute left-[64%] top-[30%] pointer-events-none flex flex-col items-center justify-center"
                  >
                    <div className="h-5 w-5 rounded-full border border-dashed border-[#FFB300] animate-spin" />
                    <span className="text-[8px] font-mono text-[#FFB300] bg-slate-950 px-1 rounded mt-0.5 border border-slate-805">
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
                  className="bg-slate-900 hover:bg-slate-850 p-1 px-3 border border-slate-700 text-white rounded font-bold uppercase transition"
                >
                  ← Return to 3D Stack View
                </button>
              </div>

            </div>
          )}

        </div>

        {/* RIGHT CONTROL PANEL COLUMN: DIAGNOSTIC DATA & SPECS */}
        <div className="w-full lg:w-76 xl:w-80 shrink-0 bg-[#0B0F19]/95 border-t lg:border-t-0 lg:border-l border-[#1F2937]/50 flex flex-col p-4 overflow-y-auto">
          
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
                    value={explosionFactor}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setExplosionFactor(val);
                      if (scanFlicker % 4 === 0) audioEngine.playClick();
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
                    className="w-full py-1.5 rounded bg-slate-905 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-white hover:border-slate-700 transition"
                  >
                    Clear Focus Targets
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/40 border border-slate-850 border-dashed rounded-xl text-center py-8">
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
          <div className="mt-4 pt-3.5 border-t border-slate-850 flex flex-col gap-1 text-[11px] font-mono">
            <span className="text-[9px] text-[#00D4FF] uppercase tracking-wider mb-1.5 font-bold flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Layer Selectors
            </span>
            <div className="grid grid-cols-5 gap-1">
              {layers.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleSelectLayer(l.id)}
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
