import { Metadata } from "next";
import { EnvironmentalPageClient } from "@/components/sections/environmental-page-client";

export const metadata: Metadata = {
  title: "Environmental Services",
  description:
    "Turn-key environmental solutions — earthworks, LDAR emissions testing, remediation, tank cleaning & waste management for the oil & gas industry.",
};

export default function EnvironmentalPage() {
  return <EnvironmentalPageClient />;
}
