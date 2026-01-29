export interface GalleryImage {
  src: string;
  alt: string;
  /** CSS grid: "span 2" for wide images, undefined for normal */
  colSpan?: 2;
  rowSpan?: 2;
}

export const galleryImages: GalleryImage[] = [
  {
    src: "/images/gallery/truck-night-rig.webp",
    alt: "Standard Safety truck at a drilling rig site at night",
    colSpan: 2,
    rowSpan: 2,
  },
  {
    src: "/images/gallery/company-truck-day.webp",
    alt: "Standard Safety & Supply branded truck",
    colSpan: 2,
  },
  {
    src: "/images/gallery/high-pressure-restraints.webp",
    alt: "High-pressure restraint systems on a frac site",
  },
  {
    src: "/images/gallery/wellhead-silos.webp",
    alt: "Wellhead equipment with storage silos in the background",
  },
  {
    src: "/images/gallery/crew-wellhead-crane.webp",
    alt: "Field crew working near a wellhead with a crane",
    colSpan: 2,
  },
  {
    src: "/images/gallery/fleet-heavy-equipment.webp",
    alt: "Standard Safety truck alongside heavy oilfield equipment",
  },
  {
    src: "/images/gallery/job-site-trucks.webp",
    alt: "Worker walking across a job site with service trucks",
  },
  {
    src: "/images/gallery/frac-equipment.webp",
    alt: "Frac equipment and flow-iron connections on location",
  },
  {
    src: "/images/gallery/wellhead-piping.webp",
    alt: "Wellhead piping and flow-iron on a Permian Basin site",
  },
  {
    src: "/images/gallery/job-site-overview.webp",
    alt: "Standard Safety vehicles and equipment at a busy job site",
  },
];
