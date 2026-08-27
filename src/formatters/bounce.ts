import type { Bounce, ResponseFormat } from "../types.js";
import { paginationNote, truncate } from "./generic.js";

export function formatBounce(bounce: Bounce, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(bounce, null, 2);
  return [
    `### Bounce #${bounce.id}`,
    `- Type: ${bounce.type}`,
    `- Source: ${bounce.source ?? "—"}`,
    `- Email: ${bounce.email ?? "—"}`,
    `- Subscriber id: ${bounce.subscriber_id ?? "—"}`,
    `- Campaign: ${bounce.campaign ? `${bounce.campaign.name} (#${bounce.campaign.id})` : "—"}`,
    `- Created at: ${bounce.created_at}`,
  ].join("\n");
}

export function formatBounceList(
  bounces: Bounce[],
  total: number,
  page: number,
  perPage: number,
  format: ResponseFormat
): string {
  if (format === "json") return JSON.stringify({ data: bounces, total, page, per_page: perPage }, null, 2);
  if (bounces.length === 0) return "No bounces found.";
  const rows = [
    "| ID | Type | Email | Campaign | Created at |",
    "|--|--|--|--|--|",
    ...bounces.map(
      (b) => `| ${b.id} | ${b.type} | ${b.email ?? "—"} | ${b.campaign?.name ?? "—"} | ${b.created_at} |`
    ),
  ].join("\n");
  return truncate([paginationNote(page, perPage, total, bounces.length), "", rows].join("\n"));
}
