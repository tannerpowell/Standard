import { Metadata } from "next";
import { Hero } from "@/components/sections/hero";
import { FocusPillars } from "@/components/sections/focus-pillars";
import { ServicesPreview } from "@/components/sections/services-preview";

export const metadata: Metadata = {
  title: "Home",
  description: "Welcome to Standard. Discover our services and expertise.",
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FocusPillars />
      <ServicesPreview />
    </>
  );
}
