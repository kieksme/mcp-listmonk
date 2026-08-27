import { formatTemplate, formatTemplateList } from "../formatters/template.js";
import * as schemas from "../schemas/templates.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { Template } from "../types.js";

export const templateTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_templates",
    category: "templates",
    title: "List Templates",
    description: "Lists all campaign and transactional templates.",
    inputSchema: schemas.listTemplatesSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const templates = await client.request<Template[]>({
        method: "GET",
        path: "/templates",
        params: { no_body: args.no_body },
      });
      return { content: [{ type: "text", text: formatTemplateList(templates, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_create_template",
    category: "templates",
    title: "Create Template",
    description: "Creates a new campaign or transactional template.",
    inputSchema: schemas.createTemplateSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { response_format, ...body } = args;
      const tpl = await client.request<Template>({ method: "POST", path: "/templates", data: body });
      return { content: [{ type: "text", text: formatTemplate(tpl, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_template",
    category: "templates",
    title: "Get Template",
    description: "Retrieves a single template by id, including its full HTML body.",
    inputSchema: schemas.getTemplateSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const tpl = await client.request<Template>({ method: "GET", path: `/templates/${args.id}` });
      return { content: [{ type: "text", text: formatTemplate(tpl, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_update_template",
    category: "templates",
    title: "Update Template",
    description: "Updates fields on an existing template by id. Only provided fields are changed.",
    inputSchema: schemas.updateTemplateSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const { id, response_format, ...body } = args;
      const tpl = await client.request<Template>({ method: "PUT", path: `/templates/${id}`, data: body });
      return { content: [{ type: "text", text: formatTemplate(tpl, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_template",
    category: "templates",
    title: "Delete Template",
    description: "Permanently deletes a template by id. The default template cannot be deleted.",
    inputSchema: schemas.deleteTemplateSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/templates/${args.id}` });
      return { content: [{ type: "text", text: `Template #${args.id} deleted.` }] };
    },
  }),

  defineTool({
    name: "listmonk_preview_template_draft",
    category: "templates",
    title: "Preview Unsaved Template",
    description:
      "Renders an HTML preview of an UNSAVED template body/type combination, without creating or " +
      "modifying anything. Use before listmonk_create_template to check formatting.",
    inputSchema: schemas.previewTemplateDraftSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const html = await client.request<string>({
        method: "POST",
        path: "/templates/preview",
        data: new URLSearchParams({ template_type: args.template_type, body: args.body }),
      });
      return { content: [{ type: "text", text: html }] };
    },
  }),

  defineTool({
    name: "listmonk_preview_template",
    category: "templates",
    title: "Preview Saved Template",
    description: "Renders an HTML preview of an existing saved template by id, exactly as currently stored.",
    inputSchema: schemas.previewTemplateSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const html = await client.request<string>({ method: "GET", path: `/templates/${args.id}/preview` });
      return { content: [{ type: "text", text: html }] };
    },
  }),

  defineTool({
    name: "listmonk_set_default_template",
    category: "templates",
    title: "Set Default Template",
    description: "Marks a template as the default template used for new campaigns.",
    inputSchema: schemas.setDefaultTemplateSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const tpl = await client.request<Template>({ method: "PUT", path: `/templates/${args.id}/default` });
      return { content: [{ type: "text", text: formatTemplate(tpl, args.response_format) }] };
    },
  }),
];
