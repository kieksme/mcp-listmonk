import { formatObject } from "../formatters/generic.js";
import * as schemas from "../schemas/settings.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const settingsTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_get_settings",
    category: "settings",
    title: "Get Settings",
    description: "Returns Listmonk's full server settings object (SMTP, app config, privacy, security, etc).",
    inputSchema: schemas.getSettingsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const settings = await client.request<unknown>({ method: "GET", path: "/settings" });
      return { content: [{ type: "text", text: formatObject(settings, args.response_format, "Settings") }] };
    },
  }),

  defineTool({
    name: "listmonk_update_settings",
    category: "settings",
    title: "Update Settings",
    description:
      "Updates Listmonk server settings. THIS CAN AFFECT MAIL DELIVERY AND SERVER BEHAVIOR SERVER-WIDE — " +
      "confirm the exact keys/values with the user before calling. Fetch current values with " +
      "listmonk_get_settings first.",
    inputSchema: schemas.updateSettingsSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      // Listmonk's PUT /settings replaces the entire settings object, so any key not present in
      // the request is persisted as its zero value. Fetch-and-merge makes a partial update safe.
      const current = await client.request<Record<string, unknown>>({ method: "GET", path: "/settings" });
      const merged = { ...current, ...args.settings };
      await client.request<boolean>({ method: "PUT", path: "/settings", data: merged });
      return { content: [{ type: "text", text: `Settings updated: ${Object.keys(args.settings).join(", ")}` }] };
    },
  }),

  defineTool({
    name: "listmonk_test_smtp_settings",
    category: "settings",
    title: "Test SMTP Settings",
    description: "Tests connectivity to an SMTP server configuration without saving it, by sending a test e-mail.",
    inputSchema: schemas.testSmtpSettingsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({
        method: "POST",
        path: "/settings/smtp/test",
        data: { ...args.smtp_settings, email: args.email },
      });
      return { content: [{ type: "text", text: `SMTP connection test succeeded; test email sent to ${args.email}.` }] };
    },
  }),
];
