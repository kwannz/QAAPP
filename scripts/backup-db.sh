#!/usr/bin/env bash

set -euo pipefail

# Simple database backup script for QAAPP

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

# Create backup directory
mkdir -p backups

# Generate backup filename with timestamp
BACKUP_FILE="backups/qa_database_$(date +%Y%m%d_%H%M%S).sql"

log "📦 Creating database backup..." "$BLUE"

# Create backup (using default connection from .env)
PGPASSWORD=qa_password pg_dump -h localhost -U qa_user -d qa_database > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

log "✅ Backup created: ${BACKUP_FILE}.gz" "$GREEN"
log "💡 To restore: gunzip -c ${BACKUP_FILE}.gz | psql -h localhost -U qa_user -d qa_database" "$BLUE"