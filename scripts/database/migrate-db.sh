#!/usr/bin/env bash

set -euo pipefail

# Simple database migration script for QAAPP

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

# Check DATABASE_URL
if [[ -z "${DATABASE_URL:-}" ]]; then
    log "❌ DATABASE_URL not set" "$RED"
    exit 1
fi

if ! echo "$DATABASE_URL" | grep -q "postgresql://"; then
    log "❌ DATABASE_URL must be PostgreSQL connection string" "$RED"
    exit 1
fi

log "🗄️  Running database migrations..." "$BLUE"

# Generate Prisma client
pnpm --filter=@qa-app/database db:generate

# Deploy migrations
pnpm --filter=@qa-app/database db:migrate:deploy

log "✅ Database migrations completed" "$GREEN"