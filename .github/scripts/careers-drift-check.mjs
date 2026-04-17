#!/usr/bin/env node
/**
 * Careers drift check.
 *
 * Runs on a cron. Catches three failure modes that could sneak past users:
 *   1. Live /careers page not returning 200
 *   2. Job list on the live page drifts from Paylocity's source of truth
 *   3. Detail API (/api/careers/[jobId]) 500s or returns empty
 *
 * On drift: opens (or comments on) a GitHub issue. Repo owner gets emailed
 * by GitHub's default notification settings — no extra secrets needed.
 * On recovery: closes the open drift issue with a note.
 */

import { execSync } from "node:child_process";

const LIVE_URL = "https://standardtx.com/careers";
const API_URL_BASE = "https://standardtx.com/api/careers";
const PAYLOCITY_URL =
  "https://recruiting.paylocity.com/recruiting/jobs/All/d2425347-8730-4740-80b0-7534e08fd29f/Standard-Safety-Supply";
const ISSUE_TITLE = "[careers-drift-alert] Careers page out of sync with Paylocity";

const USER_AGENT = "standard-tx-careers-monitor/1.0";
const FETCH_TIMEOUT_MS = 15_000;

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function fetchText(url, label) {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    return {
      ok: res.ok,
      status: res.status,
      text: res.ok ? await res.text() : "",
      label,
      url,
    };
  } catch (e) {
    return { ok: false, status: 0, text: "", label, url, error: e.message };
  }
}

function parsePaylocityPageData(html) {
  const marker = "window.pageData = ";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("Paylocity pageData marker missing");
  const jsonStart = html.indexOf("{", start + marker.length);
  let depth = 0;
  let jsonEnd = -1;
  let inString = false;
  // Walk the JSON byte by byte. When inside a string, a `\` always consumes
  // the next character as part of an escape sequence — that correctly handles
  // `\"`, `\\`, and the tricky `\\"` (escaped backslash followed by the
  // closing quote).
  for (let i = jsonStart; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (c === "\\") {
        i++; // skip escaped char; for-loop i++ advances past it
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }
  if (jsonEnd === -1) throw new Error("Paylocity pageData JSON unterminated");
  return JSON.parse(html.slice(jsonStart, jsonEnd));
}

function extractLiveTitles(html) {
  return [...html.matchAll(/aria-label="View details for ([^"]+)"/g)]
    .map((m) => decodeEntities(m[1]))
    .sort();
}

function extractLiveChips(html) {
  return [
    ...html.matchAll(
      /<button[^>]*type="button"[^>]*aria-pressed="[^"]*"[^>]*>([^<]+)<\/button>/g,
    ),
  ]
    .map((m) => decodeEntities(m[1]).trim())
    .sort();
}

function uniqueField(jobs, field) {
  const set = new Set();
  for (const job of jobs) {
    const value =
      field === "LocationName" ? job.LocationName : job.HiringDepartment;
    if (value) set.add(value);
  }
  return [...set].sort();
}

function setDiff(a, b) {
  const aSet = new Set(a);
  const bSet = new Set(b);
  return {
    onlyInA: [...aSet].filter((x) => !bSet.has(x)).sort(),
    onlyInB: [...bSet].filter((x) => !aSet.has(x)).sort(),
  };
}

