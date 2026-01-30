import { Shield, HardHat, Truck, Flame, Wind, Wrench } from "lucide-react";

export type IconName =
  | "shield"
  | "hardHat"
  | "truck"
  | "flame"
  | "wind"
  | "wrench";

export const ICON_MAP: Record<
  IconName,
  React.ComponentType<{ className?: string }>
> = {
  shield: Shield,
  hardHat: HardHat,
  truck: Truck,
  flame: Flame,
  wind: Wind,
  wrench: Wrench,
};

export interface ServiceOffering {
  id: string;
  title: string;
  category: string;
}

export interface ServiceCategory {
  id: string;
  title: string;
}

export const serviceCategories: ServiceCategory[] = [
  { id: "field-safety", title: "Field Safety" },
  { id: "h2s-gas", title: "H2S & Gas Detection" },
  { id: "equipment-rental", title: "Equipment Rental" },
  { id: "inspections", title: "Inspections & Support" },
];

export const serviceOfferings: ServiceOffering[] = [
  // Field Safety
  {
    id: "gate-guard",
    title: "24-Hour Gate Guard Coverage",
    category: "field-safety",
  },
  {
    id: "h2s-techs",
    title: "H2S Safety Technicians",
    category: "field-safety",
  },
  {
    id: "hse-advisors",
    title: "HSE Safety Advisors (D&C, Production and Construction)",
    category: "field-safety",
  },
  {
    id: "site-safety",
    title: "Site Safety Technicians",
    category: "field-safety",
  },
  {
    id: "training",
    title: "Safety Training Services",
    category: "field-safety",
  },

  // H2S & Gas Detection
  { id: "low-risk-h2s", title: "Low Risk H2S Package", category: "h2s-gas" },
  { id: "high-risk-h2s", title: "High Risk H2S Package", category: "h2s-gas" },
  {
    id: "lel-wireless",
    title: "LEL Wireless System w/ Four Heads (Redline)",
    category: "h2s-gas",
  },
  {
    id: "stain-tubes",
    title: "H2S Stain Tubes (ROE Calculation)",
    category: "h2s-gas",
  },
  { id: "line-locating", title: "Line Locating", category: "h2s-gas" },

  // Equipment Rental
  {
    id: "restraint-systems",
    title: "High-Pressure Restraint Systems",
    category: "equipment-rental",
  },
  {
    id: "breathing-air",
    title: "6-Bottle Breathing Air Trailer",
    category: "equipment-rental",
  },
  {
    id: "shower-trailer",
    title: "Shower Trailer",
    category: "equipment-rental",
  },
  {
    id: "combo-trailer",
    title: "Combo Trailer (Shower/Recovery)",
    category: "equipment-rental",
  },
  {
    id: "mobile-air",
    title: "Mobile Air Refill",
    category: "equipment-rental",
  },

  // Inspections & Support
  { id: "annual-fe", title: "Annual F.E. Inspection", category: "inspections" },
  {
    id: "monthly-fe",
    title: "Monthly F.E. Inspection",
    category: "inspections",
  },
  {
    id: "rig-up-down",
    title: "Equipment Rig Up & Rig Down",
    category: "inspections",
  },
];

export interface ServiceDetail {
  id: string;
  title: string;
  description: string;
  features: string[];
  iconName: IconName;
}

export const serviceDetails: ServiceDetail[] = [
  {
    id: "restraint-systems",
    title: "Restraint Systems Rental",
    iconName: "shield",
    description:
      "Standard began in early 2018 offering its clients a superior line of Pipe Restraint Safety Systems, designed specifically for oil and gas fracking environments. We install and rent daily engineered pipe restraint systems designed to limit pipe whip range during catastrophic failures to flow line or union connections. The system improves job profitability and completion time while lowering equipment and manpower costs.",
    features: [
      "Flow lines",
      "Frack lines",
      "Temporary pipelines",
      "Frack irons",
      "1502 irons",
      "Swivels & chicksans",
      "Flow irons",
      "Flow connections",
    ],
  },
  {
    id: "safety-equipment-rental",
    title: "Safety Equipment Rental",
    iconName: "hardHat",
    description:
      "Standard Safety and Supply's mission is to protect workers through meticulous procedure and properly maintained and tested equipment. Our certified technicians assess and certify all rental equipment using manufacturer-required maintenance procedures.",
    features: [
      "Breathing air & respiratory protection",
      "Emergency exposure eye wash & showers",
      "Area, personal & environmental gas monitoring",
      "Ventilation & exposure monitoring",
      "Personal & area cooling",
      "Confined space entry",
      "Fall protection & retrieval",
      "Fire suppression",
    ],
  },
  {
    id: "gas-detection",
    title: "Gas Detection & Monitoring",
    iconName: "wind",
    description:
      "We provide comprehensive gas detection and monitoring solutions for oil and gas operations, protecting people and property from combustibility and harmful gases.",
    features: [
      "Fixed & wireless gas monitoring systems",
      "Handheld single-gas monitors",
      "Handheld quad-gas monitors",
      "Chip gas detectors",
      "Pipeline release monitoring",
      "Photo-ionization detectors (PIDs)",
      "Flame-ionization detectors (FIDs)",
      "Air sampler pumps & monitors",
    ],
  },
  {
    id: "atmospheric-testing",
    title: "Atmospheric Testing & Respiratory Protection",
    iconName: "flame",
    description:
      "It is no secret in the oil and gas industry that there are many inherent hazards associated with the recovery and processing of resources. Gas detection protects people and property from combustibility and harmful gases. We provide the highest quality detection and respiratory services and equipment to keep employees operating safely and efficiently.",
    features: [
      "Hydrogen sulfide detection",
      "Combustible gas monitoring",
      "Carbon monoxide & dioxide detection",
      "Oxygen deficiency & enrichment monitoring",
      "Hydrofluoric acid detection",
      "Methane, ethane & propane monitoring",
      "Butane & pentane detection",
      "Hydrogen & hexane monitoring",
    ],
  },
];

export function getTotalServiceCount(): number {
  return serviceOfferings.length;
}
