# wensday.ch MVP - Production Docker Configuration
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install dependencies
RUN npm ci --only=production && \
    cd functions && npm ci --only=production

# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY functions/package*.json ./functions/

# Install all dependencies (including dev)
RUN npm ci && cd functions && npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S wensday -u 1001

# Set working directory
WORKDIR /app

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/shared ./shared
COPY --from=build /app/functions/lib ./functions/lib

# Copy production dependencies
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/functions/node_modules ./functions/node_modules

# Copy configuration files
COPY package.json .
COPY drizzle.config.ts .
COPY firebase.json .

# Change ownership to non-root user
RUN chown -R wensday:nodejs /app

# Switch to non-root user
USER wensday

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node server/health-check.js

# Start application
CMD ["npm", "start"]

# Labels for metadata
LABEL maintainer="dev.n.lopez@gmail.com" \
      version="2.1" \
      description="wensday.ch Business AI MVP Platform" \
      org.opencontainers.image.source="https://github.com/lopez-codes/wensday-ch"