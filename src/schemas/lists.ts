import { z } from "zod";
import { idField, pageField, perPageField, responseFormatField } from "./common.js";

const listType = z.enum(["public", "private"]);
const optinType = z.enum(["single", "double"]);

export const listListsSchema = {
  page: pageField,
  per_page: perPageField,
  query: z.string().optional().describe("Search lists by name."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const createListSchema = {
  name: z.string().min(1),
  type: listType,
  optin: optinType,
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getListSchema = {
  list_id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const updateListSchema = {
  list_id: idField,
  name: z.string().min(1).optional(),
  type: listType.optional(),
  optin: optinType.optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteListSchema = {
  list_id: idField,
} satisfies z.ZodRawShape;
