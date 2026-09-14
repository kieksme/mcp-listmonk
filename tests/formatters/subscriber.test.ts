import { describe, expect, it } from "vitest";
import { formatSubscriber, formatSubscriberList } from "../../src/formatters/subscriber.js";
import type { Subscriber } from "../../src/types.js";

function makeSubscriber(overrides: Partial<Subscriber> = {}): Subscriber {
  return {
    id: 1,
    uuid: "uuid-1",
    email: "person@example.com",
    name: "Test Person",
    status: "enabled",
    attribs: { city: "Leipzig" },
    lists: [{ id: 5, name: "Newsletter", subscription_status: "confirmed" }],
    ...overrides,
  };
}

describe("formatSubscriber", () => {
  it("renders JSON format as the raw subscriber", () => {
    const sub = makeSubscriber();
    expect(formatSubscriber(sub, "json")).toBe(JSON.stringify(sub, null, 2));
  });

  it("renders markdown with list memberships", () => {
    const sub = makeSubscriber();
    const text = formatSubscriber(sub, "markdown");
    expect(text).toContain("### Subscriber #1: person@example.com");
    expect(text).toContain("- UUID: uuid-1");
    expect(text).toContain("- Status: enabled");
    expect(text).toContain("Newsletter (id: 5, confirmed)");
    expect(text).toContain('`{"city":"Leipzig"}`');
  });

  it("falls back to list id when a membership has no name", () => {
    const sub = makeSubscriber({ lists: [{ id: 9, subscription_status: "unconfirmed" }] });
    expect(formatSubscriber(sub, "markdown")).toContain("#9 (id: 9, unconfirmed)");
  });

  it("shows an em dash when there are no lists", () => {
    const sub = makeSubscriber({ lists: [] });
    expect(formatSubscriber(sub, "markdown")).toContain("- Lists: —");
  });

  it("defaults attribs to an empty object when missing", () => {
    const sub = makeSubscriber({ attribs: undefined });
    expect(formatSubscriber(sub, "markdown")).toContain("- Attribs: `{}`");
  });
});

describe("formatSubscriberList", () => {
  it("renders JSON format with pagination metadata", () => {
    const subs = [makeSubscriber()];
    const text = formatSubscriberList(subs, 1, 1, 20, "json");
    expect(JSON.parse(text)).toEqual({ data: subs, total: 1, page: 1, per_page: 20 });
  });

  it("reports no matches for an empty list", () => {
    expect(formatSubscriberList([], 0, 1, 20, "markdown")).toBe("No subscribers matched.");
  });

  it("renders a markdown table with pagination note and rows", () => {
    const subs = [makeSubscriber(), makeSubscriber({ id: 2, email: "b@example.com", lists: [] })];
    const text = formatSubscriberList(subs, 2, 1, 20, "markdown");
    expect(text).toContain("Showing 2 of 2 (page 1).");
    expect(text).toContain("| ID | Email | Name | Status | Lists |");
    expect(text).toContain("| 1 | person@example.com | Test Person | enabled | Newsletter |");
    expect(text).toContain("| 2 | b@example.com | Test Person | enabled | — |");
  });
});
