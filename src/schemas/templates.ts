import { z } from "zod";
import { idField, responseFormatField } from "./common.js";

const templateType = z.enum(["campaign", "campaign_visual", "tx"]);

export const listTemplatesSchema = {
  no_body: z.boolean().default(true).describe("Set false to include each template's full HTML body in the response."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const createTemplateSchema = {
  name: z.string().min(1),
  type: templateType,
  subject: z.string().optional().describe("Subject line (only used when type is 'tx')."),
  body_source: z.string().optional().describe("JSON source for the visual email builder (only for 'campaign_visual')."),
  body: z.string().min(1).describe("HTML body of the template."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getTemplateSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const updateTemplateSchema = {
  id: idField,
  name: z.string().min(1).optional(),
  type: templateType.optional(),
  subject: z.string().optional(),
  body_source: z.string().optional(),
  body: z.string().optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteTemplateSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const previewTemplateDraftSchema = {
  template_type: z.string().min(1).describe("Template type, e.g. 'campaign', 'campaign_visual', or 'tx'."),
  body: z.string().min(1).describe("Unsaved HTML body to render a preview of."),
} satisfies z.ZodRawShape;

export const previewTemplateSchema = {
  id: idField.describe("The saved template to render."),
} satisfies z.ZodRawShape;

export const setDefaultTemplateSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;
