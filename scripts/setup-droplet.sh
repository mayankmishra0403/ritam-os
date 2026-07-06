#!/bin/bash
# =============================================================================
# Ritam OS — Digital Ocean Droplet Setup Script
# =============================================================================
# Run this on a fresh Ubuntu 22.04 / 24.04 Droplet to bootstrap everything.
#
# Usage:
#   chmod +x scripts/setup-droplet.sh
#   sudo bash scripts/setup-droplet.sh
# =============================================================================

set -euo pipefail

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║        Ritam OS — Droplet Bootstrap                          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"

# ── 1. System Updates ─────────────────────────────────────────────────────────
echo "→ Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git ufw

# ── 2. Install Docker ─────────────────────────────────────────────────────────
if ! command -v docker &> /dev/null; then
  echo "→ Installing Docker..."
  curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
  sh /tmp/get-docker.sh
  rm /tmp/get-docker.sh
else
  echo "✓ Docker already installed"
fi

# ── 3. Install Docker Compose Plugin ──────────────────────────────────────────
if ! command -v docker compose &> /dev/null; then
  echo "→ Installing Docker Compose plugin..."
  apt install -y docker-compose-plugin
else
  echo "✓ Docker Compose already installed"
fi

# ── 4. Clone / Update Repository ──────────────────────────────────────────────
REPO_DIR="/opt/ritam"
REPO_URL="https://github.com/mayankmishra0403/ritam-os.git"

if [ -d "$REPO_DIR/.git" ]; then
  echo "→ Repository exists — pulling latest..."
  cd "$REPO_DIR"
  git pull origin main
else
  echo "→ Cloning repository..."
  mkdir -p "$REPO_DIR"
  git clone "$REPO_URL" "$REPO_DIR"
  cd "$REPO_DIR"
fi

# ── 5. Environment Configuration ──────────────────────────────────────────────
if [ ! -f "$REPO_DIR/.env" ]; then
  echo "→ Creating .env from template..."
  cp "$REPO_DIR/.env.production.example" "$REPO_DIR/.env"
  echo ""
  echo "⚠  IMPORTANT: Edit the .env file with your production credentials!"
  echo "   Run: nano $REPO_DIR/.env"
  echo "   Then run: docker compose -f docker-compose.prod.yml up -d"
else
  echo "✓ .env file exists"
fi

# ── 6. Create SSL Directory (placeholder) ─────────────────────────────────────
mkdir -p "$REPO_DIR/ssl"

# ── 7. Create init-db.sql Placeholder ─────────────────────────────────────────
if [ ! -f "$REPO_DIR/scripts/init-db.sql" ]; then
  cat > "$REPO_DIR/scripts/init-db.sql" << 'SQLEOF'
-- Ritam OS — Initial Database Setup
-- This runs automatically on first PostgreSQL container start.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- You can add initial seed data or role setup here if needed.
SQLEOF
  echo "✓ Created init-db.sql placeholder"
fi

# ── 8. Configure Firewall ─────────────────────────────────────────────────────
echo "→ Configuring UFW firewall..."
ufw --force reset 2>/dev/null || true
ufw default deny incoming
ufw default allow outgoing

# SSH
ufw allow 22/tcp comment 'SSH'

# HTTP / HTTPS
ufw allow 80/tcp  comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Rate limit SSH
ufw limit 22/tcp

ufw --force enable
echo "✓ Firewall configured"

# ── 9. Summary ────────────────────────────────────────────────────────────────
PUBLIC_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || curl -s https://ifconfig.me 2>/dev/null || echo "unknown")

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║  ✓ Ritam OS Droplet is ready!                               ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Next steps:                                                ║"
echo "║  1. Edit your environment:                                   ║"
echo "║     nano $REPO_DIR/.env                                      ║"
echo "║                                                              ║"
echo "║  2. Start all services:                                      ║"
echo "║     cd $REPO_DIR && docker compose -f docker-compose.prod.yml up -d  ║"
echo "║                                                              ║"
echo "║  3. Run database migrations:                                 ║"
echo "║     bash scripts/migrate-prod.sh                             ║"
echo "║                                                              ║"
echo "║  4. Monitor logs:                                            ║"
echo "║     docker compose -f docker-compose.prod.yml logs -f        ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  Public IP: $PUBLIC_IP                                        ║"
echo "║  API URL:   http://$PUBLIC_IP:4000                            ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
