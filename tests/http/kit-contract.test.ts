import { createMcpHttpApp, loadConfig } from "@kieksme/mcp-http-kit";
import {
  createAppTestClient,
  createKitContractAssertions,
  readMcpJsonResponse,
} from "@kieksme/mcp-http-kit/test";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { withHealthzAlias } from "../../src/httpApp.js";
import { createListmonkServer } from "../../src/server.js";
import { ALL_TOOLS } from "../../src/tools/index.js";

const TOKEN = "test-bearer-token-for-kit-contract";

describe("kit HTTP contract", () => {
  const ENV_KEYS = [
    "MCP_TRANSPORT",
    "MCP_AUTH_MODE",
    "MCP_AUTH_TOKEN",
    "MCP_HTTP_HOST",
    "MCP_ALLOWED_HOSTS",
    "PORT",
    "LISTMONK_URL",
    "LISTMONK_API_USER",
    "LISTMONK_API_TOKEN",
    "LISTMONK_ENABLED_TOOLS",
  ] as const;
  let saved: Record<string, string | undefined>;

  beforeEach(() => {
    saved = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
    for (const k of ENV_KEYS) delete process.env[k];
    process.env.MCP_TRANSPORT = "http";
    process.env.MCP_AUTH_MODE = "bearer";
    process.env.MCP_AUTH_TOKEN = TOKEN;
    process.env.MCP_HTTP_HOST = "127.0.0.1";
    process.env.PORT = "3456";
    process.env.LISTMONK_URL = "https://listmonk.example.com";
    process.env.LISTMONK_API_USER = "api-user";
    process.env.LISTMONK_API_TOKEN = "api-token";
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] === undefined) delete process.env[k];
      else process.env[k] = saved[k];
    }
  });

  function build(wrapHealthz = false) {
    const config = loadConfig(process.env, { realm: "listmonk-mcp" });
    const baseApp = createMcpHttpApp({ createServer: createListmonkServer, config });
    const app = wrapHealthz ? withHealthzAlias(baseApp, config) : baseApp;
    const client = createAppTestClient(app, config);
    const assertions = createKitContractAssertions(client, config);
    return { config, app, client, assertions };
  }

  it("passes kit contract: health, 401, Host/Origin, initialize + tools/list", async () => {
    const { assertions } = build();
    await assertions.healthUnauthenticated();
    await assertions.unauthorizedWithoutToken();
    await assertions.forbiddenOnBadHost();
    await assertions.forbiddenOnBadOrigin();
    const { tools } = await assertions.initializeAndListTools(TOKEN);
    expect(tools.length).toBe(ALL_TOOLS.length);
  });

  it("serves /healthz as an alias of /health", async () => {
    const { client } = build(true);
    const alias = await client.fetch("/healthz", {
      method: "GET",
      headers: { host: "evil.example" },
    });
    expect(alias.status).toBe(200);
    expect(await alias.json()).toEqual({ status: "ok" });
  });

  it("honors X-Listmonk-Enabled-Tools on tools/list", async () => {
    const { client } = build();
    const listResponse = await client.mcp({
      token: TOKEN,
      headers: {
        "mcp-protocol-version": "2025-06-18",
        "x-listmonk-enabled-tools": "lists",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
        params: {},
      }),
    });
    expect(listResponse.ok).toBe(true);
    const payload = (await readMcpJsonResponse(listResponse)) as {
      result?: { tools?: Array<{ name: string }> };
    };
    const names = (payload.result?.tools ?? []).map((t) => t.name);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((n) => n.includes("list") || n.startsWith("listmonk_"))).toBe(true);
    expect(names).toContain("listmonk_list_lists");
    expect(names).not.toContain("listmonk_list_subscribers");
  });
});
