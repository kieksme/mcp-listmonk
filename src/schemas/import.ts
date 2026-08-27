import { z } from "zod";
import { responseFormatField } from "./common.js";

export const getImportStatusSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const importSubscribersSchema = {
  file_name: z.string().min(1).describe("Filename, e.g. 'subscribers.zip'."),
  file_content_base64: z.string().min(1).describe("Base64-encoded ZIP archive containing one or more CSV files."),
  mode: z.enum(["subscribe", "blocklist"]).default("subscribe"),
  subscription_status: z.enum(["unconfirmed", "confirmed", "unsubscribed"]).default("unconfirmed"),
  delimiter: z.string().length(1).default(","),
  list_ids: z.array(z.number().int()).min(1).describe("List ids to import subscribers into."),
  overwrite: z.boolean().default(false).describe("Overwrite existing subscribers' data on conflict."),
} satisfies z.ZodRawShape;

export const stopImportSubscribersSchema = {} satisfies z.ZodRawShape;

export const getImportLogsSchema = {} satisfies z.ZodRawShape;
