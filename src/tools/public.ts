import { formatObject } from "../formatters/generic.js";
import * as schemas from "../schemas/public.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

interface PublicList {
  uuid: string;
  name: string;
}

export const publicTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_get_public_lists",
    category: "public",
    title: "Get Public Lists",
    description: "Returns the public-facing list of subscribable mailing lists (uuid + name only), as seen by the public subscription page.",
    inputSchema: schemas.getPublicListsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const lists = await client.request<PublicList[]>({ method: "GET", path: "/public/lists" });
      return { content: [{ type: "text", text: formatObject(lists, args.response_format, "Public lists") }] };
    },
  }),

  defineTool({
    name: "listmonk_create_public_subscription",
    category: "public",
    title: "Create Public Subscription",
    description:
      "Submits a subscription request via Listmonk's public (unauthenticated) subscription endpoint, " +
      "as if a visitor filled out the public sign-up form. Triggers double opt-in e-mails for lists that " +
      "require them.",
    inputSchema: schemas.createPublicSubscriptionSchema,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    handler: async (client, args) => {
      const result = await client.request<{ has_optin: boolean }>({
        method: "POST",
        path: "/public/subscription",
        data: args,
      });
      const optinNote = result.has_optin
        ? " A double opt-in confirmation e-mail was sent; the subscription is pending until confirmed."
        : " No confirmation e-mail was needed; the subscription is active immediately.";
      return { content: [{ type: "text", text: `Subscription request submitted for ${args.email}.${optinNote}` }] };
    },
  }),
];
