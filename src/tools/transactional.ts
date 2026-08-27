import * as schemas from "../schemas/transactional.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const transactionalTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_send_transactional_message",
    category: "transactional",
    title: "Send Transactional Message",
    description:
      "Sends a one-off transactional e-mail to a subscriber by rendering a 'tx'-type template with the " +
      "given `data`. Requires either subscriber_email or subscriber_id. The subscriber must already exist.",
    inputSchema: schemas.sendTransactionalMessageSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      await client.request<boolean>({ method: "POST", path: "/tx", data: args });
      return {
        content: [
          { type: "text", text: `Transactional message sent to ${args.subscriber_email ?? `subscriber #${args.subscriber_id}`}.` },
        ],
      };
    },
  }),
];
