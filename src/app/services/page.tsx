import { Metadata } from "next";
import {
  serviceCategories,
  serviceOfferings,
  serviceDetails,
} from "@/data/services";
import { galleryImages } from "@/data/gallery";
import { ServicesPageClient } from "@/components/sections/services-page-client";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Safety services for the oil & gas industry — H2S technicians, gas detection, equipment rental, restraint systems, fire extinguisher inspections, and more.",
};

export default function ServicesPage() {
  return (
    <ServicesPageClient
      categories={serviceCategories}
      offerings={serviceOfferings}
      details={serviceDetails}
      galleryImages={galleryImages}
    />
  );
}
