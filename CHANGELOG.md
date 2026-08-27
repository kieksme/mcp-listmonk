# Changelog

All notable changes to this project are documented in this file.

## [1.1.1](https://github.com/kieksme/mcp-listmonk/compare/listmonk-mcp-v1.1.0...listmonk-mcp-v1.1.1) (2026-08-27)


### Bug Fixes

* **ci:** fail docker-publish loudly on an unresolved version ([ce8baeb](https://github.com/kieksme/mcp-listmonk/commit/ce8baebe522835e3f3c3646712fd66294da3e944))
* **ci:** fail docker-publish loudly on an unresolved version ([7531e8f](https://github.com/kieksme/mcp-listmonk/commit/7531e8fc90c981796e98fb1cbfeec6ca79fa24b6))

## [1.1.0](https://github.com/kieksme/mcp-listmonk/compare/listmonk-mcp-v1.0.0...listmonk-mcp-v1.1.0) (2026-08-27)


### Features

* **ci:** add release-please with all conventional-commit categories ([8f16c05](https://github.com/kieksme/mcp-listmonk/commit/8f16c057492f68de82bf0b38443a96524f83215b))
* **ci:** add release-please with all conventional-commit categories ([298f0f4](https://github.com/kieksme/mcp-listmonk/commit/298f0f4ccd5c1419ae311c4515d0656076aba76b))


### Documentation

* add kieks.me README banner ([#6](https://github.com/kieksme/mcp-listmonk/issues/6)) ([2bd483b](https://github.com/kieksme/mcp-listmonk/commit/2bd483bbcac65fde004d33d57f7558516a3bce46))
* add SkillAudit badge ([#8](https://github.com/kieksme/mcp-listmonk/issues/8)) ([f138f19](https://github.com/kieksme/mcp-listmonk/commit/f138f1953a69d520f33c3318c72f2cabecb29813))

## [1.0.0] - 2026-08-27

Initial release.

- Streamable HTTP MCP server exposing all 72 Listmonk REST API endpoints across 14 categories (subscribers, campaigns, templates, lists, media, import, bounces, settings, maintenance, public, transactional, logs, admin, miscellaneous).
- Selective tool loading via `LISTMONK_ENABLED_TOOLS` (env var) with a per-request `X-Listmonk-Enabled-Tools` override.
- Optional bearer-token gate in front of `/mcp` via `MCP_SERVER_AUTH_TOKEN`.
- Docker image and npm package (`@kieksme/listmonk-mcp`, runnable via `npx`).
