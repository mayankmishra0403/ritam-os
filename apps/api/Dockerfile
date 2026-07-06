FROM node:22-alpine AS build
WORKDIR /build

# Copy package files
COPY apps/api/package.json ./
COPY apps/api/tsconfig.json ./

# Install dependencies
RUN npm install

# Copy source
COPY apps/api/nest-cli.json ./
COPY apps/api/tsconfig.build.json ./
COPY apps/api/src ./src

# Copy prisma schema from monorepo
COPY packages/database/prisma ./prisma

# Install prisma and generate client
RUN npm install prisma@6 @prisma/client@6
RUN npx prisma generate

# Build with NestJS CLI
RUN npx @nestjs/cli build

# ── Production image ──
FROM node:22-alpine
WORKDIR /app

# Copy built artifacts
COPY --from=build /build/dist ./dist
COPY --from=build /build/node_modules ./node_modules
COPY --from=build /build/package.json ./

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/v1/health || exit 1

CMD ["node", "dist/main"]
