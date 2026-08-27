#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express from "express";
import { loadConfig, parseEnabledToolsEnv } from "./config.js";
import { resolveEnabledToolNames } from "./registry/filter.js";
import { assertUniqueToolNames, registerFilteredTools } from "./registry/toolRegistry.js";
import { ListmonkClient } from "./services/listmonkClient.js";
import { ALL_TOOLS } from "./tools/index.js";

const SERVER_NAME = "listmonk-mcp-server";
const SERVER_VERSION = "1.0.0";

assertUniqueToolNames(ALL_TOOLS);

const config = loadConfig();
const defaultEnabledToolNames = resolveEnabledToolNames(config.enabledToolSelectors, ALL_TOOLS);
const listmonkClient = new ListmonkClient({
  baseUrl: config.listmonkUrl,
  apiUser: config.listmonkApiUser,
  apiToken: config.listmonkApiToken,
});

if (config.transport === "stdio") {
  await runStdio();
} else {
  runHttp();
}

/**
 * Local usage: the client (Claude Desktop, Claude Code, etc.) spawns this
 * process itself and speaks MCP over its stdin/stdout, one server instance
 * per client — so there's exactly one tool set for the process lifetime,
 * fixed at startup from LISTMONK_ENABLED_TOOLS (no per-request override,
 * unlike the HTTP transport below).
 */
async function runStdio() {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} } });
  registerFilteredTools(server, listmonkClient, ALL_TOOLS, defaultEnabledToolNames);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error(`${SERVER_NAME} v${SERVER_VERSION} running on stdio`);
  console.error(`Listmonk instance: ${config.listmonkUrl}`);
  console.error(
    config.enabledToolSelectors.length
      ? `Enabled tool selectors: ${config.enabledToolSelectors.join(", ")}`
      : `All ${ALL_TOOLS.length} tools enabled.`
  );
}

/**
 * Remote usage: a long-running, stateless Streamable HTTP server that any
 * number of clients can connect to independently — a fresh McpServer per
 * request, so each request can carry its own tool-set override.
 */
function runHttp() {
  const app = express();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    if (config.serverAuthToken) {
      const provided = req.header("authorization");
      if (provided !== `Bearer ${config.serverAuthToken}`) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
    }

    try {
      const queryTools = req.query.tools;
      const overrideRaw = req.header("x-listmonk-enabled-tools") ?? (Array.isArray(queryTools) ? undefined : queryTools);
      const enabledNames =
        typeof overrideRaw === "string"
          ? resolveEnabledToolNames(parseEnabledToolsEnv(overrideRaw), ALL_TOOLS)
          : defaultEnabledToolNames;

      const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION }, { capabilities: { tools: {} } });
      registerFilteredTools(server, listmonkClient, ALL_TOOLS, enabledNames);

      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
      res.on("close", () => {
        transport.close();
        server.close();
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      console.error("Error handling /mcp request:", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed. This server runs in stateless mode; use POST /mcp." });
  });

  app.delete("/mcp", (_req, res) => {
    res.status(405).json({ error: "Method not allowed. This server runs in stateless mode; use POST /mcp." });
  });

  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", tools: ALL_TOOLS.length });
  });

  app.listen(config.port, () => {
    console.error(`${SERVER_NAME} v${SERVER_VERSION} listening on port ${config.port} (POST /mcp)`);
    console.error(`Listmonk instance: ${config.listmonkUrl}`);
    console.error(
      config.enabledToolSelectors.length
        ? `Default enabled tool selectors: ${config.enabledToolSelectors.join(", ")}`
        : `All ${ALL_TOOLS.length} tools enabled by default.`
    );
  });
}
