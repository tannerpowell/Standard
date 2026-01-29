"use client";

import { Shield, HardHat, Truck, Flame, Wind, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IconName } from "@/data/services";

const iconMap = {
  shield: Shield,
  hardHat: HardHat,
  truck: Truck,
  flame: Flame,
  wind: Wind,
  wrench: Wrench,
};

interface ServiceCardProps {
  title: string;
  description: string;
  iconName: IconName;
  features?: string[];
  className?: string;
  variant?: "default" | "compact";
}

export function ServiceCard({
  title,
  description,
  iconName,
  features,
  className,
  variant = "default",
}: ServiceCardProps) {
  const Icon = iconMap[iconName];

  return (
    <div
      className={cn(
        "group h-full bg-white dark:bg-slate-800 p-6",
        // Visible border
        "border-2 border-slate-200 dark:border-slate-700",
        // Shadow for depth
        "shadow-[0_4px_20px_-4px_rgba(0,0,0,0.12)]",
        // Hover state
        "transition-all duration-300",
        "hover:border-[#2a3583] hover:shadow-[0_8px_30px_-4px_rgba(42,53,131,0.2)]",
        className
      )}
    >
      {/* Icon */}
      <div className="mb-5 inline-flex h-14 w-14 items-center justify-center bg-[#2a3583] text-white transition-colors duration-300 group-hover:bg-[#d51f26]">
        <Icon className="h-7 w-7" />
      </div>

      {/* Title */}
      <h3 className="mb-3 font-[family-name:var(--font-oswald)] text-xl font-semibold uppercase tracking-wide text-[#2a3583] dark:text-white">
        {title}
      </h3>

      {/* Description */}
      <p className="mb-4 text-slate-600 dark:text-slate-300 leading-relaxed">
        {description}
      </p>

      {/* Features list */}
      {variant === "default" && features && features.length > 0 && (
        <ul className="space-y-2">
          {features.slice(0, 4).map((feature) => (
            <li key={feature} className="flex items-center gap-2.5 text-sm">
              <div className="h-1.5 w-1.5 shrink-0 bg-[#d51f26]" />
              <span className="text-slate-600 dark:text-slate-300">{feature}</span>
            </li>
          ))}
          {features.length > 4 && (
            <li className="text-sm text-slate-500 dark:text-slate-400">
              +{features.length - 4} more
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
