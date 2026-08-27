import * as schemas from "../schemas/maintenance.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const maintenanceTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_delete_gc_subscribers",
    category: "maintenance",
    title: "Garbage-Collect Subscribers",
    description:
      "PERMANENTLY DELETES subscribers matching a maintenance class ('blocklisted' or 'orphan' — " +
      "subscribers with no list memberships). Irreversible; confirm with the user before calling.",
    inputSchema: schemas.gcSubscribersSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<{ count: number }>({
        method: "DELETE",
        path: `/maintenance/subscribers/${args.type}`,
      });
      return { content: [{ type: "text", text: `Deleted ${result.count} "${args.type}" subscriber(s).` }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_gc_campaign_analytics",
    category: "maintenance",
    title: "Garbage-Collect Campaign Analytics",
    description:
      "PERMANENTLY DELETES campaign analytics records (views/clicks/all) older than a given date. " +
      "Irreversible; confirm with the user before calling.",
    inputSchema: schemas.gcCampaignAnalyticsSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<unknown>({
        method: "DELETE",
        path: `/maintenance/analytics/${args.type}`,
        params: { before_date: args.before_date },
      });
      return {
        content: [{ type: "text", text: `Deleted "${args.type}" campaign analytics older than ${args.before_date}.` }],
      };
    },
  }),

  defineTool({
    name: "listmonk_delete_unconfirmed_subscriptions",
    category: "maintenance",
    title: "Delete Unconfirmed Subscriptions",
    description:
      "PERMANENTLY DELETES pending (unconfirmed double opt-in) subscriptions older than a given date. " +
      "Irreversible; confirm with the user before calling.",
    inputSchema: schemas.gcUnconfirmedSubscriptionsSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<{ count: number }>({
        method: "DELETE",
        path: "/maintenance/subscriptions/unconfirmed",
        params: { before_date: args.before_date },
      });
      return { content: [{ type: "text", text: `Deleted ${result.count} unconfirmed subscription(s).` }] };
    },
  }),
];
