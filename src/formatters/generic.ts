import { CHARACTER_LIMIT } from "../constants.js";
import type { ResponseFormat } from "../types.js";

/** Renders an arbitrary object as pretty JSON or a flat markdown key/value list. */
export function formatObject(obj: unknown, format: ResponseFormat, title?: string): string {
  if (format === "json") return JSON.stringify(obj, null, 2);

  const lines: string[] = [];
  if (title) lines.push(`### ${title}`);
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      lines.push(`- **${key}**: ${formatValue(value)}`);
    }
  } else {
    lines.push(formatValue(obj));
  }
  return truncate(lines.join("\n"));
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return `\`${JSON.stringify(value)}\``;
  return String(value);
}

/** Truncates markdown output over CHARACTER_LIMIT with a note, keeping JSON output untouched. */
export function truncate(text: string): string {
  if (text.length <= CHARACTER_LIMIT) return text;
  return (
    text.slice(0, CHARACTER_LIMIT) +
    `\n\n_Response truncated at ${CHARACTER_LIMIT} characters. Narrow your query, use a smaller ` +
    `per_page, or request response_format: "json" for a more compact representation._`
  );
}

export function paginationNote(page: number, perPage: number, total: number, resultCount: number): string {
  const hasMore = page * perPage < total;
  const base = `Showing ${resultCount} of ${total} (page ${page}).`;
  return hasMore ? `${base} More results available — call again with page: ${page + 1}.` : base;
}
