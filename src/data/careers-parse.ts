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
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(`${baseUrl}/Recruiting/Jobs/Details/${jobId}`, {
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
  return sanitizeHtml(content);
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
  const closeDiv = afterMarker.indexOf("</div>");
  if (closeDiv === -1) return "";

  const content = afterMarker.slice(0, closeDiv);
  return sanitizeHtml(content);
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

/**
 * Escape HTML-special characters, then restore an allowlist of safe inline
 * formatting tags and list tags (<strong>, <em>, <b>, <i>, <ul>, <ol>, <li>).
 */
function escapeWithAllowlist(text: string): string {
  // 1. Escape all HTML-special characters
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  // 2. Restore only permitted formatting and list tags
  return escaped.replace(
    /&lt;(\/?(?:strong|em|b|i|ul|ol|li))&gt;/gi,
    (_, tag: string) => `<${tag}>`,
  );
}

/** Convert raw Paylocity HTML to sanitized HTML suitable for dangerouslySetInnerHTML */
function sanitizeHtml(html: string): string {
  let text = html;

  // Normalize <br> to newlines first
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // First, remove dangerous tags and their content entirely
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "");
  text = text.replace(/<embed[^>]*>/gi, "");

  // Strip remaining disallowed tags (keep content)
  // Note: ul, ol, li are preserved for list formatting
  text = text.replace(/<\/?(div|span|a|table|tr|td|th|thead|tbody|h[1-6]|img|hr|section|article|header|footer|nav|figure|figcaption|blockquote|pre|code|dl|dt|dd)[^>]*>/gi, "");

  // Decode entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&nbsp;/g, " ");

  // Second pass: remove dangerous tags that may have been revealed by entity decoding
  // (e.g., &lt;script&gt; decoded to <script> would bypass the first strip)
  text = text.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "");
  text = text.replace(/<object[^>]*>[\s\S]*?<\/object>/gi, "");
  text = text.replace(/<embed[^>]*>/gi, "");

  // Clean inline whitespace
  text = text.replace(/[ \t]+/g, " ");

  // The Paylocity descriptions use <p> per line. Some are bullet lines starting
  // with "- " or "• ". Convert those into proper <ul><li> for tight rendering.
  // Split on </p> boundaries to process paragraphs.
  const parts = text.split(/<\/p>/gi);
  const processed: string[] = [];
  let inList = false;

  for (const raw of parts) {
    // Strip opening <p> and trim
    const clean = raw.replace(/<p[^>]*>/gi, "").replace(/\n/g, " ").trim();
    if (!clean) continue;

    const isBullet = /^[-•–]\s/.test(clean);

    if (isBullet) {
      const itemText = clean.replace(/^[-•–]\s*/, "");
      if (!inList) {
        processed.push("<ul>");
        inList = true;
      }
      processed.push(`<li>${escapeWithAllowlist(itemText)}</li>`);
    } else {
      if (inList) {
        processed.push("</ul>");
        inList = false;
      }
      // Check if this looks like a section heading (short, ends with ":")
      if (clean.endsWith(":") && clean.length < 80) {
        processed.push(`<h4>${escapeWithAllowlist(clean)}</h4>`);
      } else {
        processed.push(`<p>${escapeWithAllowlist(clean)}</p>`);
      }
    }
  }
  if (inList) processed.push("</ul>");

  return processed.join("") || text.replace(/<[^>]+>/g, "").trim();
}
