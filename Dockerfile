# syntax=docker/dockerfile:1
#
# Listmonk MCP — Streamable HTTP via @kieksme/mcp-http-kit.
#
# Runtime secrets (never bake into the image):
#   MCP_AUTH_TOKEN — bearer token(s), comma-separated for rotation
#   LISTMONK_URL / LISTMONK_API_USER / LISTMONK_API_TOKEN — upstream credentials
#
# Railway / containers: PORT is honored by the kit (fallback MCP_HTTP_PORT).

ARG NODE_VERSION=22-alpine
ARG PNPM_VERSION=10.33.2

# ---- build ----
FROM node:${NODE_VERSION} AS build
ARG PNPM_VERSION
WORKDIR /app
RUN npm install -g pnpm@${PNPM_VERSION}
COPY package.json pnpm-lock.yaml ./
COPY vendor ./vendor
RUN pnpm install --frozen-lockfile
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN pnpm build && pnpm prune --prod

# ---- runtime ----
FROM node:${NODE_VERSION} AS runtime
LABEL org.opencontainers.image.title="listmonk-mcp" \
      org.opencontainers.image.description="MCP server for Listmonk (Streamable HTTP)" \
      org.opencontainers.image.source="https://github.com/kieksme/mcp-listmonk" \
      org.opencontainers.image.licenses="MIT"
ENV NODE_ENV=production \
    MCP_TRANSPORT=http \
    MCP_HTTP_HOST=0.0.0.0 \
    PORT=3000 \
    MCP_ALLOWED_HOSTS=localhost,127.0.0.1
WORKDIR /app
COPY --from=build --chown=node:node /app/package.json ./package.json
COPY --chown=node:node LICENSE ./LICENSE
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/node_modules ./node_modules
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||process.env.MCP_HTTP_PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/index.js"]
