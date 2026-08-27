import { formatObject } from "../formatters/generic.js";
import { formatSubscriber, formatSubscriberList } from "../formatters/subscriber.js";
import * as schemas from "../schemas/subscribers.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { Bounce, PagedResult, Subscriber } from "../types.js";

export const subscriberTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_subscribers",
    category: "subscribers",
    title: "List Subscribers",
    description:
      "Lists/searches subscribers with pagination, sorting, and an optional Listmonk SQL filter " +
      "expression (`query`) or list membership filter. Use this to find subscriber ids before " +
      "calling other subscriber tools, and to preview the match count of a `query` before running " +
      "a bulk query-based operation (delete/blocklist/list-membership).",
    inputSchema: schemas.listSubscribersSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<PagedResult<Subscriber>>({
        method: "GET",
        path: "/subscribers",
        params: {
          page: args.page,
          per_page: args.per_page,
          query: args.query,
          order_by: args.order_by,
          order: args.order,
          subscription_status: args.subscription_status,
          list_id: args.list_id,
        },
      });
      const text = formatSubscriberList(result.results, result.total, result.page, result.per_page, args.response_format);
      return { content: [{ type: "text", text }] };
    },
  }),

  defineTool({
    name: "listmonk_create_subscriber",
    category: "subscribers",
    title: "Create Subscriber",
    description: "Creates a new subscriber, optionally subscribing them to one or more lists immediately.",
    inputSchema: schemas.createSubscriberSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { response_format, ...body } = args;
      const sub = await client.request<Subscriber>({ method: "POST", path: "/subscribers", data: body });
      return { content: [{ type: "text", text: formatSubscriber(sub, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_subscriber",
    category: "subscribers",
    title: "Get Subscriber",
    description: "Retrieves a single subscriber by numeric id, including their list memberships.",
    inputSchema: schemas.getSubscriberSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const sub = await client.request<Subscriber>({ method: "GET", path: `/subscribers/${args.id}` });
      return { content: [{ type: "text", text: formatSubscriber(sub, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_update_subscriber",
    category: "subscribers",
    title: "Update Subscriber",
    description: "Updates fields on an existing subscriber by id. Only provided fields are changed.",
    inputSchema: schemas.updateSubscriberSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const { id, response_format, ...body } = args;
      const sub = await client.request<Subscriber>({ method: "PUT", path: `/subscribers/${id}`, data: body });
      return { content: [{ type: "text", text: formatSubscriber(sub, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_subscriber",
    category: "subscribers",
    title: "Delete Subscriber",
    description: "Permanently deletes a single subscriber by id.",
    inputSchema: schemas.deleteSubscriberSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/subscribers/${args.id}` });
      return { content: [{ type: "text", text: `Subscriber #${args.id} deleted.` }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_subscribers_by_ids",
    category: "subscribers",
    title: "Delete Subscribers By Ids",
    description: "Permanently deletes multiple subscribers given an explicit list of ids.",
    inputSchema: schemas.deleteSubscribersByIdsSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({
        method: "DELETE",
        path: "/subscribers",
        params: { id: args.ids },
      });
      return { content: [{ type: "text", text: `Deleted ${args.ids.length} subscriber(s): ${args.ids.join(", ")}.` }] };
    },
  }),

  defineTool({
    name: "listmonk_manage_subscriber_lists_bulk",
    category: "subscribers",
    title: "Manage Subscriber Lists (Bulk By Ids)",
    description:
      "Adds, removes, or unsubscribes an explicit set of subscribers (by id) from one or more target lists.",
    inputSchema: schemas.manageSubscriberListsBulkSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "PUT", path: "/subscribers/lists", data: args });
      return {
        content: [
          {
            type: "text",
            text: `Applied action "${args.action}" for ${args.ids.length} subscriber(s) on list(s) ${args.target_list_ids.join(", ")}.`,
          },
        ],
      };
    },
  }),

  defineTool({
    name: "listmonk_manage_subscriber_list_membership",
    category: "subscribers",
    title: "Manage Subscriber List Membership",
    description:
      "Adds, removes, or unsubscribes subscribers from a single specific list (`list_id`). Select the " +
      "subscribers with either an explicit `ids` array or a Listmonk SQL `query` (provide exactly one).",
    inputSchema: schemas.manageSubscriberListMembershipSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { list_id, ...body } = args;
      await client.request<boolean>({ method: "PUT", path: `/subscribers/lists/${list_id}`, data: body });
      return { content: [{ type: "text", text: `Applied action "${args.action}" on list #${list_id}.` }] };
    },
  }),

  defineTool({
    name: "listmonk_blocklist_subscribers_bulk",
    category: "subscribers",
    title: "Blocklist Subscribers (Bulk By Ids)",
    description: "Blocklists an explicit set of subscribers by id, preventing further campaign sends to them.",
    inputSchema: schemas.blocklistSubscribersBulkSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "PUT", path: "/subscribers/blocklist", data: { ids: args.ids } });
      return { content: [{ type: "text", text: `Blocklisted ${args.ids.length} subscriber(s).` }] };
    },
  }),

  defineTool({
    name: "listmonk_blocklist_subscriber",
    category: "subscribers",
    title: "Blocklist Subscriber",
    description: "Blocklists a single subscriber by id, preventing further campaign sends to them.",
    inputSchema: schemas.blocklistSubscriberSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "PUT", path: `/subscribers/${args.id}/blocklist`, data: {} });
      return { content: [{ type: "text", text: `Subscriber #${args.id} blocklisted.` }] };
    },
  }),

  defineTool({
    name: "listmonk_export_subscriber",
    category: "subscribers",
    title: "Export Subscriber Data",
    description:
      "Exports a subscriber's full profile (personal data, list memberships, campaign views) as a JSON " +
      "object, e.g. for GDPR data-subject access requests.",
    inputSchema: schemas.exportSubscriberSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const data = await client.request<unknown>({ method: "GET", path: `/subscribers/${args.id}/export` });
      return { content: [{ type: "text", text: formatObject(data, "json", `Subscriber #${args.id} export`) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_subscriber_bounces",
    category: "subscribers",
    title: "Get Subscriber Bounces",
    description: "Lists bounce records recorded for a single subscriber.",
    inputSchema: schemas.getSubscriberBouncesSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const bounces = await client.request<Bounce[]>({ method: "GET", path: `/subscribers/${args.id}/bounces` });
      return { content: [{ type: "text", text: formatObject(bounces, args.response_format, `Bounces for subscriber #${args.id}`) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_subscriber_bounces",
    category: "subscribers",
    title: "Delete Subscriber Bounces",
    description: "Deletes all bounce records for a single subscriber.",
    inputSchema: schemas.deleteSubscriberBouncesSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/subscribers/${args.id}/bounces` });
      return { content: [{ type: "text", text: `Bounce records for subscriber #${args.id} deleted.` }] };
    },
  }),

  defineTool({
    name: "listmonk_send_subscriber_optin",
    category: "subscribers",
    title: "Send Subscriber Opt-in Email",
    description: "Sends a double opt-in confirmation e-mail to a subscriber for their pending list subscriptions.",
    inputSchema: schemas.sendSubscriberOptinSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "POST", path: `/subscribers/${args.id}/optin` });
      return { content: [{ type: "text", text: `Opt-in email sent to subscriber #${args.id}.` }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_subscribers_by_query",
    category: "subscribers",
    title: "Delete Subscribers By Query",
    description:
      "BULK, IRREVERSIBLE, NO-PREVIEW: permanently deletes every subscriber matching a Listmonk SQL " +
      "`query` expression. Always call listmonk_list_subscribers with the same query first to confirm " +
      "the match count before using this tool.",
    inputSchema: schemas.deleteSubscribersByQuerySchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "POST", path: "/subscribers/query/delete", data: { query: args.query } });
      return { content: [{ type: "text", text: `Deleted all subscribers matching query: ${args.query}` }] };
    },
  }),

  defineTool({
    name: "listmonk_blocklist_subscribers_by_query",
    category: "subscribers",
    title: "Blocklist Subscribers By Query",
    description:
      "BULK, NO-PREVIEW: blocklists every subscriber matching a Listmonk SQL `query` expression. Always " +
      "call listmonk_list_subscribers with the same query first to confirm the match count.",
    inputSchema: schemas.blocklistSubscribersByQuerySchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "PUT", path: "/subscribers/query/blocklist", data: { query: args.query } });
      return { content: [{ type: "text", text: `Blocklisted all subscribers matching query: ${args.query}` }] };
    },
  }),

  defineTool({
    name: "listmonk_manage_subscriber_lists_by_query",
    category: "subscribers",
    title: "Manage Subscriber Lists By Query",
    description:
      "BULK, NO-PREVIEW: adds, removes, or unsubscribes every subscriber matching a Listmonk SQL `query` " +
      "expression from one or more target lists. Always call listmonk_list_subscribers with the same " +
      "query first to confirm the match count.",
    inputSchema: schemas.manageSubscriberListsByQuerySchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { query, action, target_list_ids, status } = args;
      await client.request<boolean>({
        method: "PUT",
        path: "/subscribers/query/lists",
        data: { query, action, target_list_ids, status },
      });
      return {
        content: [
          { type: "text", text: `Applied action "${action}" on list(s) ${target_list_ids.join(", ")} for query: ${query}` },
        ],
      };
    },
  }),
];
