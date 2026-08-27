# Changelog

All notable changes to this project are documented in this file.

## [1.0.0] - 2026-08-27

Initial release.

- Streamable HTTP MCP server exposing all 72 Listmonk REST API endpoints across 14 categories (subscribers, campaigns, templates, lists, media, import, bounces, settings, maintenance, public, transactional, logs, admin, miscellaneous).
- Selective tool loading via `LISTMONK_ENABLED_TOOLS` (env var) with a per-request `X-Listmonk-Enabled-Tools` override.
- Optional bearer-token gate in front of `/mcp` via `MCP_SERVER_AUTH_TOKEN`.
- Docker image and npm package (`@kieksme/listmonk-mcp`, runnable via `npx`).
