import { formatObject } from "../formatters/generic.js";
import * as schemas from "../schemas/import.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";
import type { ImportStatus } from "../types.js";

export const importTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_get_import_status",
    category: "import",
    title: "Get Import Status",
    description: "Returns the status of the current/last subscriber import job.",
    inputSchema: schemas.getImportStatusSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const status = await client.request<ImportStatus>({ method: "GET", path: "/import/subscribers" });
      return { content: [{ type: "text", text: formatObject(status, args.response_format, "Import status") }] };
    },
  }),

  defineTool({
    name: "listmonk_import_subscribers",
    category: "import",
    title: "Import Subscribers",
    description:
      "Bulk-imports subscribers from a ZIP archive of one or more CSV files into the given target lists. " +
      "Runs asynchronously — poll listmonk_get_import_status afterwards to track progress.",
    inputSchema: schemas.importSubscribersSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const buffer = Buffer.from(args.file_content_base64, "base64");
      const form = new FormData();
      form.append(
        "params",
        JSON.stringify({
          mode: args.mode,
          subscription_status: args.subscription_status,
          delim: args.delimiter,
          lists: args.list_ids,
          overwrite: args.overwrite,
        })
      );
      form.append("file", new Blob([buffer], { type: "application/zip" }), args.file_name);
      const status = await client.requestMultipart<ImportStatus>({
        method: "POST",
        path: "/import/subscribers",
        form,
      });
      return { content: [{ type: "text", text: formatObject(status, "markdown", "Import started") }] };
    },
  }),

  defineTool({
    name: "listmonk_stop_import_subscribers",
    category: "import",
    title: "Stop Subscriber Import",
    description: "Sends a stop signal to the currently running subscriber import job.",
    inputSchema: schemas.stopImportSubscribersSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true },
    handler: async (client) => {
      const status = await client.request<ImportStatus>({ method: "DELETE", path: "/import/subscribers" });
      return { content: [{ type: "text", text: formatObject(status, "markdown", "Import stopped") }] };
    },
  }),

  defineTool({
    name: "listmonk_get_import_logs",
    category: "import",
    title: "Get Import Logs",
    description: "Returns the log output of the current/last subscriber import job.",
    inputSchema: schemas.getImportLogsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client) => {
      const logs = await client.request<string>({ method: "GET", path: "/import/subscribers/logs" });
      return { content: [{ type: "text", text: logs || "(no import logs)" }] };
    },
  }),
];
