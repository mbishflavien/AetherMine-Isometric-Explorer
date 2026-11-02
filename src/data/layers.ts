import deepLayerImage from "../assets/images/deep_layer_1780592859219.png";
import mlPipelineImage from "../assets/images/ml_pipeline_1780592873835.png";
import shallowLayerImage from "../assets/images/shallow_layer_1780592847776.png";
import skyLayerImage from "../assets/images/sky_layer_1780592814628.png";
import surfaceLayerImage from "../assets/images/surface_layer_1780592833090.png";

export interface Hotspot {
  id: string;
  name: string;
  description: string;
  left: string;
  top: string;
  metrics: string[];
}

export interface MiningLayer {
  id: string;
  index: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  color: string;
  depthLabel: string;
  radarTitle: string;
  description: string;
  specs: string[];
  hotspots: Hotspot[];
}

export const layers: MiningLayer[] = [
  {
    id: "sky",
    index: 4,
    title: "Sky Spectrometry Layer",
    subtitle: "Airborne remote geophysical scan",
    imageUrl: skyLayerImage,
    color: "#00D4FF",
    depthLabel: "Altitude: 60m AGL",
    radarTitle: "LIDAR & MAGNETOMETRICS",
    description:
      "Airborne survey utilizing magnetic gradiometers and hyperspectral sensors to establish preliminary elements mapping.",
    specs: [
      "Drone speed: 12 m/s",
      "Sensors: Gamma Gradiometer",
      "Wavelength: 400-1000nm",
    ],
    hotspots: [
      {
        id: "drone_core",
        name: "Sky-Ranger Glide Drone",
        description:
          "Autonomous high-altitude fixed-wing drone capturing terrain topography meshes and magnetic variables.",
        left: "48%",
        top: "35%",
        metrics: [
          "Model: Sky-Ranger X5",
          "GNSS Accuracy: 1.2cm",
          "Aero Speed: 42 km/h",
          "Signal Latency: 4ms",
        ],
      },
      {
        id: "gamma_scanner",
        name: "Gamma-Ray Spectrometer Array",
        description:
          "High-sensitivity sensor scanning terrestrial gamma emissions to isolate surface potassium, uranium, and thorium levels.",
        left: "51%",
        top: "65%",
        metrics: [
          "Spectral Bounds: 256 Ch",
          "Resolution: >100 Bands",
          "Emission Target: K/U/Th",
          "Confidence: 94.2%",
        ],
      },
      {
        id: "optical_grid",
        name: "Hyperspectral Laser Projection",
        description:
          "Sweep grid parsing multispectral ground reflections to trace heavy mineral outcroppings.",
        left: "32%",
        top: "52%",
        metrics: [
          "Laser Class: 4B Pulsed",
          "LiDAR Pitch: 120°",
          "Sweep Velocity: 4500Hz",
          "Point Density: 400/m²",
        ],
      },
    ],
  },
  {
    id: "surface",
    index: 3,
    title: "Contour-Property Surface Layer",
    subtitle: "GIS contour grids & hauling systems",
    imageUrl: surfaceLayerImage,
    color: "#FFB300",
    depthLabel: "Altitude: 0m (Surface)",
    radarTitle: "GIS TOPOGRAPHIC PLATE",
    description:
      "Main operations ground level showing GPS sensor grid vectors, hi-vis exploration surveyors, and the heavy haul truck transport route.",
    specs: [
      "Slope Gradient: 4.8°",
      "Sensor nodes: 15m intervals",
      "Tonnage active: 104 Tons",
    ],
    hotspots: [
      {
        id: "autonomous_hauler",
        name: "Heavy-Duty Autonomous Dump Truck",
        description:
          "Autonomous heavy-duty vehicle ferrying extracted mineral ore securely. Logs load limits and logs signatures back to blockchain registers on departure.",
        left: "45%",
        top: "54%",
        metrics: [
          "Unit ID: HAUL_T400_07",
          "Load Limit: 104 Metric Tons",
          "Drive Cell: Dual EV Cell",
          "Custody state: VERIFIED_C3",
        ],
      },
      {
        id: "surveyor_operators",
        name: "High-Frequency Ground-Penetrating Surveyor",
        description:
          "Field personnel carting ground-penetrating radar arrays to trace shallow water tables and primary quartz deposits.",
        left: "28%",
        top: "44%",
        metrics: [
          "Crew: Operator Crew B",
          "Cart frequency: 400MHz",
          "GPR Penetration: 10m",
          "GNSS state: FUSED",
        ],
      },
      {
        id: "em_receivers",
        name: "GPS Property boundary sensor node",
        description:
          "Seeded telemetry node receiving ground resonance responses from the underlying strata.",
        left: "75%",
        top: "62%",
        metrics: [
          "Node Code: SENTINEL_11",
          "Voltage read: 42.4 mV",
          "Battery power: 96%",
          "Link status: ONLINE",
        ],
      },
    ],
  },
  {
    id: "shallow",
    index: 2,
    title: "Shallow Strata Layer (<10m)",
    subtitle: "Lode veins & GPR profiles",
    imageUrl: shallowLayerImage,
    color: "#39FF14",
    depthLabel: "Depth: 0m to 10m",
    radarTitle: "GPR STRATA PROFILER",
    description:
      "Subsurface quartzite bedding. Hosts rich tantalum, coltan, and quartz gold veins directly targetable with exploration drills.",
    specs: ["Bedrock: Quartz Schist", "Clay index: 8% low", "Attenuate rate: 15 dB/m"],
    hotspots: [
      {
        id: "gold_quartz",
        name: "Gold-Coltan Quartz Matrix",
        description:
          "DENSE hydro-thermal quartz structure rich in columbite elements and granular gold outcroppings.",
        left: "40%",
        top: "45%",
        metrics: [
          "Gold Grade: 7.8 g/t",
          "Coltan Index: 68%",
          "Lode density: 2.7g/cm³",
          "Status: Highly Economical",
        ],
      },
      {
        id: "drill_target_block_A",
        name: "Target Exploration Block A",
        description:
          "Direct targeted coordinate within standard GPR survey limits. Readily accessible at shallow depth.",
        left: "64%",
        top: "32%",
        metrics: [
          "Drill Depth: 3.2 Meters",
          "Type: Silicified Quartzite",
          "Density rating: OPTIMAL",
          "Class: HIGH-GRADE",
        ],
      },
      {
        id: "radar_arrays_propagation",
        name: "Radar Wave Propagation",
        description:
          "Aqueous boundaries bouncing microwave pulses to calculate clay content and spatial strata lines.",
        left: "25%",
        top: "65%",
        metrics: [
          "Radar Attenuation: 15 dB/m",
          "Permittivity: 6.4",
          "Grid resolution: 10cm",
          "Wave speed: 0.12m/ns",
        ],
      },
    ],
  },
  {
    id: "deep",
    index: 1,
    title: "Deep Subsurface Layer (<50m)",
    subtitle: "Bedrock fractures & EM anomalies",
    imageUrl: deepLayerImage,
    color: "#BF00FF",
    depthLabel: "Depth: 10m to 50m",
    radarTitle: "EM-MAGNETIC DEPTHS",
    description:
      "Dense basement rock bed housing primary shear fault lines and high-conductivity metallic gold megastructures.",
    specs: [
      "Basement: Precambrian Gneiss",
      "Heat slope: +1.2°C/m",
      "Moisture: extreme dry",
    ],
    hotspots: [
      {
        id: "deep_anomalous_reservoir",
        name: "Conductive Metal Anomaly Body",
        description:
          "Massive high-conductivity ore body located at 38m depth, indicating dense tantalum oxides aggregation.",
        left: "54%",
        top: "50%",
        metrics: [
          "Est Volume: ~45k m³",
          "Phase Angle: 142°",
          "Estimated Grade: 94.2%",
          "Core index: BLOCK B TARGET",
        ],
      },
      {
        id: "shear_fault_fissure",
        name: "Planetary Tectonic Fault Zone",
        description:
          "Historic high-pressure fracture that acted as primary hydrothermal feed vein during metamorphic mineral accretion.",
        left: "32%",
        top: "32%",
        metrics: [
          "Shear Dip: 74° East",
          "Displacement: 12.4m",
          "Groundwater Flow: Locked",
          "Seismic State: INERT",
        ],
      },
      {
        id: "magnetic_wavefronts",
        name: "Low-Frequency EM Magnetic Gradient",
        description:
          "Radiating electromagnetic wavefront contours identifying deep geological borders.",
        left: "72%",
        top: "66%",
        metrics: [
          "Mag Susceptibility: Extreme",
          "Coercive field: High",
          "EM Depth resolved: 50m",
          "Anomaly ID: ANOM_DEEP_C",
        ],
      },
    ],
  },
  {
    id: "ml_pipeline",
    index: 0,
    title: "PyTorch ML Core Layer",
    subtitle: "Neural data convergence system",
    imageUrl: mlPipelineImage,
    color: "#FF3D00",
    depthLabel: "Core Processing Server",
    radarTitle: "AI TELEMETRY CONVERGENCE",
    description:
      "Aggregated server system housing our model weights, training pipeline, and automated ledger hash verification loop.",
    specs: [
      "Neural Model: Pytorch ResNet",
      "Loss margin: 0.024 RMS",
      "Epoch Sync: 15s Cycle",
    ],
    hotspots: [
      {
        id: "neural_classification_processors",
        name: "Neural Model Processing Unit",
        description:
          "High-octane accelerator matrix routing multi-spectral arrays to parse grade predictions securely.",
        left: "50%",
        top: "45%",
        metrics: [
          "Accelerate: FP16 Tensor",
          "LR Rate: 0.005 Adaptive",
          "Weights status: OPTIMIZED",
          "Model ID: STRATUM_V5",
        ],
      },
      {
        id: "telemetry_fiber_streams",
        name: "Telemetry Integration Multiplexer",
        description:
          "Subsurface fiber paths aggregating magnetic, radar, and radiometric signal streams synchronously.",
        left: "30%",
        top: "35%",
        metrics: [
          "Multiplex Speed: 40Gb/s",
          "Fibers matched: 5 / 5 online",
          "Sync Mode: Real-Time Pass",
          "Loss Ratio: 0.00%",
        ],
      },
      {
        id: "holographic_dashboard_admin",
        name: "Holographic Admin Console Interface",
        description:
          "Real-time interactive dashboard visualizing physical metrics and blockchain ledgers synchronously.",
        left: "70%",
        top: "55%",
        metrics: [
          "Telemetry Link: FUSED",
          "UTC Clamp: 16:45:30",
          "Verified Blocks: Live synced",
          "Admin state: ACCESS_OK",
        ],
      },
    ],
  },
];
