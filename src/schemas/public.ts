import { z } from "zod";
import { responseFormatField } from "./common.js";

export const getPublicListsSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const createPublicSubscriptionSchema = {
  email: z.string().email(),
  name: z.string().optional(),
  list_uuids: z.array(z.string()).min(1).describe("UUIDs of the public lists to subscribe to."),
} satisfies z.ZodRawShape;
