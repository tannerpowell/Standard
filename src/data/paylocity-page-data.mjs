/**
 * Shared parser for Paylocity's recruiting page HTML.
 *
 * Paylocity embeds the full page state as a JavaScript literal:
 *   `window.pageData = { "Departments": [...], "Jobs": [...] };`
 *
 * This utility locates the marker and extracts the balanced-brace JSON
 * slice, correctly handling escape sequences inside JSON string values
 * (including the tricky `\\"` case: escaped backslash followed by the
 * closing quote).
 *
 * Used from both the server component (src/app/careers/page.tsx) and
 * the drift-check monitor (.github/scripts/careers-drift-check.mjs), so
 * keep it as plain ESM JS with no dependencies.
 */

/**
 * Extract and JSON.parse the `window.pageData = {...}` literal from a
 * Paylocity recruiting HTML response.
 *
 * @param {string} html Raw HTML body.
 * @returns {unknown} Parsed JSON value (caller should validate the shape).
 * @throws {Error} If the `window.pageData` marker is absent from the HTML.
 * @throws {Error} If the opening `{` cannot be found after the marker.
 * @throws {Error} If the JSON body never closes its outermost brace
 *                 (e.g., response truncated mid-stream).
 * @throws {SyntaxError} If the extracted slice is not valid JSON and
 *                       `JSON.parse` rejects it.
 */
export function parsePaylocityPageData(html) {
  const marker = "window.pageData = ";
  const start = html.indexOf(marker);
  if (start === -1) throw new Error("Paylocity pageData marker missing");

  const jsonStart = html.indexOf("{", start + marker.length);
  if (jsonStart === -1) throw new Error("Paylocity pageData opening brace missing");

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
