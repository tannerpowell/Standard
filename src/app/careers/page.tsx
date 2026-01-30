import { Metadata } from "next";
import {
  PAYLOCITY_PAGE_URL,
  PAYLOCITY_BASE,
  type PaylocityJob,
  type PaylocityPageData,
} from "@/data/careers";
import { fetchJobDetails, type JobDetails } from "@/data/careers-parse";
import { CareersPageClient } from "@/components/sections/careers-page-client";

const REVALIDATE_SECONDS = 1800;

export const revalidate = REVALIDATE_SECONDS;

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Standard Safety & Supply — view open positions across the Permian Basin, New Mexico, North Dakota, and beyond.",
};

async function getJobs(): Promise<PaylocityJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(PAYLOCITY_PAGE_URL, {
      next: { revalidate: REVALIDATE_SECONDS },
      signal: controller.signal,
    });

    if (!res.ok) return [];
    const html = await res.text();

    const marker = "window.pageData = ";
    const start = html.indexOf(marker);
    if (start === -1) return [];

    const jsonStart = html.indexOf("{", start + marker.length);
    if (jsonStart === -1) return [];
    let depth = 0;
    let jsonEnd = -1;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      if (html[i] === "}") depth--;
      if (depth === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
    if (jsonEnd === -1) return [];
    const raw = html.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(raw);

    // Validate that the parsed object conforms to expected shape
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.Jobs)) {
      return [];
    }

    const pageData: PaylocityPageData = parsed;
    return pageData.Jobs ?? [];
  } catch (err) {
    console.error("Failed to fetch careers/jobs during ISR revalidation", {
      url: PAYLOCITY_PAGE_URL,
      timeout: 10000,
      error: {
        name: err instanceof Error ? err.name : "Unknown",
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
      },
    });
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function getAllJobDetails(
  jobs: PaylocityJob[],
): Promise<Record<number, JobDetails>> {
  const CONCURRENCY_LIMIT = 5;
  const entries: Array<readonly [number, JobDetails]> = [];

  // Process jobs in batches to limit concurrent requests
  for (let i = 0; i < jobs.length; i += CONCURRENCY_LIMIT) {
    const batch = jobs.slice(i, i + CONCURRENCY_LIMIT);
    const batchResults = await Promise.all(
      batch.map(async (job) => {
        const details = await fetchJobDetails(PAYLOCITY_BASE, job.JobId);
        return [job.JobId, details] as const;
      }),
    );
    entries.push(...batchResults);
  }

  return Object.fromEntries(entries);
}

function buildDetailsUrl(jobId: number): string {
  return `${PAYLOCITY_BASE}/Recruiting/Jobs/Details/${jobId}`;
}

export default async function CareersPage() {
  const jobs = await getJobs();
  const detailsMap = await getAllJobDetails(jobs);

  const jobsWithUrls = jobs.map((job) => ({
    ...job,
    detailsUrl: buildDetailsUrl(job.JobId),
  }));

  return <CareersPageClient jobs={jobsWithUrls} detailsMap={detailsMap} />;
}
