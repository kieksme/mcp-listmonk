# @kieksme/listmonk-mcp

![Listmonk MCP](assets/readme-header.svg)

[![MCP Trust Score](https://mcptrustchecker.com/scan/npm/%40kieksme%2Flistmonk-mcp/badge.svg)](https://mcptrustchecker.com/scan/npm/%40kieksme%2Flistmonk-mcp)
[![MCPSafe](https://api.mcpsafe.io/api/badge/pubfast5b021ffd554ff1df6833)](https://mcpsafe.io/scan/pubfast5b021ffd554ff1df6833)

An MCP (Model Context Protocol) server exposing the full [Listmonk](https://listmonk.app) REST API (72 tools across 14 categories) to MCP-compatible LLM clients — as a **local stdio** process your client spawns itself, or as a **remote Streamable HTTP** deployment any number of clients can connect to.

Built against the [Listmonk OpenAPI spec](https://listmonk.app/docs/swagger/collections.yaml).

## Quickstart

**Local:** let your MCP client spawn the server itself over stdio — nothing to run by hand, no port to open. Add it to your client's config (Claude Code shown here; see [Connecting your MCP client](#connecting-your-mcp-client) below for Cursor, Claude Desktop, OpenCode, and ChatGPT):

```bash
claude mcp add listmonk \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -- npx -y @kieksme/listmonk-mcp --stdio
```

**Remote:** start the server once, reachable over HTTP by any number of clients:

```bash
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
npx @kieksme/listmonk-mcp
```

```bash
claude mcp add --transport http listmonk http://localhost:3000/mcp
```

See [Running the server](#running-the-server) for both modes in more detail, including Docker.

## Connecting your MCP client

Each client below supports two setups — pick one:

- **Local (stdio):** the client spawns `npx @kieksme/listmonk-mcp --stdio` itself as a subprocess and talks MCP over its stdin/stdout. No server to keep running, no port, no reachability concerns — this is generally the simpler default for a single local client.
- **Remote (HTTP):** you run the server yourself (see [Running the server](#running-the-server)) and the client connects to its URL. Needed when multiple clients share one server instance, or the server runs somewhere other than your machine.

**Using pnpm instead of npx for the local/stdio setup:** every local (stdio) example below uses `command: "npx"` with `args: ["-y", "@kieksme/listmonk-mcp", "--stdio"]`. If you prefer pnpm, swap in `command: "pnpm"` with `args: ["dlx", "@kieksme/listmonk-mcp", "--stdio"]` — **and drop the `-y`**. `-y` is npx's "skip the install confirmation prompt" flag; `pnpm dlx` has no such prompt to begin with, so it doesn't accept `-y` at all and exits immediately with `ERROR Unknown option: 'y'` (surfacing to the client as a generic "Connection closed", since the process dies before it ever speaks MCP). The same swap applies to any CLI form below that starts with `npx -y` — replace it with `pnpm dlx` (no `-y`).

**Reachability note for the remote/HTTP setup:** a client only needs `http://localhost:3000` if it runs *on the same machine* as the server. Claude Code, Cursor, and OpenCode are local tools, so `localhost` works directly. Claude Desktop is a local app and can usually reach `localhost` too. **ChatGPT and Claude.ai (the web apps) run in the cloud and cannot reach your `localhost`** — to use this server with them you'd need to deploy it somewhere reachable from the internet (or tunnel it, e.g. with `ngrok http 3000`) and use that public URL instead. ChatGPT's connectors are HTTP-only, so it has no local/stdio option below.

### Claude Code

Local (stdio), project-scoped via `.mcp.json` in your repo root:

```json
{
  "mcpServers": {
    "listmonk": {
      "command": "npx",
      "args": ["-y", "@kieksme/listmonk-mcp", "--stdio"],
      "env": {
        "LISTMONK_URL": "https://newsletter.example.com",
        "LISTMONK_API_USER": "my-api-user",
        "LISTMONK_API_TOKEN": "xxxxxxxx"
      }
    }
  }
}
```

Or from the CLI:

```bash
claude mcp add listmonk \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -- npx -y @kieksme/listmonk-mcp --stdio
```

Remote (HTTP), once the server is running (see [Running the server](#running-the-server)):

```json
{
  "mcpServers": {
    "listmonk": {
      "type": "http",
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

```bash
claude mcp add --transport http listmonk http://localhost:3000/mcp
```

If you set `MCP_SERVER_AUTH_TOKEN` on the server, add the header: `claude mcp add --transport http listmonk http://localhost:3000/mcp --header "Authorization: Bearer <token>"`.

### Cursor

One-click install (local/stdio, with placeholder credentials you'll need to fill in afterwards in Cursor's MCP settings):

[![Add listmonk MCP server to Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](cursor://anysphere.cursor-deeplink/mcp/install?name=listmonk&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBraWVrc21lL2xpc3Rtb25rLW1jcCIsIi0tc3RkaW8iXSwiZW52Ijp7IkxJU1RNT05LX1VSTCI6Imh0dHBzOi8vbmV3c2xldHRlci5leGFtcGxlLmNvbSIsIkxJU1RNT05LX0FQSV9VU0VSIjoibXktYXBpLXVzZXIiLCJMSVNUTU9OS19BUElfVE9LRU4iOiJ4eHh4eHh4eCJ9fQ%3D%3D)

Or configure it manually — local (stdio), via `.cursor/mcp.json` in your repo root (or globally in `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "listmonk": {
      "command": "npx",
      "args": ["-y", "@kieksme/listmonk-mcp", "--stdio"],
      "env": {
        "LISTMONK_URL": "https://newsletter.example.com",
        "LISTMONK_API_USER": "my-api-user",
        "LISTMONK_API_TOKEN": "xxxxxxxx"
      }
    }
  }
}
```

Remote (HTTP), once the server is running:

```json
{
  "mcpServers": {
    "listmonk": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

If you set `MCP_SERVER_AUTH_TOKEN` on the server, pass it as a header:

```json
{
  "mcpServers": {
    "listmonk": {
      "url": "http://localhost:3000/mcp",
      "headers": {
        "Authorization": "Bearer <token>"
      }
    }
  }
}
```

You can also add either setup via **Cursor Settings → MCP → Add new MCP server**.

### Claude Desktop

Local (stdio), in `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "listmonk": {
      "command": "npx",
      "args": ["-y", "@kieksme/listmonk-mcp", "--stdio"],
      "env": {
        "LISTMONK_URL": "https://newsletter.example.com",
        "LISTMONK_API_USER": "my-api-user",
        "LISTMONK_API_TOKEN": "xxxxxxxx"
      }
    }
  }
}
```

Remote (HTTP): Settings → Connectors → Add custom connector, and paste `http://localhost:3000/mcp` as the URL (server must already be running). If your Claude Desktop version's config file supports remote servers directly, the equivalent entry is:

```json
{
  "mcpServers": {
    "listmonk": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### OpenCode

Local (stdio), in `opencode.json` (project or global config):

```json
{
  "mcp": {
    "listmonk": {
      "type": "local",
      "command": ["npx", "-y", "@kieksme/listmonk-mcp", "--stdio"],
      "environment": {
        "LISTMONK_URL": "https://newsletter.example.com",
        "LISTMONK_API_USER": "my-api-user",
        "LISTMONK_API_TOKEN": "xxxxxxxx"
      },
      "enabled": true
    }
  }
}
```

Remote (HTTP), once the server is running:

```json
{
  "mcp": {
    "listmonk": {
      "type": "remote",
      "url": "http://localhost:3000/mcp",
      "enabled": true
    }
  }
}
```

**Note on `enabled`:** this flag is OpenCode's own client-side switch — it just turns the whole server connection on/off for that client and has nothing to do with which listmonk tools/categories are exposed. On the remote (HTTP) setup, to limit *which* tools this particular client sees (without restarting the server or touching `LISTMONK_ENABLED_TOOLS`), append the `tools` query parameter to the `url` itself:

```json
{
  "mcp": {
    "listmonk": {
      "type": "remote",
      "url": "http://localhost:3000/mcp?tools=subscribers,campaigns",
      "enabled": true
    }
  }
}
```

On the local (stdio) setup, set `LISTMONK_ENABLED_TOOLS` in `environment` instead — see [Selecting which tools are available](#selecting-which-tools-are-available) for the full selector syntax.

### ChatGPT

ChatGPT's Connectors (Settings → Connectors → Create, available on paid plans that support MCP) only accept a **publicly reachable HTTP URL** — ChatGPT runs in the cloud and can't spawn a local stdio process, so the remote setup is the only option. Deploy the server (see [Docker](#docker)) to a host with a public URL, or tunnel your local instance (e.g. `ngrok http 3000`), then register `https://<your-host>/mcp` as the connector URL. If you set `MCP_SERVER_AUTH_TOKEN`, ChatGPT's connector setup lets you supply a bearer token alongside the URL.

## Features

- Full API coverage: subscribers, campaigns, lists, templates, media, bounces, import, settings, maintenance, transactional messages, public subscription, logs, admin, and dashboard/misc endpoints.
- **Selective tool loading** — enable only the categories/tools you actually need, so the LLM's context isn't flooded with all 72 tool definitions at once.
- **Two transports, one package:** stdio for a client-spawned local process, stateless Streamable HTTP for a remote deployment (no session state, easy to scale horizontally behind a load balancer).
- Optional bearer-token gate in front of `/mcp` (HTTP transport only — stdio has no network listener to gate).

## Running the server

### Local (stdio)

Normally you don't start this by hand — your MCP client spawns it per the config in [Connecting your MCP client](#connecting-your-mcp-client) above. To run it manually (e.g. to sanity-check it outside a client), pass `--stdio` or set `MCP_TRANSPORT=stdio`:

```bash
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
npx @kieksme/listmonk-mcp --stdio
```

The process speaks MCP JSON-RPC on stdout and logs to stderr — it exits when its stdin closes (i.e. when the parent client disconnects). `LISTMONK_ENABLED_TOOLS` still selects which tools are registered, but there's no per-request override in this mode: one client process, one fixed tool set for its lifetime.

### Remote (HTTP)

```bash
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
npx @kieksme/listmonk-mcp
# or
pnpm dlx @kieksme/listmonk-mcp
```

The MCP endpoint is `POST http://localhost:3000/mcp` (streamable HTTP, stateless — no session negotiation needed).

### Docker

The published image (`ghcr.io/kieksme/mcp-listmonk:latest`) supports both transports — it's the same entrypoint as `npx`, so the flags above apply the same way.

Remote (HTTP) — publish the port:

```bash
docker run -p 3000:3000 \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -e LISTMONK_ENABLED_TOOLS='["subscribers","campaigns"]' \
  ghcr.io/kieksme/mcp-listmonk:latest
```

Local (stdio) — keep stdin attached (`-i`) instead of publishing a port; this is what you'd put behind a client's `command`/`args` (e.g. `docker` as the command) if you'd rather run the container than have `npx` fetch the package:

```bash
docker run -i --rm \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  ghcr.io/kieksme/mcp-listmonk:latest --stdio
```

## Configuration

Set these environment variables when starting the server:

| Variable | Required | Description |
|---|---|---|
| `LISTMONK_URL` | Yes | Base URL of your Listmonk instance, e.g. `https://newsletter.example.com` |
| `LISTMONK_API_USER` | Yes | API user name (Listmonk Admin → Users) |
| `LISTMONK_API_TOKEN` | Yes | API token for that user |
| `MCP_TRANSPORT` | No | `stdio` or `http` (default). The `--stdio` CLI flag is equivalent and takes precedence over this variable. |
| `PORT` | No | HTTP port to listen on (default `3000`). Ignored in stdio mode. |
| `LISTMONK_ENABLED_TOOLS` | No | JSON array (or comma-separated list) of tool/category selectors — see below. Empty/unset = all 72 tools. |
| `MCP_SERVER_AUTH_TOKEN` | No | If set, `/mcp` requires `Authorization: Bearer <token>`. If unset, `/mcp` is open at the application layer — put a reverse proxy/VPN/firewall in front of it instead. Ignored in stdio mode (there's no network listener to gate). |

**Security note:** `LISTMONK_API_USER`/`LISTMONK_API_TOKEN` authenticate this *server* to *Listmonk*, not MCP clients to this server. Without `MCP_SERVER_AUTH_TOKEN`, anyone who can reach the port gets full Listmonk access at whatever scope the configured API user has. Prefer creating a least-privilege API user in Listmonk scoped only to the categories you intend to enable.

### Selecting which tools are available

`LISTMONK_ENABLED_TOOLS` accepts a JSON array (or comma-separated string) whose entries are, case-insensitively, **either**:

- a **category name**: `subscribers`, `campaigns`, `templates`, `lists`, `media`, `import`, `bounces`, `settings`, `maintenance`, `public`, `transactional`, `logs`, `admin`, `miscellaneous` — enables every tool in that category, or
- an **exact tool name**: e.g. `listmonk_get_subscriber` — enables just that one tool.

```bash
# Only subscriber management tools
LISTMONK_ENABLED_TOOLS='["subscribers"]'

# A mix of a whole category plus one extra tool
LISTMONK_ENABLED_TOOLS='["campaigns","listmonk_get_health"]'

# Comma-separated form also works
LISTMONK_ENABLED_TOOLS=subscribers,campaigns
```

Leave it unset (or `[]`) to expose all 72 tools.

**Per-request override (remote/HTTP only):** a single deployed instance can also serve different tool sets to different clients without a restart, via header `X-Listmonk-Enabled-Tools` or query string `?tools=` on the `POST /mcp` request — same selector syntax as above. This overrides `LISTMONK_ENABLED_TOOLS` for that one request only. There's no equivalent for the local/stdio transport: each stdio process is spawned fresh per client, so just set `LISTMONK_ENABLED_TOOLS` in that client's own `env`/`environment` config instead.

Since the query string is just part of the URL, this is the easiest way to give one particular client (e.g. one entry in an `opencode.json`, `.mcp.json`, or `.cursor/mcp.json`) a reduced tool set while other clients keep hitting the same server with the full (or a different) set — just set that client's `url` to `http://localhost:3000/mcp?tools=subscribers,campaigns` instead of adding server-wide env vars or standing up a second instance. Clients that support custom headers can use `X-Listmonk-Enabled-Tools` instead, which keeps the URL itself clean.

## Tool catalog (72 tools)

### subscribers (17)
`listmonk_list_subscribers`, `listmonk_create_subscriber`, `listmonk_get_subscriber`, `listmonk_update_subscriber`, `listmonk_delete_subscriber`, `listmonk_delete_subscribers_by_ids`, `listmonk_manage_subscriber_lists_bulk`, `listmonk_manage_subscriber_list_membership`, `listmonk_blocklist_subscribers_bulk`, `listmonk_blocklist_subscriber`, `listmonk_export_subscriber`, `listmonk_get_subscriber_bounces`, `listmonk_delete_subscriber_bounces`, `listmonk_send_subscriber_optin`, `listmonk_delete_subscribers_by_query`, `listmonk_blocklist_subscribers_by_query`, `listmonk_manage_subscriber_lists_by_query`

### campaigns (14)
`listmonk_list_campaigns`, `listmonk_create_campaign`, `listmonk_get_campaign`, `listmonk_update_campaign`, `listmonk_delete_campaign`, `listmonk_get_running_campaign_stats`, `listmonk_get_campaign_analytics`, `listmonk_get_campaign_preview`, `listmonk_preview_campaign_draft`, `listmonk_preview_campaign_text`, `listmonk_update_campaign_status`, `listmonk_update_campaign_archive`, `listmonk_convert_campaign_content`, `listmonk_send_campaign_test`

### templates (8)
`listmonk_list_templates`, `listmonk_create_template`, `listmonk_get_template`, `listmonk_update_template`, `listmonk_delete_template`, `listmonk_preview_template_draft`, `listmonk_preview_template`, `listmonk_set_default_template`

### lists (5)
`listmonk_list_lists`, `listmonk_create_list`, `listmonk_get_list`, `listmonk_update_list`, `listmonk_delete_list`

### media (4)
`listmonk_list_media`, `listmonk_upload_media`, `listmonk_get_media`, `listmonk_delete_media`

### import (4)
`listmonk_get_import_status`, `listmonk_import_subscribers`, `listmonk_stop_import_subscribers`, `listmonk_get_import_logs`

### bounces (4)
`listmonk_list_bounces`, `listmonk_delete_bounces`, `listmonk_get_bounce`, `listmonk_delete_bounce`

### settings (3)
`listmonk_get_settings`, `listmonk_update_settings`, `listmonk_test_smtp_settings`

### maintenance (3)
`listmonk_delete_gc_subscribers`, `listmonk_delete_gc_campaign_analytics`, `listmonk_delete_unconfirmed_subscriptions`

### public (2)
`listmonk_get_public_lists`, `listmonk_create_public_subscription`

### transactional (1)
`listmonk_send_transactional_message`

### logs (1)
`listmonk_get_logs`

### admin (1)
`listmonk_reload_app`

### miscellaneous (5)
`listmonk_get_health`, `listmonk_get_server_config`, `listmonk_get_i18n_lang`, `listmonk_get_dashboard_charts`, `listmonk_get_dashboard_counts`

## Notes on a few non-obvious tools

- **Bulk/query subscriber operations** (`listmonk_delete_subscribers_by_query`, `listmonk_blocklist_subscribers_by_query`, `listmonk_manage_subscriber_lists_by_query`) run against a Listmonk SQL filter expression and act on *every* matching subscriber with no preview step. Always call `listmonk_list_subscribers` with the same `query` first to check the match count.
- **Campaign preview/content tools** are intentionally split into four distinct tools because Listmonk exposes four distinct endpoints for them: `listmonk_get_campaign_preview` renders the campaign as currently saved; `listmonk_preview_campaign_draft` and `listmonk_preview_campaign_text` render an *unsaved* body without persisting anything; `listmonk_convert_campaign_content` performs and *persists* a format conversion (e.g. markdown → HTML) — it's not a preview despite the similar area.
- **`listmonk_send_campaign_test`** fetches the campaign's current saved state first and only overrides the fields you explicitly pass, to avoid accidentally blanking out fields Listmonk's own API would otherwise silently overwrite with empty values.

## Contributing

Want to build from source, run the test suite, or understand the release process? See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT © kieksme GbR
