export type EnvironmentalIconName = "leaf" | "droplets" | "recycle" | "fileCheck";

export interface EnvironmentalService {
  id: string;
  title: string;
  description: string;
  iconName: EnvironmentalIconName;
  features: string[];
  image: string;
  imageAlt: string;
}

export const environmentalServices: EnvironmentalService[] = [
  {
    id: "earthworks",
    title: "Environmental Earthworks",
    description:
      "Full-service earthworks for oil and gas operations, from pad construction to facility decommissioning and land reclamation.",
    iconName: "leaf",
    image: "/images/environmental/earthworks.jpg",
    imageAlt: "Environmental earthworks equipment on site",
    features: [
      "Pit closures / reclamation",
      "Pit construction and repair",
      "Decommission & remediation: tank batteries, SWDs, facilities, wellheads",
      "Caliche / dirt road maintenance / washout repair",
      "Pad construction",
      "Frac pond construction",
      "SWD and CTB pad construction excavation services",
      "Right of way construction and maintenance",
      "Right-of-way mowing and clearing",
      "Weed control mowing and spraying",
    ],
  },
  {
    id: "ldar",
    title: "LDAR (Thermal Imaging Emissions Testing)",
    description:
      "Leak Detection and Repair services for upstream, midstream, and downstream operations with EPA inspection compliance. Real-time repair confirmation during inspections with cost-conscious solutions and regulatory compliance.",
    iconName: "fileCheck",
    image: "/images/environmental/ldar.jpg",
    imageAlt: "LDAR thermal imaging emissions testing",
    features: [
      "Upstream, midstream & downstream settings",
      "EPA inspection compliance",
      "Real-time repair confirmation during inspections",
      "Day or site-specific rates",
      "Follow-up services & compliance reporting",
    ],
  },
  {
    id: "remediation",
    title: "Environmental Remediation",
    description:
      "Comprehensive remediation services to restore contaminated sites, from emergency spill response to long-term groundwater treatment and site assessment.",
    iconName: "droplets",
    image: "/images/environmental/remediation.jpg",
    imageAlt: "Environmental remediation site work",
    features: [
      "Hydrocarbon/chloride soil remediation",
      "In-situ / ex-situ bioremediation",
      "Excavation and disposal",
      "Groundwater remediation",
      "Environmental wash services",
      "Vegetation remediation and restoration",
      "Project management and consulting",
      "Phase I and Phase II site assessments",
      "Emergency spill response",
    ],
  },
  {
    id: "tank-cleaning",
    title: "Tank Cleaning & Waste Management",
    description:
      "Certified crews with full PPE and confined space entry certification performing tank cleaning, waste profiling, and disposal services with specialized equipment.",
    iconName: "recycle",
    image: "/images/environmental/tank-cleaning.jpg",
    imageAlt: "Tank cleaning and waste management operations",
    features: [
      "Certified crew personnel with PPE",
      "Confined space entry certification",
      "Heated pressure washers & specialized equipment",
      "Waste profiling, tracking & disposal",
      "Atmospheric testing & safety support",
    ],
  },
];
