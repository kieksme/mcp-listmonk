import type { KitConfig, McpHttpApp } from "@kieksme/mcp-http-kit";

/**
 * Kit serves only `config.http.healthPath` (default `/health`). Keep `/healthz`
 * as an unauthenticated alias for existing probes / older deploy configs.
 */
export function withHealthzAlias(app: McpHttpApp, kitConfig: KitConfig): McpHttpApp {
  return {
    close: () => app.close(),
    fetch: (request: Request) => {
      const url = new URL(request.url);
      if (request.method === "GET" && url.pathname === "/healthz") {
        url.pathname = kitConfig.http.healthPath;
        return app.fetch(new Request(url, request));
      }
      return app.fetch(request);
    },
  };
}
