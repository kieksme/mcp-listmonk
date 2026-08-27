import type { MediaFileObject, ResponseFormat } from "../types.js";
import { paginationNote, truncate } from "./generic.js";

export function formatMedia(media: MediaFileObject, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(media, null, 2);
  return [
    `### Media #${media.id}: ${media.filename}`,
    `- Content-Type: ${media.content_type}`,
    `- URL: ${media.url ?? "—"}`,
    media.thumb_url ? `- Thumbnail: ${media.thumb_url}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatMediaList(
  items: MediaFileObject[],
  total: number,
  page: number,
  perPage: number,
  format: ResponseFormat
): string {
  if (format === "json") return JSON.stringify({ data: items, total, page, per_page: perPage }, null, 2);
  if (items.length === 0) return "No media files found.";
  const rows = [
    "| ID | Filename | Content-Type | URL |",
    "|--|--|--|--|",
    ...items.map((m) => `| ${m.id} | ${m.filename} | ${m.content_type} | ${m.url ?? "—"} |`),
  ].join("\n");
  return truncate([paginationNote(page, perPage, total, items.length), "", rows].join("\n"));
}
