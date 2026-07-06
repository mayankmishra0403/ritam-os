FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm@9

# Copy everything
COPY . .

# Install all workspace dependencies
RUN pnpm install --no-frozen-lockfile

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# ── Production stage ──
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9

# Copy built artifacts + node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/main"]