async function checkDetailEndpoint(jobId) {
  const url = `${API_URL_BASE}/${jobId}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return { ok: false, reason: `HTTP ${res.status}`, url };
    const data = await res.json();
    const descLen = data.description?.length ?? 0;
    const reqLen = data.requirements?.length ?? 0;
    if (descLen === 0 && reqLen === 0) {
      return { ok: false, reason: "empty description + requirements", url };
    }
    return { ok: true, descLen, reqLen, url };
  } catch (e) {
    return { ok: false, reason: `request error: ${e.message}`, url };
  }
}

function gh(args) {
  return execSync(`gh ${args}`, {
    encoding: "utf8",
    env: { ...process.env, GH_PAGER: "cat" },
  });
}

function findOpenDriftIssue() {
  try {
    const out = gh(
      `issue list --state open --json number,title --limit 50`,
    );
    const issues = JSON.parse(out);
    return issues.find((i) => i.title === ISSUE_TITLE);
  } catch (e) {
    console.error("gh issue list failed:", e.message);
    return null;
  }
}

function createIssue(body) {
  const bodyFile = `/tmp/careers-drift-${Date.now()}.md`;
  execSync(`cat > "${bodyFile}"`, { input: body });
  try {
    gh(`issue create --title "${ISSUE_TITLE}" --body-file "${bodyFile}"`);
  } finally {
    execSync(`rm -f "${bodyFile}"`);
  }
}

function commentIssue(number, body) {
  const bodyFile = `/tmp/careers-drift-comment-${Date.now()}.md`;
  execSync(`cat > "${bodyFile}"`, { input: body });
  try {
    gh(`issue comment ${number} --body-file "${bodyFile}"`);
  } finally {
    execSync(`rm -f "${bodyFile}"`);
  }
}

function closeIssue(number, body) {
  commentIssue(number, body);
  gh(`issue close ${number}`);
}

async function main() {
  const problems = [];
  const stamp = new Date().toISOString();
  // Tracks whether we actually ran a full sync comparison. Recovery (closing
  // an open drift issue) must require this — otherwise a transient Paylocity
  // outage could silently auto-close a still-real drift.
  let syncVerified = false;

  // 1. Live page reachable?
  const live = await fetchText(LIVE_URL, "Live careers page");
  if (!live.ok) {
    problems.push(`Live /careers returned HTTP ${live.status}.`);
  }

  // 2. Paylocity reachable?
  const pay = await fetchText(PAYLOCITY_URL, "Paylocity");
  if (!pay.ok) {
    // Paylocity being down is external — note but don't alert on this alone.
    console.log(`WARN: Paylocity unreachable (${pay.status}); skipping drift check.`);
  }

  // 3. Drift comparison — only if both responded
  let drift = null;
  if (live.ok && pay.ok) {
    try {
      const pageData = parsePaylocityPageData(pay.text);
      const paylocityTitles = (pageData.Jobs || [])
        .map((j) => j.JobTitle)
        .sort();
      const liveTitles = extractLiveTitles(live.text);

      if (paylocityTitles.length === 0) {
        console.log("Paylocity returned 0 jobs — treating as transient, not drift.");
      } else {
        syncVerified = true;
        drift = setDiff(paylocityTitles, liveTitles);
        if (drift.onlyInA.length > 0) {
          problems.push(
            `Missing on live site (present on Paylocity): ${drift.onlyInA.join(", ")}`,
          );
        }
        if (drift.onlyInB.length > 0) {
          problems.push(
            `Stale on live site (removed from Paylocity): ${drift.onlyInB.join(", ")}`,
          );
        }

        // Filter chip drift — locations + departments derived from jobs,
        // must also reflect on the live page.
        const expectedLocations = uniqueField(pageData.Jobs, "LocationName");
        const expectedDepartments = uniqueField(
          pageData.Jobs,
          "HiringDepartment",
        );
        const liveChips = new Set(extractLiveChips(live.text));

        const missingLocations = expectedLocations.filter(
          (loc) => !liveChips.has(loc),
        );
        if (missingLocations.length > 0) {
          problems.push(
            `Location filter chips missing: ${missingLocations.join(", ")}`,
          );
        }

        // Departments: client only renders chips when >1 department
        if (expectedDepartments.length > 1) {
          const missingDepartments = expectedDepartments.filter(
            (dep) => !liveChips.has(dep),
          );
          if (missingDepartments.length > 0) {
            problems.push(
              `Department filter chips missing: ${missingDepartments.join(", ")}`,
            );
          }
        }
      }

      // 4. Smoke-test first job detail endpoint
      const firstJob = pageData.Jobs?.[0];
      if (firstJob) {
        const detail = await checkDetailEndpoint(firstJob.JobId);
        if (!detail.ok) {
          problems.push(
            `Detail API failed on ${firstJob.JobTitle} (JobId ${firstJob.JobId}): ${detail.reason}.`,
          );
        }
      }
    } catch (e) {
      problems.push(`Parse error while comparing: ${e.message}`);
    }
  }

  // 5. Report
  const existing = process.env.GH_TOKEN ? findOpenDriftIssue() : null;

  if (problems.length === 0) {
    if (syncVerified) {
      console.log(`[${stamp}] OK: live and Paylocity match.`);
      if (existing) {
        console.log(`Closing recovered drift issue #${existing.number}`);
        closeIssue(
          existing.number,
          `Auto-resolved at ${stamp}. Live /careers and Paylocity are back in sync.`,
        );
      }
    } else {
      // Couldn't verify sync (Paylocity unreachable or returned 0 jobs).
      // Leave any open drift issue open — do NOT auto-close on unverified state.
      console.log(
        `[${stamp}] Skipped: sync unverified (Paylocity unreachable or empty). No issue action taken.`,
      );
    }
    return;
  }

  const body = [
    `**Careers page health check failed at ${stamp}.**`,
    "",
    "Detected issues:",
    ...problems.map((p) => `- ${p}`),
    "",
    `**Live:** ${LIVE_URL}`,
    `**Paylocity:** ${PAYLOCITY_URL}`,
    "",
    "This issue will auto-close on the next successful check.",
  ].join("\n");

  console.error(body);

  if (!process.env.GH_TOKEN) {
    console.error("\nGH_TOKEN not set — skipping issue creation (local run).");
    process.exitCode = 1;
    return;
  }

  if (existing) {
    console.log(`Commenting on existing drift issue #${existing.number}`);
    commentIssue(existing.number, body);
  } else {
    console.log("Opening new drift issue");
    createIssue(body);
  }
}

main().catch((err) => {
  console.error("Drift check crashed:", err);
  process.exit(1);
});
