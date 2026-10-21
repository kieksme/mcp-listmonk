import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  applyCliTransportOverrides,
  assertEnvCredentialsPresent,
  parseEnabledToolsEnv,
  resolveEnabledToolSelectorsForRequest,
  resolveListmonkCredentialMode,
  resolveListmonkCredentials,
} from "../src/config.js";

describe("applyCliTransportOverrides", () => {
  it("leaves MCP_TRANSPORT unset when neither flag is passed (kit defaults to stdio)", () => {
    expect(applyCliTransportOverrides([], {})).toEqual({});
  });

  it("sets MCP_TRANSPORT=http when --http is passed", () => {
    expect(applyCliTransportOverrides(["node", "index.js", "--http"], {})).toEqual({
      MCP_TRANSPORT: "http",
    });
  });

  it("sets MCP_TRANSPORT=stdio when --stdio is passed", () => {
    expect(applyCliTransportOverrides(["--stdio"], { MCP_TRANSPORT: "http" })).toEqual({
      MCP_TRANSPORT: "stdio",
    });
  });

  it("prefers --http over a prior env value when both could apply", () => {
    expect(applyCliTransportOverrides(["--http"], { MCP_TRANSPORT: "stdio" })).toEqual({
      MCP_TRANSPORT: "http",
    });
  });
});

describe("parseEnabledToolsEnv", () => {
  it("returns an empty array for undefined input", () => {
    expect(parseEnabledToolsEnv(undefined)).toEqual([]);
  });

  it("returns an empty array for whitespace-only input", () => {
    expect(parseEnabledToolsEnv("   ")).toEqual([]);
  });

  it("parses a comma-separated list, trimming whitespace and dropping empties", () => {
    expect(parseEnabledToolsEnv(" subscribers, lists ,,campaigns ")).toEqual(["subscribers", "lists", "campaigns"]);
  });

  it("parses a JSON array string", () => {
    expect(parseEnabledToolsEnv('["subscribers", "lists"]')).toEqual(["subscribers", "lists"]);
  });

  it("drops non-string entries from a JSON array", () => {
    expect(parseEnabledToolsEnv('["subscribers", 42, null, "lists"]')).toEqual(["subscribers", "lists"]);
  });

  it("drops blank string entries from a JSON array", () => {
    expect(parseEnabledToolsEnv('["subscribers", "  ", "lists"]')).toEqual(["subscribers", "lists"]);
  });

  it("falls back to comma-split when JSON parsing of a bracket-looking string fails", () => {
    expect(parseEnabledToolsEnv("[not-valid-json")).toEqual(["[not-valid-json"]);
  });

  it("falls back to comma-split when the JSON value is not an array", () => {
    expect(parseEnabledToolsEnv('{"a": 1}')).toEqual(['{"a": 1}']);
  });
});

describe("resolveListmonkCredentials", () => {
  const ENV_KEYS = [
    "LISTMONK_URL",
    "LISTMONK_API_USER",
    "LISTMONK_API_TOKEN",
    "LISTMONK_CREDENTIAL_MODE",
  ];
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
    for (const k of ENV_KEYS) delete process.env[k];
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
  });

  it("defaults credential mode to env", () => {
    expect(resolveListmonkCredentialMode({})).toBe("env");
  });

  it("reads credentials from env in env mode", () => {
    const env = {
      LISTMONK_URL: "https://listmonk.example.com",
      LISTMONK_API_USER: "api-user",
      LISTMONK_API_TOKEN: "api-token",
    };
    const creds = resolveListmonkCredentials(
      { headers: new Headers(), auth: { mode: "bearer", scopes: [] } },
      env
    );
    expect(creds).toEqual({
      baseUrl: "https://listmonk.example.com",
      apiUser: "api-user",
      apiToken: "api-token",
    });
  });

  it("reads credentials from headers in header mode", () => {
    const headers = new Headers({
      "x-listmonk-url": "https://from-header.example.com",
      "x-listmonk-user": "header-user",
      "x-listmonk-token": "header-token",
    });
    const creds = resolveListmonkCredentials(
      { headers, auth: { mode: "bearer", scopes: [] } },
      { LISTMONK_CREDENTIAL_MODE: "header" }
    );
    expect(creds).toEqual({
      baseUrl: "https://from-header.example.com",
      apiUser: "header-user",
      apiToken: "header-token",
    });
  });

  it("refuses header mode when auth is none", () => {
    expect(() =>
      resolveListmonkCredentials(
        {
          headers: new Headers({
            "x-listmonk-url": "https://x",
            "x-listmonk-user": "u",
            "x-listmonk-token": "t",
          }),
          auth: { mode: "none", scopes: [] },
        },
        { LISTMONK_CREDENTIAL_MODE: "header" }
      )
    ).toThrow(/header/i);
  });

  it("assertEnvCredentialsPresent throws when env credentials are missing", () => {
    expect(() => assertEnvCredentialsPresent({})).toThrow(/LISTMONK_URL/);
  });

  it("assertEnvCredentialsPresent is a no-op in header mode", () => {
    expect(() => assertEnvCredentialsPresent({ LISTMONK_CREDENTIAL_MODE: "header" })).not.toThrow();
  });
});

describe("resolveEnabledToolSelectorsForRequest", () => {
  it("prefers the X-Listmonk-Enabled-Tools header over query and env", () => {
    const selectors = resolveEnabledToolSelectorsForRequest(
      {
        headers: new Headers({ "x-listmonk-enabled-tools": "subscribers" }),
        url: new URL("http://127.0.0.1:3000/mcp?tools=campaigns"),
      },
      { LISTMONK_ENABLED_TOOLS: "lists" }
    );
    expect(selectors).toEqual(["subscribers"]);
  });

  it("falls back to ?tools= when the header is absent", () => {
    const selectors = resolveEnabledToolSelectorsForRequest(
      {
        headers: new Headers(),
        url: new URL("http://127.0.0.1:3000/mcp?tools=campaigns,lists"),
      },
      { LISTMONK_ENABLED_TOOLS: "subscribers" }
    );
    expect(selectors).toEqual(["campaigns", "lists"]);
  });

  it("falls back to LISTMONK_ENABLED_TOOLS when neither override is present", () => {
    const selectors = resolveEnabledToolSelectorsForRequest(
      {
        headers: new Headers(),
        url: new URL("http://127.0.0.1:3000/mcp"),
      },
      { LISTMONK_ENABLED_TOOLS: "admin" }
    );
    expect(selectors).toEqual(["admin"]);
  });
});
