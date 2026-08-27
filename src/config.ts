export type McpTransport = "stdio" | "http";

export interface AppConfig {
  listmonkUrl: string;
  listmonkApiUser: string;
  listmonkApiToken: string;
  port: number;
  enabledToolSelectors: string[];
  serverAuthToken: string | undefined;
  transport: McpTransport;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`ERROR: ${name} environment variable is required`);
    process.exit(1);
  }
  return value;
}

/**
 * Parses LISTMONK_ENABLED_TOOLS (and the per-request override) as either a
 * JSON array string or a comma-separated list. Whitespace-only or empty
 * input means "no selectors" (caller treats that as "enable everything").
 */
export function parseEnabledToolsEnv(raw: string | undefined): string[] {
  if (!raw || !raw.trim()) return [];
  const trimmed = raw.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === "string" && v.trim().length > 0);
      }
    } catch {
      // fall through to comma-split
    }
  }
  return trimmed
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/**
 * Resolves which transport to run: `--stdio` on the command line takes
 * precedence, then MCP_TRANSPORT=stdio; anything else (including unset)
 * means the default Streamable HTTP transport.
 */
export function resolveTransport(argv: string[], env: NodeJS.ProcessEnv): McpTransport {
  if (argv.includes("--stdio")) return "stdio";
  return env.MCP_TRANSPORT?.trim().toLowerCase() === "stdio" ? "stdio" : "http";
}

export function loadConfig(): AppConfig {
  const listmonkUrl = requireEnv("LISTMONK_URL");
  const listmonkApiUser = requireEnv("LISTMONK_API_USER");
  const listmonkApiToken = requireEnv("LISTMONK_API_TOKEN");
  const port = Number.parseInt(process.env.PORT ?? "3000", 10);
  const enabledToolSelectors = parseEnabledToolsEnv(process.env.LISTMONK_ENABLED_TOOLS);
  const serverAuthToken = process.env.MCP_SERVER_AUTH_TOKEN || undefined;
  const transport = resolveTransport(process.argv, process.env);

  // The auth-token gate only protects the HTTP transport's /mcp endpoint. In
  // stdio mode there's no network listener — the client spawns and owns the
  // process directly — so the warning would be noise (and misleading).
  if (transport === "http" && !serverAuthToken) {
    console.warn(
      "WARNING: MCP_SERVER_AUTH_TOKEN is not set. The /mcp endpoint is unauthenticated at the " +
        "application layer — anyone who can reach this port gets full Listmonk access in the " +
        "scope of LISTMONK_API_USER. Set MCP_SERVER_AUTH_TOKEN, or ensure network-level access " +
        "control (reverse proxy, VPN, firewall) is in place."
    );
  }

  return { listmonkUrl, listmonkApiUser, listmonkApiToken, port, enabledToolSelectors, serverAuthToken, transport };
}
