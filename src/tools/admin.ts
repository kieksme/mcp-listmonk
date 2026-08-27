import * as schemas from "../schemas/admin.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const adminTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_reload_app",
    category: "admin",
    title: "Reload Listmonk App",
    description:
      "Restarts Listmonk's background workers/app process (used after certain settings changes). " +
      "Briefly interrupts campaign sending and API availability. Confirm with the user before calling.",
    inputSchema: schemas.reloadAppSchema,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: true },
    handler: async (client) => {
      await client.request<boolean>({ method: "POST", path: "/admin/reload" });
      return { content: [{ type: "text", text: "Listmonk app reload triggered." }] };
    },
  }),
];
