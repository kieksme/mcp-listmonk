# Contributing

Thanks for your interest in contributing to `@kieksme/listmonk-mcp`! This document covers building from source, testing, and how releases work. If you just want to *use* the server, see [README.md](README.md) instead.

## Development setup

```bash
git clone https://github.com/kieksme/mcp-listmonk.git
cd mcp-listmonk
pnpm install   # Node 22.14+, packageManager pnpm@10.33.2
```

### Running a local Listmonk instance

You don't need a hosted Listmonk to develop against — Listmonk ships an official Docker image and only needs a Postgres database next to it. This gives you a disposable `LISTMONK_URL=http://localhost:9000` to point the MCP server at.

Create `docker-compose.listmonk.yml` (git-ignored, local only) and `config.toml` next to it:

```yaml
# docker-compose.listmonk.yml
services:
  listmonk:
    image: listmonk/listmonk:latest
    ports:
      - "9000:9000"
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      - TZ=Etc/UTC
    volumes:
      - ./config.toml:/listmonk/config.toml
    command: [sh, -c, "./listmonk --install --idempotent --yes --config config.toml && ./listmonk --upgrade --yes --config config.toml && ./listmonk --config config.toml"]
  db:
    image: postgres:17-alpine
    ports:
      - "5432:5432"
    restart: unless-stopped
    environment:
      - POSTGRES_USER=listmonk
      - POSTGRES_PASSWORD=listmonk
      - POSTGRES_DB=listmonk
    volumes:
      - listmonk-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U listmonk"]
      interval: 10s
      timeout: 5s
      retries: 6

volumes:
  listmonk-data:
```

```toml
# config.toml
[app]
address = "0.0.0.0:9000"

[db]
host = "db"
port = 5432
user = "listmonk"
password = "listmonk"
database = "listmonk"
ssl_mode = "disable"
max_open = 25
max_idle = 25
max_lifetime = "300s"
```

Start it:

```bash
docker compose -f docker-compose.listmonk.yml up -d
```

The `--install` step provisions the schema on first run; subsequent starts skip straight to `--upgrade` (a no-op once you're current) and then the server. Listmonk is now reachable at `http://localhost:9000` — log in with the superadmin credentials you set during the one-time setup wizard at `http://localhost:9000/admin` (or, on `--install --idempotent`, whatever credentials you already configured).

Then create an API user scoped to what you're testing (Admin → Users → New → API user) and grab its token — least-privilege, per the [security note in README.md](README.md#configuration): don't hand a locally-scoped test user broader access than the tools you're actually exercising. Use those to run the MCP server, per [Running from source](#running-from-source) below:

```bash
LISTMONK_URL=http://localhost:9000 \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
pnpm run dev
```

Tear down with `docker compose -f docker-compose.listmonk.yml down` (add `-v` to also drop the Postgres volume and start from a clean schema next time).

### Running from source

Default transport is **stdio**. For HTTP locally:

```bash
pnpm build
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
MCP_TRANSPORT=http \
MCP_AUTH_TOKEN=dev-token \
MCP_HTTP_HOST=127.0.0.1 \
pnpm start -- --http
```

For live reload: `pnpm run dev` (`tsx watch`). Append `-- --http` for HTTP, or leave the default stdio. See [README.md Configuration](README.md#configuration).

### Connecting a local MCP client to your source build

**stdio:** point the client at `node /absolute/path/to/dist/index.js` with `LISTMONK_*` in `env`.

**HTTP:** start with `--http` as above, then:

```json
{
  "mcpServers": {
    "listmonk": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": { "Authorization": "Bearer dev-token" }
    }
  }
}
```

`.mcp.json` isn't tracked (see `.gitignore`). See [Selecting which tools are available](README.md#selecting-which-tools-are-available) for per-request filters.

### Docker (local build)

```bash
docker build -t listmonk-mcp .

docker run -p 3000:3000 \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -e MCP_AUTH_TOKEN=dev-token \
  -e MCP_ALLOWED_HOSTS=localhost,127.0.0.1 \
  -e LISTMONK_ENABLED_TOOLS='["subscribers","campaigns"]' \
  listmonk-mcp
```

## Verifying your changes locally

```bash
pnpm list-tools   # tool catalog / LISTMONK_ENABLED_TOOLS preview
npx @modelcontextprotocol/inspector   # HTTP: http://localhost:3000/mcp + bearer; or launch `pnpm exec tsx src/index.ts` for stdio
```

## Testing

```bash
pnpm build
pnpm test
pnpm test:watch
```

Tests live under `tests/` (including `tests/http/kit-contract.test.ts` for the shared kit HTTP contract). Axios/HTTP upstream calls are mocked — no real Listmonk instance is required.

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
