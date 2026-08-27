import { formatObject } from "../formatters/generic.js";
import * as schemas from "../schemas/misc.js";
import { defineTool, type AnyToolDefinition } from "../registry/toolRegistry.js";

export const miscTools: AnyToolDefinition[] = [
  defineTool({
    name: "listmonk_get_health",
    category: "miscellaneous",
    title: "Get Health Check",
    description: "Checks whether the Listmonk API is reachable and healthy. Use this first to verify connectivity.",
    inputSchema: schemas.getHealthSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client) => {
      const healthy = await client.request<boolean>({ method: "GET", path: "/health" });
      return { content: [{ type: "text", text: healthy ? "Listmonk is healthy." : "Listmonk reported unhealthy." }] };
    },
  }),

  defineTool({
    name: "listmonk_get_server_config",
    category: "miscellaneous",
    title: "Get Server Config",
    description: "Returns Listmonk's general server configuration (site name, languages, permissions, etc).",
    inputSchema: schemas.getServerConfigSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const config = await client.request<unknown>({ method: "GET", path: "/config" });
      return { content: [{ type: "text", text: formatObject(config, args.response_format, "Server config") }] };
    },
  }),

  defineTool({
    name: "listmonk_get_i18n_lang",
    category: "miscellaneous",
    title: "Get I18n Language Pack",
    description: "Returns the UI translation strings for a given language code.",
    inputSchema: schemas.getI18nLangSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const pack = await client.request<unknown>({ method: "GET", path: `/lang/${args.lang}` });
      return { content: [{ type: "text", text: formatObject(pack, args.response_format, `Language pack: ${args.lang}`) }] };
    },
  }),

  defineTool({
    name: "listmonk_get_dashboard_charts",
    category: "miscellaneous",
    title: "Get Dashboard Charts",
    description: "Returns time-series chart data (subscriber growth, campaign views) shown on the Listmonk dashboard.",
    inputSchema: schemas.getDashboardChartsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const charts = await client.request<unknown>({ method: "GET", path: "/dashboard/charts" });
      return { content: [{ type: "text", text: formatObject(charts, args.response_format, "Dashboard charts") }] };
    },
  }),

  defineTool({
    name: "listmonk_get_dashboard_counts",
    category: "miscellaneous",
    title: "Get Dashboard Counts",
    description: "Returns summary counts (total subscribers, lists, campaigns, etc) shown on the Listmonk dashboard.",
    inputSchema: schemas.getDashboardCountsSchema,
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true },
    handler: async (client, args) => {
      const counts = await client.request<unknown>({ method: "GET", path: "/dashboard/counts" });
      return { content: [{ type: "text", text: formatObject(counts, args.response_format, "Dashboard counts") }] };
    },
  }),
];
