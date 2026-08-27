# Contributing

Thanks for your interest in contributing to `@kieksme/listmonk-mcp`! This document covers building from source, testing, and how releases work. If you just want to *use* the server, see [README.md](README.md) instead.

## Development setup

```bash
git clone https://github.com/kieksme/mcp-listmonk.git
cd mcp-listmonk
npm install   # or: pnpm install
```

### Running from source

npm:

```bash
npm run build
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
npm start
```

pnpm:

```bash
pnpm run build
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
pnpm start
```

For live reload while editing, use `npm run dev` (or `pnpm run dev`) instead — it runs `src/index.ts` directly via `tsx watch`, no build step needed.

### Docker (local build)

```bash
docker build -t listmonk-mcp .
docker run -p 3000:3000 \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -e LISTMONK_ENABLED_TOOLS='["subscribers","campaigns"]' \
  listmonk-mcp
```

## Verifying your changes locally

```bash
npm run list-tools   # prints the tool catalog and which tools LISTMONK_ENABLED_TOOLS would enable, no network access needed
npx @modelcontextprotocol/inspector   # connect to http://localhost:3000/mcp via the Streamable HTTP transport
```

## Testing

```bash
npm run build   # type-checks and compiles src/ to dist/
npm test        # runs the Vitest suite once (tests/**/*.test.ts)
npm run test:watch
```

Tests live under `tests/`, mirroring the `src/` layout (`formatters/`, `registry/`, `services/`, `tools/`, plus `config.test.ts` and `errors.test.ts`). Axios/HTTP calls are mocked — no real Listmonk instance is required to run the suite.

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) for every commit (e.g. `feat: add X`, `fix: correct Y`, `chore: update Z`, `test: add coverage for W`) — see [AGENTS.md](AGENTS.md). This repo uses [release-please](https://github.com/googleapis/release-please) (see `release-please-config.json`) to determine version bumps and generate `CHANGELOG.md` entries directly from commit types, so non-conventional commit messages are skipped or miscategorized.

## Releases

Releases are automated with release-please:

1. Every push to `main` is scanned for Conventional Commits; release-please keeps a "chore(main): release listmonk-mcp x.y.z" PR up to date with the resulting version bump and `CHANGELOG.md` entry, grouped by commit type (`feat`, `fix`, `perf`, `revert`, `docs`, `style`, `chore`, `refactor`, `test`, `build`, `ci`).
2. Merging that PR tags the release and publishes a GitHub Release.
3. In the same workflow run, `.github/workflows/release-please.yml` calls `release.yml` and `docker-publish.yml` (via `workflow_call`, gated on release-please's `release_created` output) to:
   - build and publish the npm package to both `registry.npmjs.org` and GitHub Packages (`npm.pkg.github.com`), and
   - build and push a multi-arch (`linux/amd64`, `linux/arm64`) Docker image to `ghcr.io/kieksme/mcp-listmonk`, tagged with the version, `major.minor`, and `latest`.

(release-please-created releases don't fire GitHub's `release: published` webhook — its GitHub Release is created with the default `GITHUB_TOKEN`, and Actions never triggers new workflow runs from that token's own events — which is why publishing happens inline in `release-please.yml` rather than via a separate `on: release` trigger.)
