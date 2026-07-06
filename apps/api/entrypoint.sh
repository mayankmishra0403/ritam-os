#!/bin/sh
set -e

echo "Running migrations..."
npx prisma db push --accept-data-loss

echo "Starting API..."
exec node dist/main
