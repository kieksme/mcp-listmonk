import { describe, expect, it } from "vitest";
import { formatCampaign, formatCampaignList } from "../../src/formatters/campaign.js";
import type { Campaign } from "../../src/types.js";

function makeCampaign(overrides: Partial<Campaign> = {}): Campaign {
  return {
    id: 1,
    name: "August Newsletter",
    subject: "News for August",
    status: "running",
    type: "regular",
    content_type: "richtext",
    lists: [{ id: 5, name: "Newsletter" }],
    tags: ["monthly"],
    sent: 10,
    to_send: 100,
    ...overrides,
  };
}

describe("formatCampaign", () => {
  it("renders JSON format as the raw campaign", () => {
    const campaign = makeCampaign();
    expect(formatCampaign(campaign, "json")).toBe(JSON.stringify(campaign, null, 2));
  });

  it("renders markdown with all fields", () => {
    const campaign = makeCampaign({ started_at: "2026-08-01T00:00:00Z", send_at: "2026-08-01T12:00:00Z" });
    const text = formatCampaign(campaign, "markdown");
    expect(text).toContain("### Campaign #1: August Newsletter");
    expect(text).toContain("- Subject: News for August");
    expect(text).toContain("- Status: running");
    expect(text).toContain("- Type: regular / Content-Type: richtext");
    expect(text).toContain("Newsletter (#5)");
    expect(text).toContain("- Tags: monthly");
    expect(text).toContain("- Sent: 10 / 100");
    expect(text).toContain("- Started at: 2026-08-01T00:00:00Z");
    expect(text).toContain("- Scheduled for: 2026-08-01T12:00:00Z");
  });

  it("omits started_at/send_at lines when absent", () => {
    const text = formatCampaign(makeCampaign(), "markdown");
    expect(text).not.toContain("Started at");
    expect(text).not.toContain("Scheduled for");
  });

  it("defaults sent to 0 and falls back on missing fields", () => {
    const campaign = makeCampaign({
      status: undefined,
      type: undefined,
      content_type: undefined,
      lists: undefined,
      tags: undefined,
      sent: undefined,
      to_send: undefined,
    });
    const text = formatCampaign(campaign, "markdown");
    expect(text).toContain("- Status: —");
    expect(text).toContain("- Type: — / Content-Type: —");
    expect(text).toContain("- Lists: —");
    expect(text).toContain("- Tags: —");
    expect(text).toContain("- Sent: 0 / —");
  });
});

describe("formatCampaignList", () => {
  it("renders JSON format with pagination metadata", () => {
    const campaigns = [makeCampaign()];
    const text = formatCampaignList(campaigns, 1, 1, 20, "json");
    expect(JSON.parse(text)).toEqual({ data: campaigns, total: 1, page: 1, per_page: 20 });
  });

  it("reports no campaigns found for an empty result", () => {
    expect(formatCampaignList([], 0, 1, 20, "markdown")).toBe("No campaigns found.");
  });

  it("renders a markdown table with pagination note and rows", () => {
    const campaigns = [makeCampaign(), makeCampaign({ id: 2, name: "Draft", status: undefined, sent: undefined })];
    const text = formatCampaignList(campaigns, 2, 1, 20, "markdown");
    expect(text).toContain("Showing 2 of 2 (page 1).");
    expect(text).toContain("| ID | Name | Subject | Status | Sent |");
    expect(text).toContain("| 1 | August Newsletter | News for August | running | 10/100 |");
    expect(text).toContain("| 2 | Draft | News for August | — | 0/100 |");
  });
});
