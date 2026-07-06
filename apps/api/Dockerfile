FROM node:22-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9

# Copy root workspace configuration
COPY package.json pnpm-lock.yaml turbo.json ./
COPY apps/api/package.json apps/api/pnpm-lock.yaml apps/api/pnpm-workspace.yaml ./apps/api/

# Copy shared packages
COPY packages/ ./packages/

# Install all dependencies (recursive through workspace)
RUN pnpm install --frozen-lockfile

# Copy API source code
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src

# Copy Prisma schema from database package
COPY packages/database/prisma ./packages/database/prisma

# Generate Prisma client and build
WORKDIR /app/apps/api
RUN npx prisma generate --schema=../packages/database/prisma/schema.prisma
RUN pnpm build

# ── Production stage ──
FROM node:22-alpine AS runner
WORKDIR /app

RUN npm install -g pnpm@9

# Copy built artifacts and production dependencies
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/packages/database/prisma ./prisma

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/main"]
