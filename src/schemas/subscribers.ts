import { z } from "zod";
import { idField, pageField, perPageField, responseFormatField } from "./common.js";

const subscriberStatus = z.enum(["enabled", "disabled", "blocklisted"]);
const subscriptionStatus = z.enum(["unconfirmed", "confirmed", "unsubscribed"]);

export const listSubscribersSchema = {
  page: pageField,
  per_page: perPageField,
  query: z
    .string()
    .optional()
    .describe(
      "Filter subscribers with a Listmonk SQL expression over the subscribers table, " +
        "e.g. \"subscribers.email LIKE '%@example.com'\". Omit to list all."
    ),
  order_by: z.enum(["name", "status", "created_at", "updated_at"]).optional(),
  order: z.enum(["ASC", "DESC"]).optional(),
  subscription_status: subscriptionStatus.optional().describe("Only applies when list_id is given."),
  list_id: z.array(z.number().int()).optional().describe("Restrict to subscribers of these list ids."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const createSubscriberSchema = {
  email: z.string().email(),
  name: z.string().min(1),
  status: subscriberStatus.default("enabled"),
  lists: z.array(z.number().int()).optional().describe("List ids to subscribe to."),
  list_uuids: z.array(z.string()).optional(),
  preconfirm_subscriptions: z.boolean().optional().describe("Mark list subscriptions as confirmed immediately."),
  attribs: z.record(z.unknown()).optional().describe("Arbitrary custom attributes as a JSON object."),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const getSubscriberSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const updateSubscriberSchema = {
  id: idField,
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  status: subscriberStatus.optional(),
  lists: z.array(z.number().int()).optional(),
  list_uuids: z.array(z.string()).optional(),
  preconfirm_subscriptions: z.boolean().optional(),
  attribs: z.record(z.unknown()).optional(),
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteSubscriberSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const deleteSubscribersByIdsSchema = {
  ids: z.array(z.number().int()).min(1).describe("Subscriber ids to delete."),
} satisfies z.ZodRawShape;

export const manageSubscriberListsBulkSchema = {
  ids: z.array(z.number().int()).min(1).describe("Subscriber ids to modify."),
  action: z.enum(["add", "remove", "unsubscribe"]),
  target_list_ids: z.array(z.number().int()).min(1).describe("List ids to add/remove/unsubscribe from."),
  status: subscriptionStatus.optional().describe("Subscription status to set when action is 'add'."),
} satisfies z.ZodRawShape;

export const manageSubscriberListMembershipSchema = {
  list_id: idField.describe("The list whose subscriber membership is being modified."),
  ids: z.array(z.number().int()).optional().describe("Subscriber ids to modify (use this or query, not both)."),
  query: z.string().optional().describe("Listmonk SQL expression selecting subscribers (use this or ids)."),
  action: z.enum(["add", "remove", "unsubscribe"]),
  status: subscriptionStatus.optional().describe("Subscription status to set when action is 'add'."),
} satisfies z.ZodRawShape;

export const blocklistSubscribersBulkSchema = {
  ids: z.array(z.number().int()).min(1).describe("Subscriber ids to blocklist."),
} satisfies z.ZodRawShape;

export const blocklistSubscriberSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const exportSubscriberSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const getSubscriberBouncesSchema = {
  id: idField,
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const deleteSubscriberBouncesSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const sendSubscriberOptinSchema = {
  id: idField,
} satisfies z.ZodRawShape;

export const deleteSubscribersByQuerySchema = {
  query: z
    .string()
    .min(1)
    .describe(
      "Listmonk SQL expression selecting subscribers to permanently delete. " +
        "THIS IS A BULK, IRREVERSIBLE, NO-PREVIEW OPERATION. Always call listmonk_list_subscribers " +
        "with the same query first to verify the exact match count before calling this tool."
    ),
} satisfies z.ZodRawShape;

export const blocklistSubscribersByQuerySchema = {
  query: z
    .string()
    .min(1)
    .describe(
      "Listmonk SQL expression selecting subscribers to blocklist in bulk. " +
        "Always call listmonk_list_subscribers with the same query first to verify the match count."
    ),
} satisfies z.ZodRawShape;

export const manageSubscriberListsByQuerySchema = {
  query: z
    .string()
    .min(1)
    .describe(
      "Listmonk SQL expression selecting subscribers to modify in bulk. " +
        "Always call listmonk_list_subscribers with the same query first to verify the match count."
    ),
  action: z.enum(["add", "remove", "unsubscribe"]),
  target_list_ids: z.array(z.number().int()).min(1),
  status: subscriptionStatus.optional().describe("Subscription status to set when action is 'add'."),
} satisfies z.ZodRawShape;
