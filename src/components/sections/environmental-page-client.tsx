"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check, Droplets, FileCheck, Leaf, Recycle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  environmentalServices,
  type EnvironmentalIconName,
  type EnvironmentalService,
} from "@/data/environmental";

const iconMap: Record<EnvironmentalIconName, typeof Leaf> = {
  leaf: Leaf,
  droplets: Droplets,
  recycle: Recycle,
  fileCheck: FileCheck,
};

interface ServiceSectionProps {
  service: EnvironmentalService;
  index: number;
}

function ServiceSection({ service, index }: ServiceSectionProps): React.ReactNode {
  const Icon = iconMap[service.iconName];
  const isEven = index % 2 === 0;
  const number = String(index + 1).padStart(2, "0");

  return (
    <section
      className={isEven ? "bg-[#fafafa] py-16 dark:bg-slate-800/20" : "py-16"}
    >
      <div className="container">
        <div
          className={cn(
            "flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-16",
            !isEven && "lg:flex-row-reverse"
          )}
        >
          {/* Image */}
          <div className="lg:w-1/2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[4px]">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>

          {/* Text + Features */}
          <div className="lg:w-1/2">
            <span className="font-[family-name:var(--font-display)] text-[80px] leading-none text-slate-200 dark:text-slate-700">
              {number}
            </span>
            <div className="-mt-4 mb-4 flex items-center gap-3">
              <Icon className="h-6 w-6 shrink-0 text-brand-red" />
              <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-semibold uppercase tracking-wide text-foreground sm:text-3xl">
                {service.title}
              </h2>
            </div>
            <p className="mb-6 leading-relaxed text-slate-600 dark:text-slate-300">
              {service.description}
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {service.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-red" />
                  <span className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function EnvironmentalPageClient(): React.ReactNode {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section ref={heroRef} className="relative min-h-[70vh] overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y }}>
          <Image
            src="/images/environmental-hero.webp"
            alt="Aerial view of Earth — Environmental services"
            fill
            className="scale-110 object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/45" />
        </motion.div>
        <div className="container relative z-10 flex min-h-[70vh] flex-col justify-center py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h1 className="font-[family-name:var(--font-display)] text-[60px] font-normal leading-[0.8] tracking-[-0.01em] text-white sm:text-[100px]">
              ENVIRONMENTAL
            </h1>
            <p className="max-w-xl text-[15px] font-medium leading-relaxed text-white/75 sm:mb-1">
              Standard Safety&rsquo;s Environmental Division is the turn-key
              solution for all your petrochemical environmental issues. Our
              management group has over 100 years of combined experience in the
              environmental remediation industry.
            </p>
          </div>
        </div>
      </section>

      {/* Service Detail Sections */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {environmentalServices.map((service, index) => (
          <ServiceSection key={service.id} service={service} index={index} />
        ))}
      </div>
    </div>
  );
}
