import { Metadata } from "next";
import {
  PAYLOCITY_PAGE_URL,
  PAYLOCITY_BASE,
  type PaylocityJob,
  type PaylocityPageData,
} from "@/data/careers";
import { parsePaylocityPageData } from "@/data/paylocity-page-data.mjs";
import { CareersPageClient } from "@/components/sections/careers-page-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Careers",
  description:
    "Join Standard Safety & Supply — view open positions across the Permian Basin, New Mexico, North Dakota, and beyond.",
};

async function getJobs(): Promise<PaylocityJob[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(PAYLOCITY_PAGE_URL, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) return [];
    const html = await res.text();
    const parsed = parsePaylocityPageData(html);

    if (
      !parsed ||
      typeof parsed !== "object" ||
      !Array.isArray((parsed as { Jobs?: unknown }).Jobs)
    ) {
      return [];
    }

    const pageData = parsed as PaylocityPageData;
    return pageData.Jobs ?? [];
  } catch (err) {
    console.error("Failed to fetch Paylocity jobs", {
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

function buildDetailsUrl(jobId: number): string {
  return `${PAYLOCITY_BASE}/Recruiting/Jobs/Details/${jobId}`;
}

export default async function CareersPage() {
  const jobs = await getJobs();

  const jobsWithUrls = jobs.map((job) => ({
    ...job,
    detailsUrl: buildDetailsUrl(job.JobId),
  }));

  return <CareersPageClient jobs={jobsWithUrls} />;
}
