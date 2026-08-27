import type { ResponseFormat, Template } from "../types.js";
import { truncate } from "./generic.js";

export function formatTemplate(tpl: Template, format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(tpl, null, 2);
  return [
    `### Template #${tpl.id}: ${tpl.name}`,
    `- Type: ${tpl.type}`,
    `- Default: ${tpl.is_default ? "yes" : "no"}`,
    tpl.subject ? `- Subject: ${tpl.subject}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatTemplateList(templates: Template[], format: ResponseFormat): string {
  if (format === "json") return JSON.stringify(templates, null, 2);
  if (templates.length === 0) return "No templates found.";
  const rows = [
    "| ID | Name | Type | Default |",
    "|--|--|--|--|",
    ...templates.map((t) => `| ${t.id} | ${t.name} | ${t.type} | ${t.is_default ? "yes" : "no"} |`),
  ].join("\n");
  return truncate(rows);
}
