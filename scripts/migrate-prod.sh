#!/bin/bash
# =============================================================================
# Ritam OS — Production Database Migration Script
# =============================================================================
# Runs Prisma migrations against the production database.
# Assumes docker-compose.prod.yml services are running.
#
# Usage:
#   bash scripts/migrate-prod.sh
#   bash scripts/migrate-prod.sh --dry-run    # Preview migration
# =============================================================================

set -euo pipefail

cd "$(dirname "$0")/.."

COMPOSE_FILE="docker-compose.prod.yml"
SERVICE="api"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "❌ docker-compose.prod.yml not found. Run this from the project root."
  exit 1
fi

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  Ritam OS — Database Migration                              ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# Check if services are running
if ! docker compose -f "$COMPOSE_FILE" ps --services --filter status=running 2>/dev/null | grep -q "$SERVICE"; then
  echo "⚠  API service is not running. Starting dependencies..."
  docker compose -f "$COMPOSE_FILE" up -d postgres redis
  echo "→ Waiting for PostgreSQL to be healthy..."
  sleep 5
fi

if [ "${1:-}" = "--dry-run" ]; then
  echo "→ Dry-run: Previewing migration..."
  docker compose -f "$COMPOSE_FILE" run --rm \
    -e DATABASE_URL="postgresql://${DB_USER:-ritam}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-ritam_prod}" \
    "$SERVICE" npx prisma migrate deploy --preview-feature
else
  echo "→ Running database migrations..."
  docker compose -f "$COMPOSE_FILE" run --rm \
    -e DATABASE_URL="postgresql://${DB_USER:-ritam}:${DB_PASSWORD}@postgres:5432/${DB_NAME:-ritam_prod}" \
    "$SERVICE" npx prisma migrate deploy

  echo ""
  echo "✓ Migrations applied successfully!"
fi
