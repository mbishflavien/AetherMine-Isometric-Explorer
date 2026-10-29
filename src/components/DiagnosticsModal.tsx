import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Cpu, Info, Radio, X } from "lucide-react";
import { audioEngine } from "./AudioEngine";

interface DiagnosticsModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DiagnosticsModal({ open, onClose }: DiagnosticsModalProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);

  const handleClose = () => {
    audioEngine.playClick();
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Move focus into the dialog while it is open and restore it on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => previouslyFocused?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(event) => event.stopPropagation()}
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="diagnostics-title"
            tabIndex={-1}
            className="bg-[#0D121F] border border-[#00D4FF]/40 rounded-xl p-5 md:p-6 max-w-2xl w-full text-slate-300 font-sans shadow-2xl relative focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]/70"
          >
            <button
              onClick={handleClose}
              aria-label="Close diagnostics"
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00D4FF]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
              <Info className="w-5 h-5 text-[#00D4FF]" />
              <h2
                id="diagnostics-title"
                className="text-base font-bold text-white font-mono uppercase tracking-wider"
              >
                Stratum-V Deep-Tech Diagnostic Manual
              </h2>
            </div>

            <div className="space-y-4 text-xs md:text-sm leading-relaxed">
              <p>
                Welcome to the control center of <strong>AetherMine Stratum-V</strong>, a
                next-generation autonomous mining and geophysics telemetry integration hub.
                Inspired by tactical GIS systems, modern sci-fi interfaces and clean blockchain
                tracking, this app models a deep-tech exploratory site.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-3 bg-slate-950/75 rounded-lg border border-slate-800">
                  <h3 className="font-bold text-white font-mono text-xs mb-1.5 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-[#39FF14]" /> Multi-Sensor GIS
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Toggle exploration slices from the lower left bar. Use the range slider on the
                    right to manually explode the geology columns inside the interactive 3D
                    layer-cake representation dynamically.
                  </p>
                </div>

                <div className="p-3 bg-slate-950/75 rounded-lg border border-slate-800">
                  <h3 className="font-bold text-white font-mono text-xs mb-1.5 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#FFB300]" /> PyTorch ML Classifier
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Simulates active telemetry routing. Enable, disable, or calibrate the signal
                    density sliders of the 5 spectra bands. The neural pipeline automatically
                    recalculates confidence coefficients in real-time.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-xs font-mono text-[#BF00FF] uppercase mb-1">
                  Excavation Protocol &amp; Ledger
                </h3>
                <p className="text-xs text-slate-400 leading-normal">
                  Select a block on the active plate, then click{" "}
                  <strong>Engage Excavation Protocol</strong>. The laser core drill shoots particles
                  from the drone core down, resolving complex geological layers. Upon success, a
                  digital block receipt with SHA-256 validation is appended to the Immutable
                  Chain-of-Custody ledger tab.
                </p>
              </div>

              <div className="bg-[#122A21] border border-[#39FF14]/30 p-2 text-[11px] font-mono rounded text-[#A7F3D0] flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#39FF14] animate-ping" />
                Telemetry verified. Fully active localized browser synthesizers ready for sonar
                pulses.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleClose}
                className="bg-[#00D4FF]/15 hover:bg-[#00D4FF]/35 text-[#00D4FF] border border-[#00D4FF]/40 font-mono font-bold text-xs py-2 px-4 rounded transition duration-150"
              >
                Confirm Diagnostics &amp; Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
