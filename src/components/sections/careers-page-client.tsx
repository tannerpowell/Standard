"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, MapPin, X } from "lucide-react";
import Link from "next/link";
import type { PaylocityJob } from "@/data/careers";
import type { JobDetails } from "@/data/careers-parse";

/* ─── Types ─── */

type JobWithUrls = PaylocityJob & { detailsUrl: string };

/* ─── Helpers ─── */

function relativeTime(dateString: string): string {
  const days = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / 86_400_000,
  );
  const months = Math.floor(days / 30);
  const weeks = Math.floor(days / 7);

  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  return "Today";
}

/** Extract sorted unique non-null values for a given field from a job list. */
function uniqueValues(
  jobs: PaylocityJob[],
  field: "LocationName" | "HiringDepartment",
): string[] {
  const set = new Set<string>();
  for (const job of jobs) {
    const value = job[field];
    if (value) set.add(value);
  }
  return Array.from(set).sort();
}

/* ─── Chip styles (white-on-red variant, matching /services) ─── */

const CHIP_BASE =
  "rounded-full px-5 py-2 font-[family-name:var(--font-jost)] text-sm font-medium transition-all";
const CHIP_ACTIVE = "bg-white text-[#d51f26]";
const CHIP_INACTIVE = "bg-white/15 text-white hover:bg-white/25";

/* ─── SVG noise texture (from CertCard) ─── */

const NOISE_BG =
  'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.75\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.025\'/%3E%3C/svg%3E")';

/* ─── Component ─── */

interface CareersPageClientProps {
  jobs: JobWithUrls[];
  detailsMap: Record<number, JobDetails>;
}

