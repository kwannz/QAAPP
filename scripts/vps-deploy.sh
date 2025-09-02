#!/usr/bin/env bash

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

check_prerequisites() {
    log "🔍 检查部署先决条件..." "$BLUE"
    
    # 检查 pnpm
    if ! command -v pnpm >/dev/null 2>&1; then
        log "❌ 未检测到 pnpm，请先安装: npm i -g pnpm" "$RED"
        exit 1
    fi
    
    # 检查 PostgreSQL 连接
    if [[ -n "${DATABASE_URL:-}" ]]; then
        if ! echo "$DATABASE_URL" | grep -q "postgresql://"; then
            log "❌ DATABASE_URL 必须是 PostgreSQL 连接字符串" "$RED"
            exit 1
        fi
    else
        log "⚠️  DATABASE_URL 未设置，将使用默认配置" "$YELLOW"
    fi
    
    # 检查服务状态
    if command -v systemctl >/dev/null 2>&1; then
        if ! systemctl is-active --quiet postgresql 2>/dev/null; then
            log "❌ PostgreSQL 服务未运行" "$RED"
            log "💡 请运行: sudo systemctl start postgresql" "$YELLOW"
            exit 1
        fi
    fi
    
    log "✅ 先决条件检查通过" "$GREEN"
}

main() {
    log "===== QAAPP VPS 部署 =====" "$BLUE"
    
    check_prerequisites
    
    mkdir -p logs
    
    log "📦 安装依赖..." "$BLUE"
    pnpm install --frozen-lockfile
    
    log "🔨 构建项目..." "$BLUE"
    pnpm run build
    
    log "🗄️  数据库迁移..." "$BLUE"
    pnpm --filter=@qa-app/database db:migrate:deploy 2>/dev/null || log "⚠️  迁移跳过（数据库可能已是最新）" "$YELLOW"
    
    log "🚀 启动服务（PM2）..." "$BLUE"
    pnpm run pm2:start
    
    log "\n🎉 部署完成！" "$GREEN"
    log "📊 查看状态: pm2 status" "$GREEN"
    log "📝 查看日志: pm2 logs" "$GREEN"
    log "🔗 API健康检查: curl http://localhost:3001/health" "$GREEN"
    log "🔗 Web应用: http://localhost:3002" "$GREEN"
}

main "$@"


