"use client";

import { cn } from "@/lib/utils";

const CHIP_BASE =
  "rounded-full px-5 py-2 font-[family-name:var(--font-body)] text-sm font-medium transition-all";

const variants = {
  hero: {
    active: "bg-white text-brand-red",
    inactive: "bg-white/15 text-white hover:bg-white/25",
  },
  page: {
    active: "bg-brand-red text-white",
    inactive:
      "bg-transparent text-slate-600 border border-slate-300 hover:border-slate-400 hover:text-slate-800 dark:text-slate-300 dark:border-slate-600 dark:hover:border-slate-500",
  },
};

interface FilterChipsProps {
  /** Label for the "all" chip */
  allLabel: string;
  options: { id: string; label: string }[];
  active: string;
  onSelect: (value: string) => void;
  variant?: "hero" | "page";
  className?: string;
}

export function FilterChips({
  allLabel,
  options,
  active,
  onSelect,
  variant = "hero",
  className,
}: FilterChipsProps) {
  const v = variants[variant];
  const chipClass = (isActive: boolean) =>
    cn(CHIP_BASE, isActive ? v.active : v.inactive, variant === "page" && "whitespace-nowrap");

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      <button
        type="button"
        onClick={() => onSelect("all")}
        aria-pressed={active === "all"}
        className={chipClass(active === "all")}
      >
        {allLabel}
      </button>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onSelect(active === opt.id ? "all" : opt.id)}
          aria-pressed={active === opt.id}
          className={chipClass(active === opt.id)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
