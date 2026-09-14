import { describe, expect, it } from "vitest";
import { formatTemplate, formatTemplateList } from "../../src/formatters/template.js";
import type { Template } from "../../src/types.js";

function makeTemplate(overrides: Partial<Template> = {}): Template {
  return {
    id: 1,
    name: "Default Campaign Template",
    type: "campaign",
    is_default: true,
    subject: "{{ .Subject }}",
    ...overrides,
  };
}

describe("formatTemplate", () => {
  it("renders JSON format as the raw template", () => {
    const tpl = makeTemplate();
    expect(formatTemplate(tpl, "json")).toBe(JSON.stringify(tpl, null, 2));
  });

  it("renders markdown with all fields", () => {
    const text = formatTemplate(makeTemplate(), "markdown");
    expect(text).toContain("### Template #1: Default Campaign Template");
    expect(text).toContain("- Type: campaign");
    expect(text).toContain("- Default: yes");
    expect(text).toContain("- Subject: {{ .Subject }}");
  });

  it("renders Default: no and omits subject when absent", () => {
    const text = formatTemplate(makeTemplate({ is_default: false, subject: undefined }), "markdown");
    expect(text).toContain("- Default: no");
    expect(text).not.toContain("Subject");
  });
});

describe("formatTemplateList", () => {
  it("renders JSON format as the raw array (no pagination wrapper)", () => {
    const templates = [makeTemplate()];
    expect(formatTemplateList(templates, "json")).toBe(JSON.stringify(templates, null, 2));
  });

  it("reports no templates found for an empty result", () => {
    expect(formatTemplateList([], "markdown")).toBe("No templates found.");
  });

  it("renders a markdown table without a pagination note", () => {
    const templates = [makeTemplate(), makeTemplate({ id: 2, name: "Transactional", is_default: false })];
    const text = formatTemplateList(templates, "markdown");
    expect(text).not.toContain("Showing");
    expect(text).toContain("| ID | Name | Type | Default |");
    expect(text).toContain("| 1 | Default Campaign Template | campaign | yes |");
    expect(text).toContain("| 2 | Transactional | campaign | no |");
  });
});
