#!/usr/bin/env bash

set -euo pipefail

# QAAPP VPS Setup Script - Linux Compatible
# This script sets up PostgreSQL, Redis, and Node.js environment for production deployment

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${2:-$NC}$1${NC}"
}

check_root() {
    if [[ $EUID -eq 0 ]]; then
        log "❌ 不要以 root 用户运行此脚本" "$RED"
        exit 1
    fi
}

detect_os() {
    if [[ -f /etc/os-release ]]; then
        . /etc/os-release
        OS=$ID
        VER=$VERSION_ID
    else
        log "❌ 无法检测操作系统" "$RED"
        exit 1
    fi
    
    log "✅ 检测到系统: $OS $VER" "$GREEN"
}

install_nodejs() {
    log "\n📦 检查 Node.js..." "$BLUE"
    
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version)
        log "✅ Node.js 已安装: $NODE_VERSION" "$GREEN"
    else
        log "⚠️  Node.js 未安装，正在安装..." "$YELLOW"
        
        # 安装 Node.js (使用 NodeSource repository)
        if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "fedora" ]]; then
            curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
            sudo dnf install -y nodejs npm
        else
            log "❌ 不支持的操作系统: $OS" "$RED"
            exit 1
        fi
    fi
    
    # 安装 pnpm
    if ! command -v pnpm >/dev/null 2>&1; then
        log "📦 安装 pnpm..." "$BLUE"
        npm install -g pnpm
    fi
    
    log "✅ Node.js 和 pnpm 准备就绪" "$GREEN"
}

install_postgresql() {
    log "\n🐘 设置 PostgreSQL..." "$BLUE"
    
    if command -v psql >/dev/null 2>&1; then
        log "✅ PostgreSQL 已安装" "$GREEN"
    else
        log "⚠️  PostgreSQL 未安装，正在安装..." "$YELLOW"
        
        if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
        elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "fedora" ]]; then
            sudo dnf install -y postgresql postgresql-server postgresql-contrib
            sudo postgresql-setup --initdb
        fi
        
        # 启动并启用 PostgreSQL
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    fi
    
    # 创建数据库用户和数据库
    log "🔧 配置数据库用户..." "$BLUE"
    sudo -u postgres psql -c "CREATE USER qa_user WITH ENCRYPTED PASSWORD 'qa_password';" 2>/dev/null || true
    sudo -u postgres psql -c "CREATE DATABASE qa_database OWNER qa_user;" 2>/dev/null || true
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;" 2>/dev/null || true
    
    log "✅ PostgreSQL 配置完成" "$GREEN"
}

install_redis() {
    log "\n🔴 设置 Redis..." "$BLUE"
    
    if command -v redis-cli >/dev/null 2>&1; then
        log "✅ Redis 已安装" "$GREEN"
    else
        log "⚠️  Redis 未安装，正在安装..." "$YELLOW"
        
        if [[ "$OS" == "ubuntu" ]] || [[ "$OS" == "debian" ]]; then
            sudo apt-get install -y redis-server
        elif [[ "$OS" == "centos" ]] || [[ "$OS" == "rhel" ]] || [[ "$OS" == "fedora" ]]; then
            sudo dnf install -y redis
        fi
        
        # 启动并启用 Redis
        sudo systemctl start redis
        sudo systemctl enable redis
    fi
    
    log "✅ Redis 配置完成" "$GREEN"
}

setup_environment_file() {
    log "\n📝 设置环境配置..." "$BLUE"
    
    if [[ ! -f .env ]]; then
        if [[ -f .env.production ]]; then
            cp .env.production .env
            log "✅ 复制 .env.production 到 .env" "$GREEN"
        else
            log "⚠️  创建基础 .env 文件..." "$YELLOW"
            cat > .env << EOF
NODE_ENV=production
DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
API_PORT=3001
WEB_PORT=3002
ENABLE_METRICS=true
LOG_LEVEL=info
EOF
        fi
    else
        log "✅ .env 文件已存在" "$GREEN"
    fi
}

check_services() {
    log "\n🩺 检查服务状态..." "$BLUE"
    
    # 检查 PostgreSQL
    if sudo systemctl is-active --quiet postgresql; then
        log "✅ PostgreSQL 运行中" "$GREEN"
    else
        log "❌ PostgreSQL 未运行" "$RED"
        exit 1
    fi
    
    # 检查 Redis
    if sudo systemctl is-active --quiet redis; then
        log "✅ Redis 运行中" "$GREEN"
    else
        log "❌ Redis 未运行" "$RED"
        exit 1
    fi
    
    # 测试数据库连接
    if PGPASSWORD=qa_password psql -h localhost -U qa_user -d qa_database -c "SELECT 1;" >/dev/null 2>&1; then
        log "✅ 数据库连接成功" "$GREEN"
    else
        log "❌ 数据库连接失败" "$RED"
        log "💡 请检查 PostgreSQL 配置和用户权限" "$YELLOW"
        exit 1
    fi
}

main() {
    log "🚀 QAAPP VPS 环境设置" "$BLUE"
    log "=================================" "$BLUE"
    
    check_root
    detect_os
    install_nodejs
    install_postgresql
    install_redis
    setup_environment_file
    check_services
    
    log "\n🎉 VPS 环境设置完成！" "$GREEN"
    log "=================================" "$BLUE"
    log "下一步:" "$BLUE"
    log "  1. 运行: pnpm install" "$GREEN"
    log "  2. 运行: pnpm build" "$GREEN"
    log "  3. 运行: pnpm start" "$GREEN"
    log "\n管理命令:" "$BLUE"
    log "  • 查看日志: pnpm run pm2:logs" "$GREEN"
    log "  • 停止服务: pnpm run pm2:stop" "$GREEN"
    log "  • 重启服务: pm2 restart ecosystem.config.js" "$GREEN"
}

main "$@"