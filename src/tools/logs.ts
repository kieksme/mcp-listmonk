import * as schemas from "../schemas/logs.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const logsTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_get_logs",
    category: "logs",
    title: "Get Server Logs",
    description: "Returns Listmonk's recent in-memory application log entries.",
    inputSchema: schemas.getLogsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client) => {
      const lines = await client.request<string[]>({ method: "GET", path: "/logs" });
      return { content: [{ type: "text", text: lines.length ? lines.join("\n") : "(no log entries)" }] };
    },
  }),
];
