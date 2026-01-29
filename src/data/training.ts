export interface WorkforceSpecialist {
  title: string;
  detail?: string;
}

export const workforceSpecialists: WorkforceSpecialist[] = [
  { title: "Professional Service Techs" },
  {
    title: "Certified Industrial Hygienist",
    detail: "(CIH) Support, consulting, oversight and data management",
  },
  {
    title: "Certified Safety Professional",
    detail: "(CSP) Support, consulting, oversight and data management",
  },
  { title: "Safety Consultants", detail: "Overseeing job site safety" },
  { title: "Field Atmosphere Tech Services" },
  { title: "HAZWOPER Trained Technicians" },
  { title: "Field Services Guard Gate" },
  { title: "Field Services", detail: "Restraint Technicians" },
  { title: "Fire Safety Specialists" },
  {
    title: "Project Management",
    detail: "Command Center Staffing",
  },
  { title: "Medical Management" },
  { title: "Safety Training" },
];

export interface CourseCategory {
  id: string;
  title: string;
  courses: string[];
}

export const courseCategories: CourseCategory[] = [
  {
    id: "confined-space",
    title: "Confined Space & Atmospheric",
    courses: [
      "Confined Space — Entry",
      "Confined Space — Attendant",
      "Confined Space — Supervisor",
      "Confined Space — Rescue",
      "Hydrogen Sulfide Awareness",
      "Hydrogen Sulfide Certification",
      "Benzene Awareness",
      "Carbon Dioxide",
      "NORM Awareness",
      "Lead Awareness",
      "Asbestos",
    ],
  },
  {
    id: "physical-safety",
    title: "Physical Safety & Equipment",
    courses: [
      "Fall Protection",
      "Ladder Safety",
      "Scaffolding",
      "Rigging Safety",
      "Overhead Cranes",
      "Powered Industrial Truck",
      "Hand & Power Tool",
      "Lock Out / Tag Out",
      "Hot Work",
      "Electrical Safety",
      "Excavation — DigTest",
      "Compressed Gases",
      "Hazard Material Transportation (HAZMAT)",
      "Valve Safety",
    ],
  },
  {
    id: "regulatory",
    title: "Regulatory & Compliance",
    courses: [
      "OSHA 10-Hour",
      "OSHA 30-Hour",
      "PEC Basic (SafeLand)",
      "PEC Core Compliance",
      "DOT",
      "Recordkeeping",
      "Contractor Safety",
      "Process Safety Management",
      "Hazard Communication",
      "Job Safety Analysis",
      "Incident Reporting & Investigation",
    ],
  },
  {
    id: "health-environmental",
    title: "Health & Environmental",
    courses: [
      "Personal Protective Equipment",
      "Respiratory Protection & Fit Testing",
      "Hearing Conservation",
      "Back Safety",
      "Ergonomics",
      "Employee Wellness",
      "Office Safety",
      "Heat Stress",
      "Adverse Weather",
      "Winter Safety",
      "Environmental Responsibility",
      "Housekeeping",
    ],
  },
  {
    id: "emergency-workplace",
    title: "Emergency, Medical & Workplace",
    courses: [
      "Medic First Aid & CPR",
      "Bloodborne Pathogens",
      "Fire Extinguisher",
      "Drug & Alcohol Awareness",
      "Terrorism Response (TRAP)",
      "Sexual Harassment",
      "Violence in the Workplace",
      "Driving Safety",
    ],
  },
];

export function getTotalCourseCount(): number {
  return courseCategories.reduce((total, cat) => total + cat.courses.length, 0);
}
