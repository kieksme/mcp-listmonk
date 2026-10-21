import {
  parseUpstreamCredentialMode,
  resolveUpstreamCredential,
  type AuthMode,
  type RequestContext,
  type UpstreamCredentialMode,
} from "@kieksme/mcp-http-kit";

export type ListmonkCredentials = {
  baseUrl: string;
  apiUser: string;
  apiToken: string;
};

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
 * Resolve transport from CLI flags into env before `loadConfig`.
 *
 * Kit default is stdio. `--http` / `--stdio` override `MCP_TRANSPORT`.
 * Prefer env (`MCP_TRANSPORT=http`) for containers; flags are for local CLIs.
 */
export function applyCliTransportOverrides(
  argv: string[] = process.argv,
  env: NodeJS.ProcessEnv = process.env
): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env };
  if (argv.includes("--http")) {
    next.MCP_TRANSPORT = "http";
  } else if (argv.includes("--stdio")) {
    next.MCP_TRANSPORT = "stdio";
  }
  return next;
}

export function resolveListmonkCredentialMode(
  env: NodeJS.ProcessEnv = process.env
): UpstreamCredentialMode {
  return parseUpstreamCredentialMode(env.LISTMONK_CREDENTIAL_MODE, "env");
}

/**
 * Resolve Listmonk URL/user/token from env (default) or per-request headers.
 * Never logs header values — callers must not dump `ctx.headers` either.
 */
export function resolveListmonkCredentials(
  ctx: Pick<RequestContext, "headers" | "auth">,
  env: NodeJS.ProcessEnv = process.env
): ListmonkCredentials {
  const mode = resolveListmonkCredentialMode(env);
  const authMode: AuthMode = ctx.auth.mode;

  const baseUrl = resolveUpstreamCredential(ctx.headers, {
    mode,
    envVar: "LISTMONK_URL",
    headerName: "X-Listmonk-Url",
    authMode,
    env,
  }).value;

  const apiUser = resolveUpstreamCredential(ctx.headers, {
    mode,
    envVar: "LISTMONK_API_USER",
    headerName: "X-Listmonk-User",
    authMode,
    env,
  }).value;

  const apiToken = resolveUpstreamCredential(ctx.headers, {
    mode,
    envVar: "LISTMONK_API_TOKEN",
    headerName: "X-Listmonk-Token",
    authMode,
    env,
  }).value;

  return { baseUrl, apiUser, apiToken };
}

/**
 * Per-request tool selectors: `X-Listmonk-Enabled-Tools` header, else `?tools=`,
 * else process-level `LISTMONK_ENABLED_TOOLS`.
 */
export function resolveEnabledToolSelectorsForRequest(
  ctx: Pick<RequestContext, "headers" | "url">,
  env: NodeJS.ProcessEnv = process.env
): string[] {
  const headerOverride = ctx.headers.get("x-listmonk-enabled-tools");
  if (typeof headerOverride === "string" && headerOverride.trim()) {
    return parseEnabledToolsEnv(headerOverride);
  }

  const queryOverride = ctx.url.searchParams.get("tools");
  if (typeof queryOverride === "string" && queryOverride.trim()) {
    return parseEnabledToolsEnv(queryOverride);
  }

  return parseEnabledToolsEnv(env.LISTMONK_ENABLED_TOOLS);
}

/** Validate required Listmonk env vars early when credential mode is env. */
export function assertEnvCredentialsPresent(env: NodeJS.ProcessEnv = process.env): void {
  if (resolveListmonkCredentialMode(env) !== "env") return;
  for (const name of ["LISTMONK_URL", "LISTMONK_API_USER", "LISTMONK_API_TOKEN"] as const) {
    if (!env[name]?.trim()) {
      throw new Error(`${name} environment variable is required when LISTMONK_CREDENTIAL_MODE=env`);
    }
  }
}