export function CareersPageClient({
  jobs,
  detailsMap,
}: CareersPageClientProps): React.JSX.Element {
  const [locationFilter, setLocationFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobWithUrls | null>(null);

  // Sort newest first
  const sortedJobs = useMemo(
    () =>
      [...jobs].sort(
        (a, b) =>
          new Date(b.PublishedDate).getTime() -
          new Date(a.PublishedDate).getTime(),
      ),
    [jobs],
  );

  const locations = useMemo(
    () => uniqueValues(sortedJobs, "LocationName"),
    [sortedJobs],
  );
  const departments = useMemo(
    () => uniqueValues(sortedJobs, "HiringDepartment"),
    [sortedJobs],
  );

  // Filter (AND)
  const filtered = useMemo(
    () =>
      sortedJobs.filter((job) => {
        const locMatch =
          locationFilter === "all" || job.LocationName === locationFilter;
        const deptMatch =
          departmentFilter === "all" ||
          job.HiringDepartment === departmentFilter;
        return locMatch && deptMatch;
      }),
    [sortedJobs, locationFilter, departmentFilter],
  );

  const hasJobs = jobs.length > 0;

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* ─── Hero ─── */}
      <section className="bg-[#d51f26] pt-12 pb-6">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h1 className="font-['StandardTX_Display'] text-[72px] font-normal leading-[0.8] tracking-[-0.01em] text-white sm:text-[100px]">
              CAREERS
            </h1>
            <div className="sm:mb-1 sm:text-right">
              <p className="font-[family-name:var(--font-jost)] text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Open Positions
              </p>
              <p className="font-['StandardTX_Display'] text-[36px] leading-[0.9] tracking-tight text-white sm:text-[48px]">
                {filtered.length} {filtered.length === 1 ? "ROLE" : "ROLES"}{" "}
                AVAILABLE
              </p>
            </div>
          </div>

          {/* Filter chips */}
          {hasJobs && (
            <div className="mt-10 space-y-3">
              <FilterChipRow
                label="All Locations"
                options={locations}
                active={locationFilter}
                onSelect={setLocationFilter}
              />
              {departments.length > 1 && (
                <FilterChipRow
                  label="All Departments"
                  options={departments}
                  active={departmentFilter}
                  onSelect={setDepartmentFilter}
                />
              )}
            </div>
          )}
        </div>
      </section>

      {/* ─── Job Cards ─── */}
      <section className="bg-[#fafafa] py-14 dark:bg-slate-800/20">
        <div className="container">
          {filtered.length > 0 ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${locationFilter}-${departmentFilter}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                {filtered.map((job, i) => (
                  <JobCard
                    key={job.JobId}
                    job={job}
                    index={i}
                    onSelect={setSelectedJob}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          ) : (
            <EmptyState hasAnyJobs={hasJobs} />
          )}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <section className="border-t border-slate-200 bg-[#fafafa] py-16 dark:border-slate-700 dark:bg-slate-800/20">
        <div className="container text-center">
          <h2 className="mb-3 font-['StandardTX_Display'] text-[36px] leading-[0.9] tracking-tight text-foreground sm:text-[48px]">
            DON&apos;T SEE YOUR ROLE?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            We&apos;re always looking for talented people. Send us your resume
            and we&apos;ll reach out when a position opens up.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-[#d51f26] px-8 py-3 font-[family-name:var(--font-jost)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c22]"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* ─── Job Detail Modal ─── */}
      <AnimatePresence>
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            details={detailsMap[selectedJob.JobId]}
            onClose={() => setSelectedJob(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Filter Chip Row ─── */

function FilterChipRow({
  label,
  options,
  active,
  onSelect,
}: {
  label: string;
  options: string[];
  active: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect("all")}
        className={`${CHIP_BASE} ${active === "all" ? CHIP_ACTIVE : CHIP_INACTIVE}`}
      >
        {label}
      </button>
      {options.map((option) => (
        <button
          key={option}
          onClick={() => onSelect(active === option ? "all" : option)}
          className={`${CHIP_BASE} ${active === option ? CHIP_ACTIVE : CHIP_INACTIVE}`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/* ─── Job Card ─── */

function JobCard({
  job,
  index,
  onSelect,
}: {
  job: JobWithUrls;
  index: number;
  onSelect: (job: JobWithUrls) => void;
}) {
  return (
    <motion.button
      type="button"
      aria-label={`View details for ${job.JobTitle}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onSelect(job)}
      className="group cursor-pointer rounded-[4px] border border-[#d5d7db] bg-[#eef0f2] p-[5px] transition-all duration-200 hover:-translate-y-[2px] dark:border-slate-600 dark:bg-slate-800"
      style={{
        boxShadow:
          "0 4px 8px rgba(0, 0, 0, 0.10), 0 1px 3px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        className="relative flex h-full flex-col overflow-hidden rounded-[3px] border border-[#e2e4e8] bg-[#fafafa] p-6 transition-colors duration-200 group-hover:bg-white dark:border-slate-600 dark:bg-slate-800/80"
        style={{
          boxShadow:
            "inset 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 0 0 0.5px rgba(255,255,255,0.7)",
          backgroundImage: NOISE_BG,
          backgroundSize: "100px 100px",
        }}
      >
        {/* Location + Date */}
        <div className="mb-3 flex items-center justify-between gap-3">
          {job.LocationName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d51f26]/10 px-3 py-1 font-[family-name:var(--font-jost)] text-xs font-semibold text-[#d51f26]">
              <MapPin className="h-3 w-3" />
              {job.LocationName}
            </span>
          )}
          <span className="ml-auto whitespace-nowrap font-[family-name:var(--font-jost)] text-xs text-slate-400">
            {relativeTime(job.PublishedDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-1 font-[family-name:var(--font-oswald)] text-xl font-semibold uppercase leading-snug tracking-wide text-foreground sm:text-2xl">
          {job.JobTitle}
        </h3>

        {/* Department */}
        {job.HiringDepartment && (
          <p className="mb-4 font-[family-name:var(--font-jost)] text-sm text-slate-500 dark:text-slate-400">
            {job.HiringDepartment}
          </p>
        )}

        {/* View Details hint */}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-jost)] text-sm font-medium text-slate-400 transition-colors group-hover:text-[#d51f26]">
            View Details
          </span>
        </div>
      </div>
    </motion.button>
  );
}

/* ─── Job Detail Modal ─── */

function JobDetailModal({
  job,
  details,
  onClose,
}: {
  job: JobWithUrls;
  details: JobDetails | undefined;
  onClose: () => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose],
  );

  const hasContent = details?.description || details?.requirements;

  return (
    <motion.div
      ref={overlayRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-[5vh] pb-[5vh] backdrop-blur-sm sm:p-8 sm:pt-[8vh]"
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.97 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-3xl rounded-lg bg-white shadow-2xl dark:bg-slate-900"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b border-slate-200 p-6 pb-5 pr-14 dark:border-slate-700">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {job.LocationName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d51f26]/10 px-3 py-1 font-[family-name:var(--font-jost)] text-xs font-semibold text-[#d51f26]">
                <MapPin className="h-3 w-3" />
                {job.LocationName}
              </span>
            )}
            <span className="font-[family-name:var(--font-jost)] text-xs text-slate-400">
              Posted {relativeTime(job.PublishedDate)}
            </span>
          </div>
          <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-semibold uppercase leading-snug tracking-wide text-foreground sm:text-3xl">
            {job.JobTitle}
          </h2>
          {job.HiringDepartment && (
            <p className="mt-1 font-[family-name:var(--font-jost)] text-sm text-slate-500 dark:text-slate-400">
              {job.HiringDepartment}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {hasContent ? (
            <div className="space-y-5">
              {details!.description && (
                <div
                  className="job-description font-[family-name:var(--font-jost)] text-base leading-[1.7] text-slate-900 dark:text-slate-200"
                  dangerouslySetInnerHTML={{
                    __html: details!.description,
                  }}
                />
              )}
              {details!.requirements && (
                <div>
                  <h3 className="mb-2 font-[family-name:var(--font-oswald)] text-base font-semibold uppercase tracking-wide text-foreground">
                    Requirements
                  </h3>
                  <div
                    className="job-description font-[family-name:var(--font-jost)] text-base leading-[1.7] text-slate-900 dark:text-slate-200"
                    dangerouslySetInnerHTML={{
                      __html: details!.requirements,
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <p className="py-8 text-center font-[family-name:var(--font-jost)] text-sm text-slate-400">
              No description available. View the full listing on Paylocity.
            </p>
          )}
        </div>

        {/* Footer — sticky apply button */}
        <div className="sticky bottom-0 flex items-center gap-3 border-t border-slate-200 bg-white/95 p-6 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
          <a
            href={job.detailsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#d51f26] px-7 py-3 font-[family-name:var(--font-jost)] text-sm font-semibold text-white transition-colors hover:bg-[#b91c22]"
          >
            Apply Now
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onClose}
            className="rounded-full px-5 py-3 font-[family-name:var(--font-jost)] text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ hasAnyJobs }: { hasAnyJobs: boolean }) {
  return (
    <div className="py-20 text-center">
      <p className="mb-3 font-['StandardTX_Display'] text-[36px] leading-[0.9] tracking-tight text-slate-300 sm:text-[48px] dark:text-slate-600">
        NO POSITIONS FOUND
      </p>
      <p className="mx-auto mb-6 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
        {hasAnyJobs
          ? "No jobs match your current filters. Try adjusting your selection or check back later."
          : "We don't have any open positions right now, but we're always growing. Reach out and we'll keep you in mind."}
      </p>
      <Link
        href="/contact"
        className="inline-flex items-center gap-2 rounded-full bg-[#d51f26] px-8 py-3 font-[family-name:var(--font-jost)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#b91c22]"
      >
        Contact Us
      </Link>
    </div>
  );
}
