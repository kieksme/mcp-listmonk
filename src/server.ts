import { McpServer } from "@modelcontextprotocol/server";
import type { RequestContext } from "@kieksme/mcp-http-kit";
import {
  resolveEnabledToolSelectorsForRequest,
  resolveListmonkCredentials,
} from "./config.js";
import { resolveEnabledToolNames } from "./registry/filter.js";
import { registerFilteredTools } from "./registry/toolRegistry.js";
import { ListmonkClient } from "./services/listmonkClient.js";
import { ALL_TOOLS } from "./tools/index.js";
import { loadPackageVersion } from "./version.js";

export const SERVER_NAME = "listmonk-mcp-server";

/**
 * Build one MCP server instance for the current request (HTTP) or process (stdio).
 *
 * Per-request: optional `X-Listmonk-Enabled-Tools` / `?tools=` override, and
 * optional header-mode upstream credentials (`X-Listmonk-Url` / `-User` / `-Token`).
 */
export function createListmonkServer(ctx: RequestContext): McpServer {
  const credentials = resolveListmonkCredentials(ctx);
  const client = new ListmonkClient(credentials);
  const selectors = resolveEnabledToolSelectorsForRequest(ctx);
  const enabledNames = resolveEnabledToolNames(selectors, ALL_TOOLS);

  const server = new McpServer(
    { name: SERVER_NAME, version: loadPackageVersion() },
    { capabilities: { tools: {} } }
  );
  registerFilteredTools(server, client, ALL_TOOLS, enabledNames);
  return server;
}
