import type { List, ResponseFormat } from "../types.js";
import { paginationNote, truncate } from "./generic.js";

export function formatList(list: List, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(list, null, 2);
  return [
    `### List #${list.id}: ${list.name}`,
    `- UUID: ${list.uuid}`,
    `- Type: ${list.type}`,
    `- Opt-in: ${list.optin}`,
    `- Subscribers: ${list.subscriber_count ?? "—"}`,
    `- Tags: ${list.tags?.join(", ") || "—"}`,
    list.description ? `- Description: ${list.description}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatListOfLists(
  lists: List[],
  total: number,
  page: number,
  perPage: number,
  format: ResponseFormat
): string {
  if (format === "json") return JSON.stringify({ data: lists, total, page, per_page: perPage }, null, 2);
  if (lists.length === 0) return "No lists found.";
  const rows = [
    "| ID | Name | Type | Opt-in | Subscribers |",
    "|--|--|--|--|--|",
    ...lists.map((l) => `| ${l.id} | ${l.name} | ${l.type} | ${l.optin} | ${l.subscriber_count ?? "—"} |`),
  ].join("\n");
  return truncate([paginationNote(page, perPage, total, lists.length), "", rows].join("\n"));
}
