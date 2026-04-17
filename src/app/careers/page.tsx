import { Metadata } from "next";
import {
  PAYLOCITY_PAGE_URL,
  PAYLOCITY_BASE,
  type PaylocityJob,
  type PaylocityPageData,
} from "@/data/careers";
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

    const marker = "window.pageData = ";
    const start = html.indexOf(marker);
    if (start === -1) return [];

    const jsonStart = html.indexOf("{", start + marker.length);
    if (jsonStart === -1) return [];
    let depth = 0;
    let jsonEnd = -1;
    let insideString = false;
    let prevChar = "";
    for (let i = jsonStart; i < html.length; i++) {
      const char = html[i];
      if (char === '"' && prevChar !== "\\") {
        insideString = !insideString;
      }
      if (!insideString) {
        if (char === "{") depth++;
        if (char === "}") depth--;
        if (depth === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
      prevChar = char;
    }
    if (jsonEnd === -1) return [];
    const raw = html.slice(jsonStart, jsonEnd);
    const parsed = JSON.parse(raw);

    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.Jobs)) {
      return [];
    }

    const pageData: PaylocityPageData = parsed;
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
