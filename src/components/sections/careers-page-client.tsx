"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, MapPin, X } from "lucide-react";
import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { PAYLOCITY_PAGE_URL, type PaylocityJob } from "@/data/careers";
import type { JobDetails } from "@/data/careers-parse";
import { FilterChips } from "@/components/shared/filter-chips";
import { NOISE_BG } from "@/components/shared/patterns";

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

/* ─── Component ─── */

interface CareersPageClientProps {
  jobs: JobWithUrls[];
}

export function CareersPageClient({
  jobs,
}: CareersPageClientProps): React.JSX.Element {
  const [locationFilter, setLocationFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState<JobWithUrls | null>(null);
  const [detailsCache, setDetailsCache] = useState<
    Record<number, JobDetails>
  >({});
  const [loadingJobId, setLoadingJobId] = useState<number | null>(null);

  // Ref mirror of detailsCache lets handleSelect read the latest cache without
  // re-creating the callback on every fetch (which would re-render every card).
  const detailsCacheRef = useRef(detailsCache);
  detailsCacheRef.current = detailsCache;

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleSelect = useCallback((job: JobWithUrls) => {
    setSelectedJob(job);
    if (detailsCacheRef.current[job.JobId]) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingJobId(job.JobId);

    fetch(`/api/careers/${job.JobId}`, { signal: controller.signal })
      .then(async (res) => {
        if (res.ok) return (await res.json()) as JobDetails;
        // 404 = Paylocity returned a page with no description/requirements.
        // Cache a sentinel so repeat clicks don't re-fetch.
        if (res.status === 404) {
          return { description: "", requirements: "" } as JobDetails;
        }
        return null;
      })
      .then((data) => {
        if (controller.signal.aborted || !data) return;
        setDetailsCache((prev) => ({ ...prev, [job.JobId]: data }));
      })
      .catch(() => {
        // Swallow abort + network errors. Network errors stay uncached so
        // reopening the modal retries.
      })
      .finally(() => {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setLoadingJobId(null);
        }
      });
  }, []);

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
      <section className="bg-brand-red pt-12 pb-6">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <h1 className="font-[family-name:var(--font-display)] text-[72px] font-normal leading-[0.8] tracking-[-0.01em] text-white sm:text-[100px]">
              CAREERS
            </h1>
            <div className="sm:mb-1 sm:text-right">
              <p className="font-[family-name:var(--font-body)] text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                Open Positions
              </p>
              <p className="font-[family-name:var(--font-display)] text-[36px] leading-[0.9] tracking-tight text-white sm:text-[48px]">
                {filtered.length} {filtered.length === 1 ? "ROLE" : "ROLES"}{" "}
                AVAILABLE
              </p>
            </div>
          </div>

          {/* Filter chips */}
          {hasJobs && (
            <div className="mt-10 space-y-3">
              <FilterChips
                allLabel="All Locations"
                options={locations.map((l) => ({ id: l, label: l }))}
                active={locationFilter}
                onSelect={setLocationFilter}
              />
              {departments.length > 1 && (
                <FilterChips
                  allLabel="All Departments"
                  options={departments.map((d) => ({ id: d, label: d }))}
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
                    onSelect={handleSelect}
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
          <h2 className="mb-3 font-[family-name:var(--font-display)] text-[36px] leading-[0.9] tracking-tight text-foreground sm:text-[48px]">
            DON&apos;T SEE YOUR ROLE?
          </h2>
          <p className="mx-auto mb-6 max-w-lg text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
            We&apos;re always looking for talented people. Send us your resume
            and we&apos;ll reach out when a position opens up.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-red-dark"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* ─── Job Detail Modal ─── */}
      <JobDetailModal
        job={selectedJob}
        details={selectedJob ? detailsCache[selectedJob.JobId] : undefined}
        loading={selectedJob !== null && loadingJobId === selectedJob.JobId}
        open={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
      />
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-3 py-1 font-[family-name:var(--font-body)] text-xs font-semibold text-brand-red">
              <MapPin className="h-3 w-3" />
              {job.LocationName}
            </span>
          )}
          <span className="ml-auto whitespace-nowrap font-[family-name:var(--font-body)] text-xs text-slate-400">
            {relativeTime(job.PublishedDate)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-1 font-[family-name:var(--font-oswald)] text-xl font-semibold uppercase leading-snug tracking-wide text-foreground sm:text-2xl">
          {job.JobTitle}
        </h3>

        {/* Department */}
        {job.HiringDepartment && (
          <p className="mb-4 font-[family-name:var(--font-body)] text-sm text-slate-500 dark:text-slate-400">
            {job.HiringDepartment}
          </p>
        )}

        {/* View Details hint */}
        <div className="mt-auto pt-4">
          <span className="inline-flex items-center gap-2 font-[family-name:var(--font-body)] text-sm font-medium text-slate-400 transition-colors group-hover:text-brand-red">
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
  loading,
  open,
  onClose,
}: {
  job: JobWithUrls | null;
  details: JobDetails | undefined;
  loading: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const hasContent = details?.description || details?.requirements;

  if (!job) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(isOpen) => { if (!isOpen) onClose(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 pt-[5vh] pb-[5vh] outline-none sm:p-8 sm:pt-[8vh]"
          aria-describedby={hasContent ? "job-description-content" : undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            {job.JobTitle} - Job Details
          </DialogPrimitive.Title>

          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-3xl rounded-lg bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Close button */}
            <DialogPrimitive.Close
              type="button"
              aria-label="Close dialog"
              className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>

            {/* Header */}
            <div className="border-b border-slate-200 p-6 pb-5 pr-14 dark:border-slate-700">
              <div className="mb-3 flex flex-wrap items-center gap-3">
                {job.LocationName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-red/10 px-3 py-1 font-[family-name:var(--font-body)] text-xs font-semibold text-brand-red">
                    <MapPin className="h-3 w-3" />
                    {job.LocationName}
                  </span>
                )}
                <span className="font-[family-name:var(--font-body)] text-xs text-slate-400">
                  Posted {relativeTime(job.PublishedDate)}
                </span>
              </div>
              <h2 className="font-[family-name:var(--font-oswald)] text-2xl font-semibold uppercase leading-snug tracking-wide text-foreground sm:text-3xl">
                {job.JobTitle}
              </h2>
              {job.HiringDepartment && (
                <p className="mt-1 font-[family-name:var(--font-body)] text-sm text-slate-500 dark:text-slate-400">
                  {job.HiringDepartment}
                </p>
              )}
            </div>

            {/* Body */}
            <div id="job-description-content" className="max-h-[60vh] overflow-y-auto p-6">
              {hasContent ? (
                <div className="space-y-5">
                  {details!.description && (
                    <div
                      className="job-description font-[family-name:var(--font-body)] text-base leading-[1.7] text-slate-900 dark:text-slate-200"
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
                        className="job-description font-[family-name:var(--font-body)] text-base leading-[1.7] text-slate-900 dark:text-slate-200"
                        dangerouslySetInnerHTML={{
                          __html: details!.requirements,
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-16 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <p className="py-8 text-center font-[family-name:var(--font-body)] text-sm text-slate-400">
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
                className="inline-flex items-center gap-2 rounded-full bg-brand-red px-7 py-3 font-[family-name:var(--font-body)] text-sm font-semibold text-white transition-colors hover:bg-brand-red-dark"
              >
                Apply Now
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <DialogPrimitive.Close
                type="button"
                className="rounded-full px-5 py-3 font-[family-name:var(--font-body)] text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Close
              </DialogPrimitive.Close>
            </div>
          </motion.div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

/* ─── Empty State ─── */

function EmptyState({ hasAnyJobs }: { hasAnyJobs: boolean }) {
  return (
    <div className="py-20 text-center">
      <p className="mb-3 font-[family-name:var(--font-display)] text-[36px] leading-[0.9] tracking-tight text-slate-300 sm:text-[48px] dark:text-slate-600">
        NO POSITIONS FOUND
      </p>
      <p className="mx-auto mb-6 max-w-md text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
        {hasAnyJobs
          ? "No jobs match your current filters. Try adjusting your selection or check back later."
          : "Check Paylocity for the full list of current openings, or reach out and we'll keep you in mind as roles open up."}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {!hasAnyJobs && (
          <a
            href={PAYLOCITY_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-red-dark"
          >
            View Openings on Paylocity
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
        <Link
          href="/contact"
          className={
            hasAnyJobs
              ? "inline-flex items-center gap-2 rounded-full bg-brand-red px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-red-dark"
              : "inline-flex items-center gap-2 rounded-full border border-slate-300 px-8 py-3 font-[family-name:var(--font-body)] text-sm font-semibold uppercase tracking-wider text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          }
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
