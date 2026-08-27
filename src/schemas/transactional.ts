import { z } from "zod";

export const sendTransactionalMessageSchema = {
  subscriber_email: z.string().email().optional().describe("Recipient by email (use this or subscriber_id)."),
  subscriber_id: z.number().int().optional().describe("Recipient by subscriber id (use this or subscriber_email)."),
  template_id: z.number().int().describe("Id of the transactional ('tx') template to render."),
  from_email: z.string().optional(),
  data: z.record(z.unknown()).optional().describe("Template variables available to the template as {{ .Tx.Data }}."),
  headers: z.array(z.record(z.string())).optional(),
  messenger: z.string().default("email"),
  content_type: z.enum(["richtext", "html", "markdown", "plain"]).optional(),
} satisfies z.ZodRawShape;
