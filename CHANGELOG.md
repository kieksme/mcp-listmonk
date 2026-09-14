# Changelog

All notable changes to this project are documented in this file.

## [1.3.0](https://github.com/kieksme/mcp-listmonk/compare/listmonk-mcp-v1.2.0...listmonk-mcp-v1.3.0) (2026-08-27)


### Features

* add stdio transport for local MCP clients ([87c747a](https://github.com/kieksme/mcp-listmonk/commit/87c747a0ae6e52b6287bbaf5d999a26dfd520e63))
* add stdio transport for local MCP clients ([072eca6](https://github.com/kieksme/mcp-listmonk/commit/072eca6194d29d0c3a2f578fa471fff9b45f4214))


### Documentation

* clarify client `enabled` flag vs. per-client tool selection ([6172d6e](https://github.com/kieksme/mcp-listmonk/commit/6172d6ebaec41bb7843c1d7e56dba43166164462))
* clarify client `enabled` flag vs. per-client tool selection ([a96c119](https://github.com/kieksme/mcp-listmonk/commit/a96c1191c89bb34e43028884315a1f7b9875bf4c))
* document connecting a local MCP client to a source build ([e277120](https://github.com/kieksme/mcp-listmonk/commit/e2771205e1812bf8b969854cf1f163618ac899d8))
* document running a local Listmonk instance for development ([9b54d0e](https://github.com/kieksme/mcp-listmonk/commit/9b54d0ed1c351d43cff0645798809e059b9830cf))
* document running a local Listmonk instance for development ([0bd67de](https://github.com/kieksme/mcp-listmonk/commit/0bd67de46c4928d90878e0cc06dc7eafb5bbbd1f))
* restructure README for MCP users, move dev docs to CONTRIBUTING.md ([#14](https://github.com/kieksme/mcp-listmonk/issues/14)) ([2b6cf3a](https://github.com/kieksme/mcp-listmonk/commit/2b6cf3ad4e48a54bd52ab4e31c0073ab4e90714e))

## [1.2.0](https://github.com/kieksme/mcp-listmonk/compare/listmonk-mcp-v1.1.1...listmonk-mcp-v1.2.0) (2026-08-27)


### Features

* **ci:** also publish npm package to GitHub Packages ([ac097b3](https://github.com/kieksme/mcp-listmonk/commit/ac097b39b58e000ac8f35646c2b7493bcf2a305f))
* **ci:** also publish npm package to GitHub Packages ([684756b](https://github.com/kieksme/mcp-listmonk/commit/684756b549c82c30ff11daeed562190fc02985d0))

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
