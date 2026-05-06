# wensday.ch – Production Docker (Angular + Express)
# Optimiert für Google Cloud Run

FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ── Build Stage ───────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Angular Frontend bauen
RUN cd angular-client && \
    node ../node_modules/@angular/cli/bin/ng.js build --configuration production

# Express Backend bauen
RUN npx esbuild server/index.ts \
    --platform=node --packages=external --bundle \
    --format=esm --outdir=dist

# ── Production Stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S wensday -u 1001

WORKDIR /app

# Build-Artefakte kopieren
COPY --from=build /app/dist ./dist
COPY --from=build /app/shared ./shared
COPY --from=base  /app/node_modules ./node_modules

COPY package.json .

RUN chown -R wensday:nodejs /app
USER wensday

# Cloud Run nutzt PORT env var (Standard: 8080)
ENV PORT=8080
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT}/api/health || exit 1

CMD ["node", "dist/index.js"]

LABEL maintainer="dev.n.lopez@gmail.com" \
      version="3.0" \
      description="wensday.ch Swiss AI Platform – Angular + Express on Cloud Run"
