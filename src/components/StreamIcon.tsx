import { Activity, Cpu, Database, Eye, Radio, Satellite } from "lucide-react";
import type { SensorStream } from "../types";

interface StreamIconProps {
  type: SensorStream["type"];
}

export default function StreamIcon({ type }: StreamIconProps) {
  switch (type) {
    case "Satellite":
      return <Satellite className="w-4 h-4 text-[#00D4FF]" />;
    case "Hyperspectral":
      return <Eye className="w-4 h-4 text-[#FFB300]" />;
    case "Gamma-Ray":
      return <Radio className="w-4 h-4 text-[#BF00FF]" />;
    case "GPR":
      return <Activity className="w-4 h-4 text-[#39FF14]" />;
    case "EM-Mag":
      return <Cpu className="w-4 h-4 text-[#FF3D00]" />;
    default:
      return <Database className="w-4 h-4" />;
  }
}
