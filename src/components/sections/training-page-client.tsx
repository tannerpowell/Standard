"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { WorkforceSpecialist, CourseCategory } from "@/data/training";
import { FilterChips } from "@/components/shared/filter-chips";
import { NOISE_BG } from "@/components/shared/patterns";

interface TrainingPageClientProps {
  specialists: WorkforceSpecialist[];
  categories: CourseCategory[];
  totalCourses: number;
}

export function TrainingPageClient({
  specialists,
  categories,
  totalCourses,
}: TrainingPageClientProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const visibleCategories =
    activeCategory === "all"
      ? categories
      : categories.filter((c) => c.id === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* Hero */}
      <section className="bg-brand-red pt-12 pb-6">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h1 className="font-['StandardTX_Display'] text-[72px] font-normal leading-[0.8] tracking-[-0.01em] text-white sm:text-[100px]">
              TRAINING
            </h1>
            <p className="max-w-xl text-[15px] font-medium leading-relaxed text-white/75 sm:mb-1">
              Standard Safety provides wide-ranging workplace training and
              instruction solutions for its energy industry clients. Experienced
              certified instructors lead all training courses.
            </p>
          </div>
        </div>
      </section>

      {/* Workforce Specialists */}
      <section className="bg-white py-14 dark:bg-slate-900">
        <div className="container">
          <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div>
              <h2 className="mb-2 font-[family-name:var(--font-body)] text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
                Our People
              </h2>
              <p className="font-['StandardTX_Display'] text-[40px] leading-[0.9] tracking-tight text-foreground sm:text-[52px]">
                WORKFORCE SPECIALISTS
                <br />& CERTIFICATIONS
              </p>
            </div>
            <p className="max-w-md text-[15px] leading-relaxed text-slate-600 sm:mb-1 dark:text-slate-300">
              Standard&apos;s workforce includes specialists trained in a
              variety of safety areas with numerous certifications achieved.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {specialists.map((spec) => (
              <CertCard key={spec.title} spec={spec} />
            ))}
          </div>
        </div>
      </section>

      {/* Chips — between sections */}
      <section className="border-y border-slate-200 bg-white py-5 dark:border-slate-700 dark:bg-slate-900">
        <div className="container">
          <FilterChips
            allLabel="All"
            options={categories.map((c) => ({ id: c.id, label: c.title }))}
            active={activeCategory}
            onSelect={setActiveCategory}
            variant="page"
            className="overflow-x-auto"
          />
        </div>
      </section>

      {/* Safety Courses */}
      <section className="bg-[#fafafa] py-14 dark:bg-slate-800/20">
        <div className="container">
          <h2 className="mb-2 font-[family-name:var(--font-body)] text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
            Curriculum
          </h2>
          <p className="mb-10 font-['StandardTX_Display'] text-[40px] leading-[0.9] tracking-tight text-foreground sm:text-[52px]">
            SAFETY COURSES
            <span className="ml-3 text-[28px] font-normal text-slate-400 sm:text-[32px]">
              {totalCourses}
            </span>
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {visibleCategories.map((cat) => (
                <div key={cat.id}>
                  <h3 className="mb-4 font-[family-name:var(--font-oswald)] text-2xl font-semibold uppercase tracking-wide text-foreground">
                    {cat.title}
                    <span className="ml-2 text-base font-normal normal-case tracking-normal text-slate-400">
                      {cat.courses.length}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {cat.courses.map((course, i) => (
                      <motion.div
                        key={course}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.015, duration: 0.2 }}
                        className="rounded-lg border border-[#e0e2e6] bg-white px-5 py-3 font-[family-name:var(--font-body)] text-[15px] font-medium text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.06)] dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
                      >
                        {course}
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

/* ─── Certification Card ─── */

function CertCard({ spec }: { spec: WorkforceSpecialist }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovering: false });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTilt({
      rotateX: (0.5 - y) * 12,
      rotateY: (x - 0.5) * 12,
      glareX: x * 100,
      glareY: y * 100,
      hovering: true,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50, hovering: false });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-[4px] border border-[#d5d7db] bg-[#eef0f2] p-[5px] dark:border-slate-600 dark:bg-slate-800"
      style={{
        boxShadow: tilt.hovering
          ? "0 8px 20px rgba(0, 0, 0, 0.14), 0 2px 6px rgba(0, 0, 0, 0.08)"
          : "0 4px 8px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06)",
        transform: `perspective(600px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: "transform 0.15s ease-out, box-shadow 0.25s ease-out",
      }}
    >
      {/* Inner card */}
      <div
        className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-[3px] border border-[#e2e4e8] px-4 py-5 text-center dark:border-slate-600 dark:bg-slate-800/80"
        style={{
          backgroundColor: tilt.hovering ? "#ffffff" : "#fafafa",
          boxShadow:
            "inset 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 0.5px rgba(255,255,255,0.7)",
          transition: "background-color 0.2s ease-out",
          backgroundImage: NOISE_BG,
          backgroundSize: "100px 100px",
        }}
      >
        {/* Glare reflection */}
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150"
          style={{
            opacity: tilt.hovering ? 0.15 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, white 0%, transparent 60%)`,
          }}
        />
        <p className="relative font-[family-name:var(--font-oswald)] text-[14px] font-semibold uppercase leading-snug tracking-wide text-foreground sm:text-[15px]">
          {spec.title}
        </p>
        {spec.detail && (
          <p className="relative mt-1 text-xs italic leading-snug text-slate-500 dark:text-slate-400">
            {spec.detail}
          </p>
        )}
      </div>
    </div>
  );
}
