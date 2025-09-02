#!/usr/bin/env bash

set -euo pipefail

# Simple environment validation for QAAPP deployment

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

# Required environment variables
REQUIRED_VARS=(
    "NODE_ENV"
    "DATABASE_URL"
    "API_PORT"
    "WEB_PORT"
    "JWT_SECRET"
)

# Optional but recommended
RECOMMENDED_VARS=(
    "LOG_LEVEL"
    "BCRYPT_ROUNDS"
)

main() {
    log "🔍 Environment Validation" "$GREEN"
    log "========================" "$GREEN"
    
    local failed=0
    
    # Check required variables
    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "❌ Required: $var" "$RED"
            failed=1
        else
            log "✅ $var" "$GREEN"
        fi
    done
    
    # Check recommended variables
    for var in "${RECOMMENDED_VARS[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            log "⚠️  Recommended: $var" "$YELLOW"
        else
            log "✅ $var" "$GREEN"
        fi
    done
    
    # Validate DATABASE_URL format
    if [[ -n "${DATABASE_URL:-}" ]]; then
        if [[ "$DATABASE_URL" == *"postgresql://"* ]]; then
            log "✅ DATABASE_URL format valid" "$GREEN"
        else
            log "❌ DATABASE_URL must be PostgreSQL connection string" "$RED"
            failed=1
        fi
    fi
    
    # Check NODE_ENV
    if [[ "${NODE_ENV:-}" != "production" ]]; then
        log "⚠️  NODE_ENV should be 'production' for deployment" "$YELLOW"
    fi
    
    if [[ $failed -eq 1 ]]; then
        log "\n❌ Validation failed. Please set missing environment variables." "$RED"
        log "💡 Copy .env.production to .env and update values" "$YELLOW"
        exit 1
    else
        log "\n🎉 Environment validation passed!" "$GREEN"
    fi
}

main "$@"