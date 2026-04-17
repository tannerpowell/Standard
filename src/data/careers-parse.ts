/**
 * Shared parsing utilities for Paylocity job detail pages.
 * Used by both the ISR server component and the API fallback route.
 */

export interface JobDetails {
  description: string;
  requirements: string;
}

/**
 * Fetch and parse a Paylocity job detail page into sanitized HTML.
 */
export async function fetchJobDetails(
  baseUrl: string,
  jobId: number,
): Promise<JobDetails> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(`${baseUrl}/Recruiting/Jobs/Details/${jobId}`, {
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) return { description: "", requirements: "" };
    const html = await res.text();
    return {
      description: extractDescription(html),
      requirements: extractRequirements(html),
    };
  } catch {
    clearTimeout(timeoutId);
    return { description: "", requirements: "" };
  }
}

/**
 * Extract the Description section HTML that follows
 * `<div class="job-listing-header">Description</div>`
 */
function extractDescription(html: string): string {
  const marker = '<div class="job-listing-header">Description</div>';
  const idx = html.indexOf(marker);
  if (idx === -1) return "";

  const afterMarker = html.slice(idx + marker.length);
  const divStart = afterMarker.indexOf("<div");
  if (divStart === -1) return "";

  const content = extractOuterDiv(afterMarker.slice(divStart));
  return formatPaylocityHtml(content);
}

/**
 * Extract the Requirements section from
 * `<div data-bind="html: Job.Requirements">...</div>`
 */
function extractRequirements(html: string): string {
  const marker = 'data-bind="html: Job.Requirements">';
  const idx = html.indexOf(marker);
  if (idx === -1) return "";

  const afterMarker = html.slice(idx + marker.length);
  const outerDiv = extractOuterDiv(afterMarker);
  return formatPaylocityHtml(outerDiv);
}

/** Extract the outermost <div>...</div> including nested divs */
function extractOuterDiv(html: string): string {
  const openTag = /<div[^>]*>/gi;
  const closeTag = /<\/div>/gi;

  const firstOpen = html.indexOf("<div");
  if (firstOpen === -1) return "";

  let depth = 0;
  let pos = firstOpen;
  while (pos < html.length) {
    openTag.lastIndex = pos;
    closeTag.lastIndex = pos;

    const openMatch = openTag.exec(html);
    const closeMatch = closeTag.exec(html);

    if (!closeMatch) break;

    if (openMatch && openMatch.index < closeMatch.index) {
      depth++;
      pos = openMatch.index + openMatch[0].length;
    } else {
      depth--;
      if (depth === 0) {
        return html.slice(firstOpen, closeMatch.index + closeMatch[0].length);
      }
      pos = closeMatch.index + closeMatch[0].length;
    }
  }
  return "";
}

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "ul",
  "ol",
  "li",
]);

/**
 * Strip everything except an allowlist of safe formatting tags and drop all
 * attributes. Pure regex — works in any runtime (Node, Edge, Bun) without a
 * DOM dependency. Input is Paylocity's recruiting HTML, so this is defense in
 * depth rather than adversarial XSS protection.
 *
 * Known limitations (theoretical on Paylocity input, documented for maintainers):
 * - Unclosed dangerous tags like `<style>body{}` without `</style>` leak the
 *   body text as visible content (tag stripped, CSS remains as text).
 * - `>` inside quoted attribute values (`<p title="a>b">`) corrupts the text
 *   after the `>` because the regex treats `>` as tag close. Not a security
 *   issue since all attributes are dropped anyway, but the leaked text becomes
 *   visible. Swap this for a proper HTML parser if either case ever appears.
 */
function sanitizeHtml(html: string): string {
  // Strip dangerous element bodies entirely (tag + contents).
  const stripped = html.replace(
    /<(script|style|iframe|object|embed|link|meta|form|svg|math)[^>]*>[\s\S]*?<\/\1>/gi,
    "",
  );
  // For all remaining tags: keep if allowlisted (as bare tag), otherwise drop.
  return stripped.replace(/<(\/?)([a-zA-Z0-9]+)\b[^>]*>/g, (_, slash, tag) => {
    const t = tag.toLowerCase();
    return ALLOWED_TAGS.has(t) ? `<${slash}${t}>` : "";
  });
}

/** Sanitize raw HTML, then structure into paragraphs and lists. */
function formatPaylocityHtml(html: string): string {
  const clean = sanitizeHtml(html);

  // Normalize <br> to newlines
  let text = clean.replace(/<br\s*\/?>/gi, "\n");

  // Decode common HTML entities that Paylocity emits.
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014");

  // Clean inline whitespace
  text = text.replace(/[ \t]+/g, " ");

  // The Paylocity descriptions use <p> per line. Some are bullet lines starting
  // with "- " or "• ". Convert those into proper <ul><li> for tight rendering.
  const parts = text.split(/<\/p>/gi);
  const processed: string[] = [];
  let inList = false;

  for (const raw of parts) {
    // Strip opening <p> and trim
    const segment = raw.replace(/<p[^>]*>/gi, "").replace(/\n/g, " ").trim();
    if (!segment) continue;

    // If the segment already contains preserved list block tags, emit as-is.
    // Wrapping it in <p> would produce invalid <p><ul>...</ul></p> markup.
    if (/<\/?(ul|ol|li)\b/i.test(segment)) {
      if (inList) {
        processed.push("</ul>");
        inList = false;
      }
      processed.push(segment);
      continue;
    }

    const isBullet = /^[-•–]\s/.test(segment);

    if (isBullet) {
      const itemText = segment.replace(/^[-•–]\s*/, "");
      if (!inList) {
        processed.push("<ul>");
        inList = true;
      }
      processed.push(`<li>${itemText}</li>`);
    } else {
      if (inList) {
        processed.push("</ul>");
        inList = false;
      }
      if (segment.endsWith(":") && segment.length < 80) {
        processed.push(`<h4>${segment}</h4>`);
      } else {
        processed.push(`<p>${segment}</p>`);
      }
    }
  }
  if (inList) processed.push("</ul>");

  return processed.join("") || text.replace(/<[^>]+>/g, "").trim();
}
