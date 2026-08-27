import type { Campaign, ResponseFormat } from "../types.js";
import { paginationNote, truncate } from "./generic.js";

export function formatCampaign(campaign: Campaign, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(campaign, null, 2);
  return [
    `### Campaign #${campaign.id}: ${campaign.name}`,
    `- Subject: ${campaign.subject}`,
    `- Status: ${campaign.status ?? "—"}`,
    `- Type: ${campaign.type ?? "—"} / Content-Type: ${campaign.content_type ?? "—"}`,
    `- Lists: ${campaign.lists?.map((l) => `${l.name} (#${l.id})`).join(", ") || "—"}`,
    `- Tags: ${campaign.tags?.join(", ") || "—"}`,
    `- Sent: ${campaign.sent ?? 0} / ${campaign.to_send ?? "—"}`,
    campaign.started_at ? `- Started at: ${campaign.started_at}` : undefined,
    campaign.send_at ? `- Scheduled for: ${campaign.send_at}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatCampaignList(
  campaigns: Campaign[],
  total: number,
  page: number,
  perPage: number,
  format: ResponseFormat
): string {
  if (format === "json") return JSON.stringify({ data: campaigns, total, page, per_page: perPage }, null, 2);
  if (campaigns.length === 0) return "No campaigns found.";
  const rows = [
    "| ID | Name | Subject | Status | Sent |",
    "|--|--|--|--|--|",
    ...campaigns.map(
      (c) => `| ${c.id} | ${c.name} | ${c.subject} | ${c.status ?? "—"} | ${c.sent ?? 0}/${c.to_send ?? "—"} |`
    ),
  ].join("\n");
  return truncate([paginationNote(page, perPage, total, campaigns.length), "", rows].join("\n"));
}
