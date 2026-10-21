#!/usr/bin/env node
/**
 * Listmonk MCP server entrypoint.
 *
 * Transport (breaking change vs ≤1.3):
 * - Default: stdio (local MCP clients spawn this process)
 * - HTTP: set `MCP_TRANSPORT=http` or pass `--http`
 * - `--stdio` still forces stdio (redundant with the new default)
 *
 * HTTP auth/config comes from `@kieksme/mcp-http-kit` (`MCP_AUTH_TOKEN`, etc.).
 * Legacy `MCP_SERVER_AUTH_TOKEN` is accepted as a deprecated alias by the kit.
 */
import {
  createMcpHttpApp,
  createNodeHttpServer,
  loadConfig,
  startMcpServer,
  type RequestContext,
} from "@kieksme/mcp-http-kit";
import { applyCliTransportOverrides, assertEnvCredentialsPresent } from "./config.js";
import { withHealthzAlias } from "./httpApp.js";
import { assertUniqueToolNames } from "./registry/toolRegistry.js";
import { createListmonkServer, SERVER_NAME } from "./server.js";
import { ALL_TOOLS } from "./tools/index.js";
import { loadPackageVersion } from "./version.js";

assertUniqueToolNames(ALL_TOOLS);

const env = applyCliTransportOverrides(process.argv, process.env);
assertEnvCredentialsPresent(env);

const config = loadConfig(env, { realm: "listmonk-mcp" });
const version = loadPackageVersion();

function createServer(ctx: RequestContext) {
  return createListmonkServer(ctx);
}

async function main(): Promise<void> {
  if (config.transport === "stdio") {
    const started = await startMcpServer({ createServer, config, env });
    console.error(`${SERVER_NAME} v${version} running on stdio`);
    console.error(
      env.LISTMONK_ENABLED_TOOLS?.trim()
        ? `Enabled tool selectors: ${env.LISTMONK_ENABLED_TOOLS}`
        : `All ${ALL_TOOLS.length} tools enabled.`
    );
    void started;
    return;
  }

  const baseApp = createMcpHttpApp({ createServer, config });
  const app = withHealthzAlias(baseApp, config);
  const server = createNodeHttpServer({ app, config });

  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(config.http.port, config.http.host, () => resolve());
  });

  const host = config.http.host === "0.0.0.0" ? "127.0.0.1" : config.http.host;
  const url = `http://${host}:${config.http.port}${config.http.path}`;
  console.error(
    `${SERVER_NAME} v${version} listening on ${config.http.host}:${config.http.port} ` +
      `(POST ${config.http.path}, GET ${config.http.healthPath}, GET /healthz alias; auth=${config.auth.mode})`
  );
  console.error(`MCP URL: ${url}`);
  console.error(
    env.LISTMONK_ENABLED_TOOLS?.trim()
      ? `Default enabled tool selectors: ${env.LISTMONK_ENABLED_TOOLS}`
      : `All ${ALL_TOOLS.length} tools enabled by default.`
  );

  for (const warning of config.warnings) {
    console.warn(`[mcp-http-kit] ${warning}`);
  }

  const close = async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await app.close();
  };
  process.once("SIGTERM", () => void close());
  process.once("SIGINT", () => void close());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Failed to start listmonk-mcp");
  process.exitCode = 1;
});
