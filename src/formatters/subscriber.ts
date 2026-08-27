import type { ResponseFormat, Subscriber } from "../types.js";
import { paginationNote, truncate } from "./generic.js";

export function formatSubscriber(sub: Subscriber, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(sub, null, 2);
  const lists =
    sub.lists && sub.lists.length > 0
      ? sub.lists.map((l) => `${l.name ?? `#${l.id}`} (id: ${l.id}, ${l.subscription_status})`).join(", ")
      : "—";
  return [
    `### Subscriber #${sub.id}: ${sub.email}`,
    `- UUID: ${sub.uuid}`,
    `- Name: ${sub.name}`,
    `- Status: ${sub.status}`,
    `- Lists: ${lists}`,
    `- Attribs: \`${JSON.stringify(sub.attribs ?? {})}\``,
  ].join("\n");
}

export function formatSubscriberList(
  subs: Subscriber[],
  total: number,
  page: number,
  perPage: number,
  format: ResponseFormat
): string {
  if (format === "json") return JSON.stringify({ data: subs, total, page, per_page: perPage }, null, 2);
  if (subs.length === 0) return "No subscribers matched.";
  const rows = [
    "| ID | Email | Name | Status | Lists |",
    "|--|--|--|--|--|",
    ...subs.map(
      (s) =>
        `| ${s.id} | ${s.email} | ${s.name} | ${s.status} | ${
          s.lists?.map((l) => l.name ?? `#${l.id}`).join(", ") || "—"
        } |`
    ),
  ].join("\n");
  return truncate([paginationNote(page, perPage, total, subs.length), "", rows].join("\n"));
}
