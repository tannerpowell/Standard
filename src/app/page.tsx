import { Hero } from "@/components/sections/hero";
import { FocusPillars } from "@/components/sections/focus-pillars";
import { ServicesPreview } from "@/components/sections/services-preview";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FocusPillars />
      <ServicesPreview />
    </>
  );
}
