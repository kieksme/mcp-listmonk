import { describe, expect, it } from "vitest";
import { formatMedia, formatMediaList } from "../../src/formatters/media.js";
import type { MediaFileObject } from "../../src/types.js";

function makeMedia(overrides: Partial<MediaFileObject> = {}): MediaFileObject {
  return {
    id: 1,
    uuid: "uuid-1",
    filename: "banner.png",
    content_type: "image/png",
    url: "https://example.com/banner.png",
    thumb_url: "https://example.com/banner_thumb.png",
    ...overrides,
  };
}

describe("formatMedia", () => {
  it("renders JSON format as the raw media object", () => {
    const media = makeMedia();
    expect(formatMedia(media, "json")).toBe(JSON.stringify(media, null, 2));
  });

  it("renders markdown with all fields", () => {
    const text = formatMedia(makeMedia(), "markdown");
    expect(text).toContain("### Media #1: banner.png");
    expect(text).toContain("- Content-Type: image/png");
    expect(text).toContain("- URL: https://example.com/banner.png");
    expect(text).toContain("- Thumbnail: https://example.com/banner_thumb.png");
  });

  it("omits the thumbnail line when absent", () => {
    const text = formatMedia(makeMedia({ thumb_url: undefined }), "markdown");
    expect(text).not.toContain("Thumbnail");
  });

  it("shows an em dash when the URL is missing", () => {
    const text = formatMedia(makeMedia({ url: undefined }), "markdown");
    expect(text).toContain("- URL: —");
  });
});

describe("formatMediaList", () => {
  it("renders JSON format with pagination metadata", () => {
    const items = [makeMedia()];
    const text = formatMediaList(items, 1, 1, 20, "json");
    expect(JSON.parse(text)).toEqual({ data: items, total: 1, page: 1, per_page: 20 });
  });

  it("reports no media files found for an empty result", () => {
    expect(formatMediaList([], 0, 1, 20, "markdown")).toBe("No media files found.");
  });

  it("renders a markdown table with pagination note and rows", () => {
    const items = [makeMedia(), makeMedia({ id: 2, filename: "logo.svg", url: undefined })];
    const text = formatMediaList(items, 2, 1, 20, "markdown");
    expect(text).toContain("Showing 2 of 2 (page 1).");
    expect(text).toContain("| ID | Filename | Content-Type | URL |");
    expect(text).toContain("| 1 | banner.png | image/png | https://example.com/banner.png |");
    expect(text).toContain("| 2 | logo.svg | image/png | — |");
  });
});
