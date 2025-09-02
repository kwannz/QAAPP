#!/usr/bin/env bash

set -euo pipefail

# QAAPP 部署验证脚本
# 验证完整的 VPS 部署流程

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${2:-$NC}$1${NC}"
}

check_environment() {
    log "\n🔍 环境检查..." "$BLUE"
    
    # 检查必需的环境变量
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log "❌ DATABASE_URL 未设置" "$RED"
        return 1
    fi
    
    if ! echo "$DATABASE_URL" | grep -q "postgresql://"; then
        log "❌ DATABASE_URL 必须是 PostgreSQL 连接字符串" "$RED"
        return 1
    fi
    
    log "✅ 环境变量检查通过" "$GREEN"
    return 0
}

check_database() {
    log "\n🗄️  数据库连接检查..." "$BLUE"
    
    # 提取数据库连接信息
    DB_URL="${DATABASE_URL}"
    
    # 尝试连接数据库
    if pnpm --filter=@qa-app/database db:status >/dev/null 2>&1; then
        log "✅ 数据库连接成功" "$GREEN"
        return 0
    else
        log "❌ 数据库连接失败" "$RED"
        log "💡 请检查 PostgreSQL 服务和连接字符串" "$YELLOW"
        return 1
    fi
}

check_build() {
    log "\n🔨 构建检查..." "$BLUE"
    
    if pnpm run build >/dev/null 2>&1; then
        log "✅ 项目构建成功" "$GREEN"
        return 0
    else
        log "❌ 项目构建失败" "$RED"
        return 1
    fi
}

check_services() {
    log "\n🚀 服务启动检查..." "$BLUE"
    
    # 检查 PM2 状态
    if pm2 status 2>/dev/null | grep -q "qa-"; then
        log "✅ PM2 服务运行中" "$GREEN"
    else
        log "⚠️  PM2 服务未运行，尝试启动..." "$YELLOW"
        pnpm run pm2:start
        sleep 5
    fi
    
    # 检查 API 健康状态
    local api_check=0
    for i in {1..5}; do
        if curl -f http://localhost:3001/health >/dev/null 2>&1; then
            log "✅ API 服务健康检查通过" "$GREEN"
            api_check=1
            break
        fi
        sleep 2
    done
    
    if [[ $api_check -eq 0 ]]; then
        log "❌ API 健康检查失败" "$RED"
        return 1
    fi
    
    # 检查 Web 服务
    local web_check=0
    for i in {1..5}; do
        if curl -f http://localhost:3002 >/dev/null 2>&1; then
            log "✅ Web 服务健康检查通过" "$GREEN"
            web_check=1
            break
        fi
        sleep 2
    done
    
    if [[ $web_check -eq 0 ]]; then
        log "❌ Web 服务健康检查失败" "$RED"
        return 1
    fi
    
    return 0
}

check_endpoints() {
    log "\n🔗 端点检查..." "$BLUE"
    
    # 检查关键API端点
    local endpoints=(
        "http://localhost:3001/health"
        "http://localhost:3001/health/detailed"
        "http://localhost:3001/api"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if curl -f "$endpoint" >/dev/null 2>&1; then
            log "✅ $endpoint 可访问" "$GREEN"
        else
            log "⚠️  $endpoint 不可访问" "$YELLOW"
        fi
    done
}

display_summary() {
    log "\n📊 部署验证摘要" "$BLUE"
    log "=================================" "$BLUE"
    
    # PM2 状态
    log "\n📋 PM2 服务状态:" "$BLUE"
    pm2 status
    
    # 端口占用情况
    log "\n🔌 端口使用情况:" "$BLUE"
    ss -tlnp | grep -E ":(3001|3002)" || log "未检测到服务端口" "$YELLOW"
    
    # 内存使用
    log "\n💾 内存使用情况:" "$BLUE"
    free -h
    
    log "\n🎉 验证完成！" "$GREEN"
    log "📝 查看日志: pnpm run pm2:logs" "$GREEN"
    log "📊 PM2 仪表板: pm2 monit" "$GREEN"
}

main() {
    log "🧪 QAAPP 部署验证" "$BLUE"
    log "=================================" "$BLUE"
    
    local failed=0
    
    check_environment || failed=1
    check_database || failed=1
    check_build || failed=1
    check_services || failed=1
    check_endpoints
    
    display_summary
    
    if [[ $failed -eq 1 ]]; then
        log "\n❌ 验证失败，请检查上述错误" "$RED"
        exit 1
    else
        log "\n🎉 所有检查通过！部署验证成功" "$GREEN"
    fi
}

main "$@"