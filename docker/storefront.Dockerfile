# ── Stage 1: Dependencies ─────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/validators/package.json ./packages/validators/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

# ── Stage 2: Builder ─────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/types/node_modules ./packages/types/node_modules 2>/dev/null || true
COPY --from=deps /app/packages/ui/node_modules ./packages/ui/node_modules 2>/dev/null || true

COPY . .

# Build shared packages
RUN pnpm --filter @marketplace/types build \
 && pnpm --filter @marketplace/utils build \
 && pnpm --filter @marketplace/validators build \
 && pnpm --filter @marketplace/ui build

# Build Next.js with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN cd apps/storefront && npx next build

# ── Stage 3: Production Runner ───────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache curl tini

RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup
USER appuser

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

COPY --from=builder --chown=appuser:appgroup /app/apps/storefront/public ./public
COPY --from=builder --chown=appuser:appgroup /app/apps/storefront/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/apps/storefront/.next/static ./.next/static

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD curl -f http://localhost:3000/ || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
