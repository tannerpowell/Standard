import { NextRequest, NextResponse } from "next/server";
import { PAYLOCITY_BASE } from "@/data/careers";
import { fetchJobDetails } from "@/data/careers-parse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  const { jobId } = await params;

  if (!/^\d+$/.test(jobId)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const details = await fetchJobDetails(PAYLOCITY_BASE, Number(jobId));

  if (!details.description && !details.requirements) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(details, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
