"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Shield } from "lucide-react";
import type {
  ServiceCategory,
  ServiceDetail,
  ServiceOffering,
} from "@/data/services";
import { ICON_MAP } from "@/data/services";
import type { GalleryImage } from "@/data/gallery";
import { PhotoGallery } from "@/components/shared/photo-gallery";

const CHIP_BASE =
  "rounded-full px-5 py-2 font-[family-name:var(--font-jost)] text-sm font-medium transition-all";
const CHIP_ACTIVE = "bg-white text-[#d51f26]";
const CHIP_INACTIVE = "bg-white/15 text-white hover:bg-white/25";

interface ServicesPageClientProps {
  categories: ServiceCategory[];
  offerings: ServiceOffering[];
  details: ServiceDetail[];
  galleryImages: GalleryImage[];
}

export function ServicesPageClient({
  categories,
  offerings,
  details,
  galleryImages,
}: ServicesPageClientProps): React.JSX.Element {
  const [activeChip, setActiveChip] = useState("all");

  const filteredOfferings =
    activeChip === "all"
      ? offerings
      : offerings.filter((offering) => offering.category === activeChip);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <section className="bg-[#d51f26] pt-12 pb-6">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h1 className="font-['StandardTX_Display'] text-[72px] font-normal leading-[0.8] tracking-[-0.01em] text-white sm:text-[100px]">
              SERVICES
            </h1>
            <p className="max-w-xl text-[15px] font-medium leading-relaxed text-white/75 sm:mb-1">
              Comprehensive safety services for oil and gas operations across
              the Permian Basin — from H2S technicians and gas detection to
              equipment rental and fire extinguisher inspections.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveChip("all")}
              aria-pressed={activeChip === "all"}
              className={`${CHIP_BASE} ${activeChip === "all" ? CHIP_ACTIVE : CHIP_INACTIVE}`}
            >
              All Services
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveChip(cat.id)}
                aria-pressed={activeChip === cat.id}
                className={`${CHIP_BASE} ${activeChip === cat.id ? CHIP_ACTIVE : CHIP_INACTIVE}`}
              >
                {cat.title}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fafafa] py-20 dark:bg-slate-800/20">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChip}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex flex-wrap gap-3"
            >
              {filteredOfferings.map((offering, i) => (
                <motion.div
                  key={offering.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02, duration: 0.2 }}
                  className="rounded-lg bg-[#efefef] px-5 py-3 font-[family-name:var(--font-jost)] text-[15px] font-medium text-foreground dark:bg-slate-700 dark:text-slate-200"
                >
                  {offering.title}
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <section
        id="service-details"
        className="bg-slate-50 py-14 dark:bg-slate-800/30"
      >
        <div className="container">
          <h2 className="mb-2 font-[family-name:var(--font-jost)] text-xs font-bold uppercase tracking-[0.2em] text-[#d51f26]">
            What We Offer
          </h2>
          <p className="mb-12 font-['StandardTX_Display'] text-[48px] leading-[0.9] tracking-tight text-foreground sm:text-[64px]">
            THE FULL PICTURE
          </p>
          <div className="space-y-24">
            {details.map((detail, i) => (
              <DetailSection key={detail.id} detail={detail} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container">
          <h2 className="mb-2 font-[family-name:var(--font-jost)] text-xs font-bold uppercase tracking-[0.2em] text-[#d51f26]">
            In the Field
          </h2>
          <p className="mb-8 font-['StandardTX_Display'] text-[48px] leading-[0.9] tracking-tight text-foreground sm:text-[64px]">
            OUR WORK
          </p>
          <PhotoGallery images={galleryImages} />
        </div>
      </section>
    </div>
  );
}

/* ─── Detail Section ─── */

interface DetailSectionProps {
  detail: ServiceDetail;
  index: number;
}

function DetailSection({
  detail,
  index,
}: DetailSectionProps): React.JSX.Element {
  const isReversed = index % 2 !== 0;
  const number = String(index + 1).padStart(2, "0");
  const Icon = ICON_MAP[detail.iconName] ?? Shield;

  return (
    <div
      className={`flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16 ${
        isReversed ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="lg:w-1/2">
        <span className="font-['StandardTX_Display'] text-[80px] leading-none text-slate-200 dark:text-slate-700">
          {number}
        </span>
        <div className="-mt-4 mb-4 flex items-center gap-3">
          <Icon className="h-6 w-6 shrink-0 text-[#d51f26]" />
          <h3 className="font-[family-name:var(--font-oswald)] text-3xl font-semibold uppercase tracking-wide text-foreground">
            {detail.title}
          </h3>
        </div>
        <p className="leading-relaxed text-slate-600 dark:text-slate-300">
          {detail.description}
        </p>
      </div>

      <div className="lg:w-1/2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {detail.features.map((feature, featureIndex) => (
            <div key={`${feature}-${featureIndex}`} className="flex items-start gap-3">
              <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#d51f26]" />
              <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
