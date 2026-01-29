import { Metadata } from "next";
import {
  PAYLOCITY_PAGE_URL,
  PAYLOCITY_BASE,
  type PaylocityJob,
  type PaylocityPageData,
} from "@/data/careers";
import { fetchJobDetails, type JobDetails } from "@/data/careers-parse";
import { CareersPageClient } from "@/components/sections/careers-page-client";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Standard Safety & Supply — view open positions across the Permian Basin, New Mexico, North Dakota, and beyond.",
};

async function getJobs(): Promise<PaylocityJob[]> {
  try {
    const res = await fetch(PAYLOCITY_PAGE_URL, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const marker = "window.pageData = ";
    const start = html.indexOf(marker);
    if (start === -1) return [];

    const jsonStart = start + marker.length;
    let depth = 0;
    let jsonEnd = jsonStart;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      if (html[i] === "}") depth--;
      if (depth === 0) {
        jsonEnd = i + 1;
        break;
      }
    }

    const raw = html.slice(jsonStart, jsonEnd);
    const pageData: PaylocityPageData = JSON.parse(raw);
    return pageData.Jobs ?? [];
  } catch {
    return [];
  }
}

async function getAllJobDetails(
  jobs: PaylocityJob[],
): Promise<Record<number, JobDetails>> {
  const entries = await Promise.all(
    jobs.map(async (job) => {
      const details = await fetchJobDetails(PAYLOCITY_BASE, job.JobId);
      return [job.JobId, details] as const;
    }),
  );
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
