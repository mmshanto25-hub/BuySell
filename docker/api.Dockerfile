# ── Stage 1: Builder ──────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# Copy workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy package manifests
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validators/package.json ./packages/validators/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Build shared packages then API
RUN pnpm --filter @marketplace/types build \
 && pnpm --filter @marketplace/utils build \
 && pnpm --filter @marketplace/validators build \
 && pnpm --filter @marketplace/api build

# ── Stage 2: Production Runner ───────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl tini

# Security: run as non-root
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
USER appuser

WORKDIR /app

# Copy built artifacts
COPY --from=builder --chown=appuser:appgroup /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=appuser:appgroup /app/apps/api/package.json ./apps/api/
COPY --from=builder --chown=appuser:appgroup /app/packages/types/dist ./packages/types/dist
COPY --from=builder --chown=appuser:appgroup /app/packages/types/package.json ./packages/types/
COPY --from=builder --chown=appuser:appgroup /app/packages/utils/dist ./packages/utils/dist
COPY --from=builder --chown=appuser:appgroup /app/packages/utils/package.json ./packages/utils/
COPY --from=builder --chown=appuser:appgroup /app/packages/validators/dist ./packages/validators/dist
COPY --from=builder --chown=appuser:appgroup /app/packages/validators/package.json ./packages/validators/
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/package.json ./

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/health/liveness || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "apps/api/dist/server.js"]
