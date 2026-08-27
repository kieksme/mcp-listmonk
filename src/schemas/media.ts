import { z } from "zod";
import { idField, pageField, perPageField, responseFormatField } from "./common.js";

export const listMediaSchema = {
  page: pageField,
  per_page: perPageField,
  query: z.string().optional().describe("Search media filenames."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const uploadMediaSchema = {
  file_name: z.string().min(1).describe("Original filename incl. extension, e.g. 'banner.png'."),
  file_content_base64: z.string().min(1).describe("Base64-encoded file bytes."),
  content_type: z.string().optional().describe("MIME type, e.g. 'image/png'. Guessed from extension if omitted."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getMediaSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteMediaSchema = {
  id: idField,
} satisfies z.ZodRawShape;
