import { formatCampaign, formatCampaignList } from "../formatters/campaign.js";
import { formatObject } from "../formatters/generic.js";
import * as schemas from "../schemas/campaigns.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { Campaign, PagedResult } from "../types.js";

function toFormBody(fields: Record<string, string | number | undefined>): URLSearchParams {
  const usp = new URLSearchParams();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) usp.append(key, String(value));
  }
  return usp;
}

export const campaignTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_list_campaigns",
    category: "campaigns",
    title: "List Campaigns",
    description: "Lists/searches campaigns with pagination, status/tag filters, and sorting.",
    inputSchema: schemas.listCampaignsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<PagedResult<Campaign>>({
        method: "GET",
        path: "/campaigns",
        params: {
          status: args.status,
          no_body: args.no_body,
          page: args.page,
          per_page: args.per_page,
          tag: args.tags,
          order_by: args.order_by,
          order: args.order,
          query: args.query,
        },
      });
      const text = formatCampaignList(result.results, result.total, result.page, result.per_page, args.response_format);
      return { content: [{ type: "text", text }] };
    },
  }),

  defineTool({
    name: "listmonk_create_campaign",
    category: "campaigns",
    title: "Create Campaign",
    description: "Creates a new campaign as a draft. Drafts must be explicitly scheduled/started via listmonk_update_campaign_status.",
    inputSchema: schemas.createCampaignSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { response_format, ...body } = args;
      const campaign = await client.request<Campaign>({ method: "POST", path: "/campaigns", data: body });
      return { content: [{ type: "text", text: formatCampaign(campaign, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_campaign",
    category: "campaigns",
    title: "Get Campaign",
    description: "Retrieves a single campaign by id.",
    inputSchema: schemas.getCampaignSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const campaign = await client.request<Campaign>({
        method: "GET",
        path: `/campaigns/${args.id}`,
        params: { no_body: args.no_body },
      });
      return { content: [{ type: "text", text: formatCampaign(campaign, args.response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_update_campaign",
    category: "campaigns",
    title: "Update Campaign",
    description:
      "Updates fields on an existing campaign by id. Only provided fields are changed. Does not change " +
      "campaign status/schedule — use listmonk_update_campaign_status for that.",
    inputSchema: schemas.updateCampaignSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const { id, response_format, ...body } = args;
      const campaign = await client.request<Campaign>({ method: "PUT", path: `/campaigns/${id}`, data: body });
      return { content: [{ type: "text", text: formatCampaign(campaign, response_format) }] };
    },
  }),

  defineTool({
    name: "listmonk_delete_campaign",
    category: "campaigns",
    title: "Delete Campaign",
    description: "Permanently deletes a campaign by id. Only campaigns that have not started sending can be deleted.",
    inputSchema: schemas.deleteCampaignSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "DELETE", path: `/campaigns/${args.id}` });
      return { content: [{ type: "text", text: `Campaign #${args.id} deleted.` }] };
    },
  }),

  defineTool({
    name: "listmonk_get_running_campaign_stats",
    category: "campaigns",
    title: "Get Running Campaign Stats",
    description: "Returns live send-rate statistics for all currently running campaigns.",
    inputSchema: schemas.getRunningCampaignStatsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const stats = await client.request<unknown>({ method: "GET", path: "/campaigns/running/stats" });
      return { content: [{ type: "text", text: formatObject(stats, args.response_format, "Running campaign stats") }] };
    },
  }),

  defineTool({
    name: "listmonk_get_campaign_analytics",
    category: "campaigns",
    title: "Get Campaign Analytics",
    description:
      "Returns view/click/link/bounce analytics for one or more campaigns over a date range " +
      "(`from`/`to` as ISO 8601 timestamps).",
    inputSchema: schemas.getCampaignAnalyticsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const data = await client.request<unknown>({
        method: "GET",
        path: `/campaigns/analytics/${args.type}`,
        params: { id: args.campaign_ids, from: args.from, to: args.to },
      });
      return { content: [{ type: "text", text: formatObject(data, args.response_format, `${args.type} analytics`) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_campaign_preview",
    category: "campaigns",
    title: "Get Campaign Preview",
    description: "Renders an HTML (or plain-text) preview of a campaign exactly as currently saved in Listmonk.",
    inputSchema: schemas.getCampaignPreviewSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const rendered = await client.request<string>({ method: "GET", path: `/campaigns/${args.id}/preview` });
      return { content: [{ type: "text", text: rendered }] };
    },
  }),

  defineTool({
    name: "listmonk_preview_campaign_draft",
    category: "campaigns",
    title: "Preview Unsaved Campaign Content",
    description:
      "Renders an HTML/text preview of an UNSAVED body/content_type combination for campaign `id`, using " +
      "the campaign's other saved fields (subject, lists), without persisting anything. Use before " +
      "listmonk_update_campaign to check formatting.",
    inputSchema: schemas.previewCampaignDraftSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const rendered = await client.request<string>({
        method: "POST",
        path: `/campaigns/${args.id}/preview`,
        data: toFormBody({ content_type: args.content_type, template_id: args.template_id, body: args.body }),
      });
      return { content: [{ type: "text", text: rendered }] };
    },
  }),

  defineTool({
    name: "listmonk_preview_campaign_text",
    category: "campaigns",
    title: "Preview Campaign As Plain Text",
    description:
      "Renders the plain-text version of a campaign (defaults content_type to 'plain'), useful for " +
      "checking the text-fallback rendering or for spam-score review. Does not persist anything.",
    inputSchema: schemas.previewCampaignTextSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const rendered = await client.request<string>({
        method: "POST",
        path: `/campaigns/${args.id}/text`,
        data: toFormBody({ content_type: args.content_type, template_id: args.template_id, body: args.body }),
      });
      return { content: [{ type: "text", text: rendered }] };
    },
  }),

  defineTool({
    name: "listmonk_update_campaign_status",
    category: "campaigns",
    title: "Update Campaign Status",
    description:
      "Changes a campaign's lifecycle status, e.g. set to 'running' to start sending, 'paused' or " +
      "'cancelled' to stop an in-flight send. This is how campaigns are actually launched — creating a " +
      "campaign alone leaves it as a 'draft'.",
    inputSchema: schemas.updateCampaignStatusSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<unknown>({
        method: "PUT",
        path: `/campaigns/${args.id}/status`,
        data: { status: args.status },
      });
      return { content: [{ type: "text", text: `Campaign #${args.id} status set to "${args.status}".` }] };
    },
  }),

  defineTool({
    name: "listmonk_update_campaign_archive",
    category: "campaigns",
    title: "Update Campaign Archive Settings",
    description: "Publishes or unpublishes a campaign to Listmonk's public campaign archive page.",
    inputSchema: schemas.updateCampaignArchiveSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const { id, ...body } = args;
      await client.request<unknown>({ method: "PUT", path: `/campaigns/${id}/archive`, data: body });
      return {
        content: [{ type: "text", text: `Campaign #${id} archive ${args.archive ? "published" : "unpublished"}.` }],
      };
    },
  }),

  defineTool({
    name: "listmonk_convert_campaign_content",
    category: "campaigns",
    title: "Convert Campaign Content Format",
    description:
      "Converts a campaign body between content formats (e.g. markdown to HTML) and returns the " +
      "converted body. This does NOT read or write the campaign's stored body — pass the body text " +
      "explicitly and, if you want to keep the result, save it yourself via listmonk_update_campaign.",
    inputSchema: schemas.convertCampaignContentSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const converted = await client.request<string>({
        method: "POST",
        path: `/campaigns/${args.id}/content`,
        data: { body: args.body, from: args.from, to: args.to },
      });
      return { content: [{ type: "text", text: converted }] };
    },
  }),

  defineTool({
    name: "listmonk_send_campaign_test",
    category: "campaigns",
    title: "Send Campaign Test Email",
    description:
      "Sends a one-off test copy of a campaign to specific subscriber e-mail addresses (they must exist " +
      "as subscribers). Uses the campaign's currently saved fields; pass overrides only for fields you " +
      "want to test differently for this send.",
    inputSchema: schemas.sendCampaignTestSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const { id, subscriber_emails, ...overrides } = args;
      const campaign = await client.request<Campaign>({ method: "GET", path: `/campaigns/${id}` });
      const body = {
        name: overrides.name ?? campaign.name,
        subject: overrides.subject ?? campaign.subject,
        lists: campaign.lists?.map((l) => l.id) ?? [],
        from_email: overrides.from_email ?? campaign.from_email,
        content_type: overrides.content_type ?? campaign.content_type,
        messenger: overrides.messenger ?? campaign.messenger,
        template_id: overrides.template_id ?? campaign.template_id,
        body: overrides.body ?? campaign.body,
        subscribers: subscriber_emails,
      };
      await client.request<boolean>({ method: "POST", path: `/campaigns/${id}/test`, data: body });
      return {
        content: [{ type: "text", text: `Test email for campaign #${id} sent to: ${subscriber_emails.join(", ")}` }],
      };
    },
  }),
];
