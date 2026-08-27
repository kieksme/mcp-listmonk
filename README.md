# listmonk-mcp-server

A **Streamable HTTP** MCP (Model Context Protocol) server exposing the full [Listmonk](https://listmonk.app) REST API (72 tools across 14 categories) to MCP-compatible LLM clients.

Built against the [Listmonk OpenAPI spec](https://listmonk.app/docs/swagger/collections.yaml).

## Features

- Full API coverage: subscribers, campaigns, lists, templates, media, bounces, import, settings, maintenance, transactional messages, public subscription, logs, admin, and dashboard/misc endpoints.
- **Selective tool loading** — enable only the categories/tools you actually need, so the LLM's context isn't flooded with all 72 tool definitions at once.
- Stateless streamable HTTP transport (no session state, easy to scale horizontally behind a load balancer).
- Optional bearer-token gate in front of `/mcp`.

## Configuration

Set these environment variables when starting the server:

| Variable | Required | Description |
|---|---|---|
| `LISTMONK_URL` | Yes | Base URL of your Listmonk instance, e.g. `https://newsletter.example.com` |
| `LISTMONK_API_USER` | Yes | API user name (Listmonk Admin → Users) |
| `LISTMONK_API_TOKEN` | Yes | API token for that user |
| `PORT` | No | HTTP port to listen on (default `3000`) |
| `LISTMONK_ENABLED_TOOLS` | No | JSON array (or comma-separated list) of tool/category selectors — see below. Empty/unset = all 72 tools. |
| `MCP_SERVER_AUTH_TOKEN` | No | If set, `/mcp` requires `Authorization: Bearer <token>`. If unset, `/mcp` is open at the application layer — put a reverse proxy/VPN/firewall in front of it instead. |

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

**Per-request override:** a single deployed instance can also serve different tool sets to different clients without a restart, via header `X-Listmonk-Enabled-Tools` or query string `?tools=` on the `POST /mcp` request — same selector syntax as above. This overrides `LISTMONK_ENABLED_TOOLS` for that one request only.

## Running

```bash
npm install
npm run build
LISTMONK_URL=https://newsletter.example.com \
LISTMONK_API_USER=my-api-user \
LISTMONK_API_TOKEN=xxxxxxxx \
npm start
```

The MCP endpoint is `POST http://localhost:3000/mcp` (streamable HTTP, stateless — no session negotiation needed).

### Docker

```bash
docker build -t listmonk-mcp-server .
docker run -p 3000:3000 \
  -e LISTMONK_URL=https://newsletter.example.com \
  -e LISTMONK_API_USER=my-api-user \
  -e LISTMONK_API_TOKEN=xxxxxxxx \
  -e LISTMONK_ENABLED_TOOLS='["subscribers","campaigns"]' \
  listmonk-mcp-server
```

### Verifying locally

```bash
npm run list-tools   # prints the tool catalog and which tools LISTMONK_ENABLED_TOOLS would enable, no network access needed
npx @modelcontextprotocol/inspector   # connect to http://localhost:3000/mcp via the Streamable HTTP transport
```

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
