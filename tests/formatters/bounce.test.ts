import { describe, expect, it } from "vitest";
import { formatBounce, formatBounceList } from "../../src/formatters/bounce.js";
import type { Bounce } from "../../src/types.js";

function makeBounce(overrides: Partial<Bounce> = {}): Bounce {
  return {
    id: 1,
    type: "hard",
    source: "smtp",
    email: "person@example.com",
    subscriber_id: 42,
    campaign: { id: 7, name: "August Newsletter" },
    created_at: "2026-08-01T00:00:00Z",
    ...overrides,
  };
}

describe("formatBounce", () => {
  it("renders JSON format as the raw bounce", () => {
    const bounce = makeBounce();
    expect(formatBounce(bounce, "json")).toBe(JSON.stringify(bounce, null, 2));
  });

  it("renders markdown with all fields", () => {
    const text = formatBounce(makeBounce(), "markdown");
    expect(text).toContain("### Bounce #1");
    expect(text).toContain("- Type: hard");
    expect(text).toContain("- Source: smtp");
    expect(text).toContain("- Email: person@example.com");
    expect(text).toContain("- Subscriber id: 42");
    expect(text).toContain("- Campaign: August Newsletter (#7)");
    expect(text).toContain("- Created at: 2026-08-01T00:00:00Z");
  });

  it("shows em dashes for missing optional fields", () => {
    const bounce = makeBounce({ source: undefined, email: undefined, subscriber_id: undefined, campaign: undefined });
    const text = formatBounce(bounce, "markdown");
    expect(text).toContain("- Source: —");
    expect(text).toContain("- Email: —");
    expect(text).toContain("- Subscriber id: —");
    expect(text).toContain("- Campaign: —");
  });
});

describe("formatBounceList", () => {
  it("renders JSON format with pagination metadata", () => {
    const bounces = [makeBounce()];
    const text = formatBounceList(bounces, 1, 1, 20, "json");
    expect(JSON.parse(text)).toEqual({ data: bounces, total: 1, page: 1, per_page: 20 });
  });

  it("reports no bounces found for an empty result", () => {
    expect(formatBounceList([], 0, 1, 20, "markdown")).toBe("No bounces found.");
  });

  it("renders a markdown table with pagination note and rows", () => {
    const bounces = [makeBounce(), makeBounce({ id: 2, email: undefined, campaign: undefined })];
    const text = formatBounceList(bounces, 2, 1, 20, "markdown");
    expect(text).toContain("Showing 2 of 2 (page 1).");
    expect(text).toContain("| ID | Type | Email | Campaign | Created at |");
    expect(text).toContain("| 1 | hard | person@example.com | August Newsletter | 2026-08-01T00:00:00Z |");
    expect(text).toContain("| 2 | hard | — | — | 2026-08-01T00:00:00Z |");
  });
});
