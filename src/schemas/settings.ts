import { z } from "zod";
import { responseFormatField } from "./common.js";

export const getSettingsSchema = {
  response_format: responseFormatField,
} satisfies z.ZodRawShape;

export const updateSettingsSchema = {
  settings: z
    .record(z.unknown())
    .describe(
      "Settings fields to update, using the exact dotted keys Listmonk uses internally " +
        "(e.g. 'app.site_name', 'smtp'). Fetch the current object with listmonk_get_settings first, " +
        "modify only the keys you need, and pass them here. This tool fetches the current full " +
        "settings object and merges your keys into it before saving — Listmonk's own PUT /settings " +
        "replaces the ENTIRE object, so a naive partial submission would silently reset every " +
        "unspecified field to blank/off; the merge step is what makes a partial update safe. Always " +
        "confirm with the user before changing SMTP/server settings."
    ),
} satisfies z.ZodRawShape;

export const testSmtpSettingsSchema = {
  email: z.string().email().describe("Recipient address that the SMTP test message will be sent to."),
  smtp_settings: z
    .record(z.unknown())
    .describe(
      "The SMTP server block to test — fields like host, port, auth_protocol, username, password, " +
        "tls_type (see the 'smtp' array entries from listmonk_get_settings for the expected shape). " +
        "This tests connectivity WITHOUT saving the settings."
    ),
} satisfies z.ZodRawShape;
