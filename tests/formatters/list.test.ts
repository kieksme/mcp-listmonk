import { describe, expect, it } from "vitest";
import { formatList, formatListOfLists } from "../../src/formatters/list.js";
import type { List } from "../../src/types.js";

function makeList(overrides: Partial<List> = {}): List {
  return {
    id: 1,
    uuid: "uuid-1",
    name: "Newsletter",
    type: "public",
    optin: "single",
    subscriber_count: 100,
    tags: ["marketing"],
    ...overrides,
  };
}

describe("formatList", () => {
  it("renders JSON format as the raw list", () => {
    const list = makeList();
    expect(formatList(list, "json")).toBe(JSON.stringify(list, null, 2));
  });

  it("renders markdown with all fields", () => {
    const list = makeList({ description: "Main newsletter" });
    const text = formatList(list, "markdown");
    expect(text).toContain("### List #1: Newsletter");
    expect(text).toContain("- Type: public");
    expect(text).toContain("- Opt-in: single");
    expect(text).toContain("- Subscribers: 100");
    expect(text).toContain("- Tags: marketing");
    expect(text).toContain("- Description: Main newsletter");
  });

  it("omits the description line when absent", () => {
    const text = formatList(makeList({ description: undefined }), "markdown");
    expect(text).not.toContain("Description");
  });

  it("shows em dashes for missing subscriber count and tags", () => {
    const text = formatList(makeList({ subscriber_count: undefined, tags: undefined }), "markdown");
    expect(text).toContain("- Subscribers: —");
    expect(text).toContain("- Tags: —");
  });
});

describe("formatListOfLists", () => {
  it("renders JSON format with pagination metadata", () => {
    const lists = [makeList()];
    const text = formatListOfLists(lists, 1, 1, 20, "json");
    expect(JSON.parse(text)).toEqual({ data: lists, total: 1, page: 1, per_page: 20 });
  });

  it("reports no lists found for an empty result", () => {
    expect(formatListOfLists([], 0, 1, 20, "markdown")).toBe("No lists found.");
  });

  it("renders a markdown table with pagination note and rows", () => {
    const lists = [makeList(), makeList({ id: 2, name: "Product Updates", subscriber_count: undefined })];
    const text = formatListOfLists(lists, 2, 1, 20, "markdown");
    expect(text).toContain("Showing 2 of 2 (page 1).");
    expect(text).toContain("| ID | Name | Type | Opt-in | Subscribers |");
    expect(text).toContain("| 1 | Newsletter | public | single | 100 |");
    expect(text).toContain("| 2 | Product Updates | public | single | — |");
  });
});
