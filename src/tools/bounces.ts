import { formatBounce, formatBounceList } from "../formatters/bounce.js";
import * as schemas from "../schemas/bounces.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { Bounce, PagedResult } from "../types.js";

export const bounceTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_bounces",
    category: "bounces",
    title: "List Bounces",
    description: "Lists e-mail bounce records, optionally filtered by campaign or bounce source.",
    inputSchema: schemas.listBouncesSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<PagedResult<Bounce>>({
        method: "GET",
        path: "/bounces",
        params: {
          campaign_id: args.campaign_id,
          page: args.page,
          per_page: args.per_page,
          source: args.source,
          order_by: args.order_by,
          order: args.order,
        },
      });
      const text = formatBounceList(result.results, result.total, result.page, result.per_page, args.response_format);
      return { content: [{ type: "text", text }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_bounces",
    category: "bounces",
    title: "Delete Bounces",
    description: "Deletes bounce records in bulk — either all of them (`all: true`) or a specific set of `ids`.",
    inputSchema: schemas.deleteBouncesSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({
        method: "DELETE",
        path: "/bounces",
        params: { all: args.all, id: args.ids },
      });
      return {
        content: [{ type: "text", text: args.all ? "All bounce records deleted." : `Deleted bounces: ${args.ids?.join(", ")}` }],
      };
    },
  }),

  defineTool({
    name: "listmonk_get_bounce",
    category: "bounces",
    title: "Get Bounce",
    description: "Retrieves a single bounce record by id.",
    inputSchema: schemas.getBounceSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const bounce = await client.request<Bounce>({ method: "GET", path: `/bounces/${args.id}` });
      return { content: [{ type: "text", text: formatBounce(bounce, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_bounce",
    category: "bounces",
    title: "Delete Bounce",
    description: "Deletes a single bounce record by id.",
    inputSchema: schemas.deleteBounceSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/bounces/${args.id}` });
      return { content: [{ type: "text", text: `Bounce #${args.id} deleted.` }] };
    },
  }),
];
