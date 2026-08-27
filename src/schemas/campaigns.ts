import { z } from "zod";
import { idField, pageField, perPageField, responseFormatField } from "./common.js";

const contentType = z.enum(["richtext", "html", "markdown", "plain", "visual"]);

export const listCampaignsSchema = {
  status: z.array(z.enum(["scheduled", "running", "paused", "cancelled"])).optional(),
  no_body: z.boolean().default(true).describe("Set false to include each campaign's full HTML body."),
  page: pageField,
  per_page: perPageField,
  tags: z.array(z.string()).optional(),
  order_by: z.enum(["name", "status", "created_at", "updated_at"]).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
  query: z.string().optional().describe("Search campaigns by name/subject."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const createCampaignSchema = {
  name: z.string().min(1),
  subject: z.string().min(1),
  lists: z.array(z.number().int()).min(1).describe("List ids to send this campaign to."),
  from_email: z.string().optional(),
  content_type: contentType.default("richtext"),
  messenger: z.string().default("email"),
  type: z.enum(["regular", "optin"]).default("regular"),
  tags: z.array(z.string()).optional(),
  template_id: z.number().int().optional(),
  body: z.string().optional(),
  send_later: z.boolean().optional(),
  send_at: z.string().optional().describe("ISO 8601 timestamp; requires send_later: true."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getCampaignSchema = {
  id: idField,
  no_body: z.boolean().optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const updateCampaignSchema = {
  id: idField,
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  lists: z.array(z.number().int()).optional(),
  from_email: z.string().optional(),
  messenger: z.string().optional(),
  type: z.enum(["regular", "optin"]).optional(),
  tags: z.array(z.string()).optional(),
  template_id: z.number().int().optional(),
  body: z.string().optional(),
  send_later: z.boolean().optional(),
  send_at: z.string().optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteCampaignSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const getRunningCampaignStatsSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getCampaignAnalyticsSchema = {
  type: z.enum(["links", "views", "clicks", "bounces"]),
  campaign_ids: z.array(z.number().int()).min(1),
  from: z.string().describe("Start of date range, e.g. '2024-01-01T00:00:00Z'."),
  to: z.string().describe("End of date range, e.g. '2024-01-31T23:59:59Z'."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getCampaignPreviewSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const previewCampaignDraftSchema = {
  id: idField.describe("Campaign to render the preview for (its lists/subject/etc are used, body is overridden)."),
  content_type: contentType.optional(),
  template_id: z.number().int().optional(),
  body: z.string().min(1).describe("Unsaved HTML/markdown body to render a preview of."),
} satisfies z.ZodRawShape;

export const previewCampaignTextSchema = {
  id: idField,
  content_type: contentType.default("plain"),
  template_id: z.number().int().optional(),
  body: z.string().optional().describe("Unsaved body to render (omit to use the campaign's saved body)."),
} satisfies z.ZodRawShape;

export const updateCampaignStatusSchema = {
  id: idField,
  status: z
    .enum(["scheduled", "running", "paused", "cancelled"])
    .describe("Target status. A 'draft' campaign is moved to 'scheduled' or 'running' to launch it."),
} satisfies z.ZodRawShape;

export const updateCampaignArchiveSchema = {
  id: idField,
  archive: z.boolean().describe("Whether this campaign is published to the public archive."),
  archive_template_id: z.number().int().optional(),
  archive_meta: z.record(z.unknown()).optional(),
  archive_slug: z.string().optional().describe("URL slug for the archived campaign page."),
} satisfies z.ZodRawShape;

export const convertCampaignContentSchema = {
  id: idField,
  body: z.string().min(1),
  from: contentType.describe("Current format of `body`."),
  to: contentType.describe("Format to convert `body` into."),
} satisfies z.ZodRawShape;

export const sendCampaignTestSchema = {
  id: idField,
  subscriber_emails: z.array(z.string().email()).min(1).describe("Recipients of the test send."),
  name: z.string().optional().describe("Override the campaign name for this test send only."),
  subject: z.string().optional(),
  from_email: z.string().optional(),
  content_type: contentType.optional(),
  messenger: z.string().optional(),
  template_id: z.number().int().optional(),
  body: z.string().optional(),
} satisfies z.ZodRawShape;
