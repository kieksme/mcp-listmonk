import { formatList, formatListOfLists } from "../formatters/list.js";
import * as schemas from "../schemas/lists.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { List, PagedResult } from "../types.js";

export const listTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_lists",
    category: "lists",
    title: "List Mailing Lists",
    description: "Lists all mailing lists with subscriber counts, optionally filtered by name.",
    inputSchema: schemas.listListsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<PagedResult<List>>({
        method: "GET",
        path: "/lists",
        params: { page: args.page, per_page: args.per_page, query: args.query },
      });
      const text = formatListOfLists(result.results, result.total, result.page, result.per_page, args.response_format);
      return { content: [{ type: "text", text }] };
    },
  }),

  defineTool({
    name: "listmonk_create_list",
    category: "lists",
    title: "Create Mailing List",
    description: "Creates a new mailing list.",
    inputSchema: schemas.createListSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { response_format, ...body } = args;
      const list = await client.request<List>({ method: "POST", path: "/lists", data: body });
      return { content: [{ type: "text", text: formatList(list, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_list",
    category: "lists",
    title: "Get Mailing List",
    description: "Retrieves a single mailing list by id, including its subscriber count.",
    inputSchema: schemas.getListSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const list = await client.request<List>({ method: "GET", path: `/lists/${args.list_id}` });
      return { content: [{ type: "text", text: formatList(list, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_update_list",
    category: "lists",
    title: "Update Mailing List",
    description: "Updates fields on an existing mailing list by id. Only provided fields are changed.",
    inputSchema: schemas.updateListSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const { list_id, response_format, ...body } = args;
      const list = await client.request<List>({ method: "PUT", path: `/lists/${list_id}`, data: body });
      return { content: [{ type: "text", text: formatList(list, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_list",
    category: "lists",
    title: "Delete Mailing List",
    description:
      "Permanently deletes a mailing list by id. Subscribers themselves are not deleted, only their " +
      "membership in this list.",
    inputSchema: schemas.deleteListSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/lists/${args.list_id}` });
      return { content: [{ type: "text", text: `List #${args.list_id} deleted.` }] };
    },
  }),
];
