import { describe, expect, it } from "vitest";
import { formatObject, paginationNote, truncate } from "../../src/formatters/generic.js";

describe("formatObject", () => {
  it("renders JSON format as pretty-printed JSON", () => {
    const obj = { a: 1, b: "two" };
    expect(formatObject(obj, "json")).toBe(JSON.stringify(obj, null, 2));
  });

  it("renders a plain object as a markdown key/value list", () => {
    const text = formatObject({ id: 1, name: "Test" }, "markdown");
    expect(text).toBe("- **id**: 1\n- **name**: Test");
  });

  it("prefixes a heading when a title is given", () => {
    const text = formatObject({ id: 1 }, "markdown", "My Title");
    expect(text.split("\n")[0]).toBe("### My Title");
  });

  it("renders null/undefined values as an em dash", () => {
    const text = formatObject({ a: null, b: undefined }, "markdown");
    expect(text).toBe("- **a**: —\n- **b**: —");
  });

  it("renders nested objects/arrays as inline JSON code", () => {
    const text = formatObject({ tags: ["x", "y"] }, "markdown");
    expect(text).toBe('- **tags**: `["x","y"]`');
  });

  it("falls back to formatValue for non-object input", () => {
    expect(formatObject("just a string", "markdown")).toBe("just a string");
    expect(formatObject(42, "markdown")).toBe("42");
  });

  it("does not treat arrays as key/value objects", () => {
    const text = formatObject([1, 2, 3], "markdown");
    expect(text).toBe("`[1,2,3]`");
  });
});

describe("truncate", () => {
  it("returns text unchanged when at or under the character limit", () => {
    const short = "hello world";
    expect(truncate(short)).toBe(short);
  });

  it("truncates text over the character limit and appends a note", () => {
    const long = "a".repeat(25_001);
    const result = truncate(long);
    expect(result.startsWith("a".repeat(25_000))).toBe(true);
    expect(result).toContain("Response truncated at 25000 characters");
    expect(result.length).toBeGreaterThan(25_000);
  });

  it("keeps text exactly at the limit unchanged", () => {
    const exact = "a".repeat(25_000);
    expect(truncate(exact)).toBe(exact);
  });
});

describe("paginationNote", () => {
  it("indicates more results are available when there is a next page", () => {
    const note = paginationNote(1, 20, 45, 20);
    expect(note).toBe("Showing 20 of 45 (page 1). More results available — call again with page: 2.");
  });

  it("omits the next-page hint on the last page", () => {
    const note = paginationNote(3, 20, 45, 5);
    expect(note).toBe("Showing 5 of 45 (page 3).");
  });

  it("omits the next-page hint when everything fits on one page", () => {
    const note = paginationNote(1, 20, 10, 10);
    expect(note).toBe("Showing 10 of 10 (page 1).");
  });
});
