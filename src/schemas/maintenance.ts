import { z } from "zod";

export const gcSubscribersSchema = {
  type: z.enum(["blocklisted", "orphan"]).describe("Which class of subscribers to permanently delete."),
} satisfies z.ZodRawShape;

export const gcCampaignAnalyticsSchema = {
  type: z.enum(["all", "views", "clicks"]).describe("Which class of campaign analytics to permanently delete."),
  before_date: z
    .string()
    .describe("Delete records older than this RFC3339 timestamp, e.g. '2024-01-01T00:00:00Z' (not just a date)."),
} satisfies z.ZodRawShape;

export const gcUnconfirmedSubscriptionsSchema = {
  before_date: z
    .string()
    .describe(
      "Delete unconfirmed (opt-in pending) subscriptions older than this RFC3339 timestamp, " +
        "e.g. '2024-01-01T00:00:00Z' (not just a date)."
    ),
} satisfies z.ZodRawShape;
