import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { loadConfig, parseEnabledToolsEnv } from "../src/config.js";

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

describe("loadConfig", () => {
  const ENV_KEYS = ["LISTMONK_URL", "LISTMONK_API_USER", "LISTMONK_API_TOKEN", "PORT", "LISTMONK_ENABLED_TOOLS", "MCP_SERVER_AUTH_TOKEN"];
  let savedEnv: Record<string, string | undefined>;

  beforeEach(() => {
    savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]));
    for (const k of ENV_KEYS) delete process.env[k];
    process.env.LISTMONK_URL = "https://listmonk.example.com";
    process.env.LISTMONK_API_USER = "api-user";
    process.env.LISTMONK_API_TOKEN = "api-token";
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (savedEnv[k] === undefined) delete process.env[k];
      else process.env[k] = savedEnv[k];
    }
    vi.restoreAllMocks();
  });

  it("loads a full config from environment variables", () => {
    process.env.PORT = "8080";
    process.env.LISTMONK_ENABLED_TOOLS = "subscribers,lists";
    process.env.MCP_SERVER_AUTH_TOKEN = "secret-token";
    vi.spyOn(console, "warn").mockImplementation(() => {});

    const config = loadConfig();

    expect(config).toEqual({
      listmonkUrl: "https://listmonk.example.com",
      listmonkApiUser: "api-user",
      listmonkApiToken: "api-token",
      port: 8080,
      enabledToolSelectors: ["subscribers", "lists"],
      serverAuthToken: "secret-token",
    });
  });

  it("defaults port to 3000 when PORT is not set", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(loadConfig().port).toBe(3000);
  });

  it("treats an empty MCP_SERVER_AUTH_TOKEN as undefined and warns", () => {
    process.env.MCP_SERVER_AUTH_TOKEN = "";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const config = loadConfig();

    expect(config.serverAuthToken).toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("MCP_SERVER_AUTH_TOKEN is not set"));
  });

  it("does not warn when MCP_SERVER_AUTH_TOKEN is set", () => {
    process.env.MCP_SERVER_AUTH_TOKEN = "secret-token";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    loadConfig();

    expect(warnSpy).not.toHaveBeenCalled();
  });

  it("exits the process with an error when a required env var is missing", () => {
    delete process.env.LISTMONK_URL;
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(((() => {
      throw new Error("process.exit called");
    }) as unknown) as typeof process.exit);

    expect(() => loadConfig()).toThrow("process.exit called");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("LISTMONK_URL"));
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
