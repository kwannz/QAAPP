#!/bin/bash

# QAapp 前端部署脚本
# 使用方法: ./scripts/deploy-frontend.sh [production|staging|development]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取环境参数
ENVIRONMENT=${1:-production}
PROJECT_ROOT=$(dirname $(dirname $(realpath $0)))
WEB_APP_DIR="$PROJECT_ROOT/apps/web"
BUILD_DIR="$WEB_APP_DIR/.next"
DEPLOY_DIR="/var/www/qa-app"

log_info "开始部署QAapp前端到 $ENVIRONMENT 环境"
log_info "项目路径: $PROJECT_ROOT"

# 检查必要文件
if [[ ! -f "$WEB_APP_DIR/package.json" ]]; then
    log_error "前端应用目录不存在: $WEB_APP_DIR"
    exit 1
fi

# 环境变量配置
configure_environment() {
    log_info "配置 $ENVIRONMENT 环境变量"
    
    case $ENVIRONMENT in
        production)
            export NODE_ENV=production
            export NEXT_PUBLIC_API_URL=https://api.qa-app.com
            export NEXT_PUBLIC_WEB3_NETWORK=mainnet
            export NEXT_PUBLIC_ENABLE_TESTNET=false
            ;;
        staging)
            export NODE_ENV=production
            export NEXT_PUBLIC_API_URL=https://staging-api.qa-app.com
            export NEXT_PUBLIC_WEB3_NETWORK=sepolia
            export NEXT_PUBLIC_ENABLE_TESTNET=true
            ;;
        development)
            export NODE_ENV=development
            export NEXT_PUBLIC_API_URL=http://localhost:3001
            export NEXT_PUBLIC_WEB3_NETWORK=sepolia
            export NEXT_PUBLIC_ENABLE_TESTNET=true
            ;;
        *)
            log_error "不支持的环境: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    log_success "环境配置完成: $ENVIRONMENT"
}

# 安装依赖
install_dependencies() {
    log_info "安装项目依赖"
    cd "$PROJECT_ROOT"
    
    # 检查pnpm是否安装
    if ! command -v pnpm &> /dev/null; then
        log_warning "pnpm 未安装，正在安装..."
        npm install -g pnpm@10.15.0
    fi
    
    # 安装依赖
    pnpm install --frozen-lockfile
    log_success "依赖安装完成"
}

# 构建前端应用
build_application() {
    log_info "构建前端应用"
    cd "$PROJECT_ROOT"
    
    # 清理之前的构建
    if [[ -d "$BUILD_DIR" ]]; then
        rm -rf "$BUILD_DIR"
        log_info "清理旧构建文件"
    fi
    
    # 构建应用
    if [[ "$ENVIRONMENT" == "production" ]]; then
        pnpm build:web
    else
        NEXT_BUILD_SKIP_TYPE_CHECK=true pnpm build:web
    fi
    
    log_success "应用构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试套件"
    cd "$PROJECT_ROOT"
    
    # 运行前端测试
    if pnpm test:web --passWithNoTests; then
        log_success "测试通过"
    else
        log_error "测试失败"
        exit 1
    fi
}

# 部署应用
deploy_application() {
    log_info "部署应用到服务器"
    
    # 创建部署目录
    sudo mkdir -p "$DEPLOY_DIR"
    
    # 停止现有服务
    if systemctl is-active --quiet qa-app-web; then
        log_info "停止现有前端服务"
        sudo systemctl stop qa-app-web
    fi
    
    # 备份当前部署（如果存在）
    if [[ -d "$DEPLOY_DIR/current" ]]; then
        log_info "备份当前部署"
        sudo mv "$DEPLOY_DIR/current" "$DEPLOY_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # 复制新构建
    log_info "复制构建文件"
    sudo cp -r "$PROJECT_ROOT" "$DEPLOY_DIR/current"
    
    # 设置权限
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    log_success "文件部署完成"
}

# 配置并启动服务
configure_service() {
    log_info "配置前端服务"
    
    # 创建systemd服务文件
    cat > /tmp/qa-app-web.service << EOF
[Unit]
Description=QAapp Frontend Service
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_DIR/current/apps/web
Environment=NODE_ENV=$NODE_ENV
Environment=PORT=3000
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # 安装服务
    sudo mv /tmp/qa-app-web.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable qa-app-web
    
    log_success "服务配置完成"
}

# 启动服务
start_service() {
    log_info "启动前端服务"
    
    sudo systemctl start qa-app-web
    
    # 检查服务状态
    sleep 5
    if systemctl is-active --quiet qa-app-web; then
        log_success "前端服务启动成功"
        log_info "服务状态:"
        sudo systemctl status qa-app-web --no-pager
    else
        log_error "前端服务启动失败"
        sudo journalctl -u qa-app-web --no-pager -n 20
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查"
    
    local max_attempts=30
    local attempt=1
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "前端服务健康检查通过"
            return 0
        fi
        
        log_info "等待服务启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log_error "健康检查失败"
    exit 1
}

# 主执行流程
main() {
    log_info "========================================"
    log_info "    QAapp 前端部署脚本 v1.0"
    log_info "========================================"
    
    configure_environment
    install_dependencies
    build_application
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        run_tests
    fi
    
    deploy_application
    configure_service
    start_service
    health_check
    
    log_success "========================================"
    log_success "   前端部署完成！"
    log_success "   环境: $ENVIRONMENT"
    log_success "   访问地址: http://localhost:3000"
    log_success "========================================"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"