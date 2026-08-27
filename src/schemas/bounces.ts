import { z } from "zod";
import { idField, pageField, perPageField, responseFormatField } from "./common.js";

export const listBouncesSchema = {
  campaign_id: z.number().int().optional().describe("Restrict to bounces from a specific campaign."),
  page: pageField,
  per_page: perPageField,
  source: z.string().optional(),
  order_by: z.enum(["email", "campaign_name", "source", "created_at"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteBouncesSchema = {
  all: z.boolean().optional().describe("Set true to delete ALL bounce records."),
  ids: z.array(z.number().int()).optional().describe("Specific bounce ids to delete (use this or `all`)."),
} satisfies z.ZodRawShape;

export const getBounceSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteBounceSchema = {
  id: idField,
} satisfies z.ZodRawShape;
