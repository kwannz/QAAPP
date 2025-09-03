#!/bin/bash

# QAapp 后端部署脚本
# 使用方法: ./scripts/deploy-backend.sh [production|staging|development]

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
API_APP_DIR="$PROJECT_ROOT/apps/api"
BACKEND_DIR="$PROJECT_ROOT/packages/backend"
DEPLOY_DIR="/var/www/qa-app-api"
DB_DEPLOY_DIR="/var/lib/qa-app-db"

log_info "开始部署QAapp后端到 $ENVIRONMENT 环境"
log_info "项目路径: $PROJECT_ROOT"

# 检查必要文件
if [[ ! -f "$API_APP_DIR/package.json" ]]; then
    log_error "API应用目录不存在: $API_APP_DIR"
    exit 1
fi

# 环境变量配置
configure_environment() {
    log_info "配置 $ENVIRONMENT 环境变量"
    
    case $ENVIRONMENT in
        production)
            export NODE_ENV=production
            export PORT=3001
            export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_app_prod"
            export REDIS_URL="redis://localhost:6379/0"
            export JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
            export CORS_ORIGIN="https://qa-app.com,https://www.qa-app.com"
            export ENABLE_SWAGGER=false
            ;;
        staging)
            export NODE_ENV=staging
            export PORT=3001
            export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_app_staging"
            export REDIS_URL="redis://localhost:6379/1"
            export JWT_SECRET="your-staging-jwt-secret"
            export CORS_ORIGIN="https://staging.qa-app.com"
            export ENABLE_SWAGGER=true
            ;;
        development)
            export NODE_ENV=development
            export PORT=3001
            export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_app_dev"
            export REDIS_URL="redis://localhost:6379/2"
            export JWT_SECRET="dev-jwt-secret"
            export CORS_ORIGIN="http://localhost:3000"
            export ENABLE_SWAGGER=true
            ;;
        *)
            log_error "不支持的环境: $ENVIRONMENT"
            exit 1
            ;;
    esac
    
    # 创建环境变量文件
    cat > /tmp/.env << EOF
NODE_ENV=$NODE_ENV
PORT=$PORT
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=$JWT_SECRET
CORS_ORIGIN=$CORS_ORIGIN
ENABLE_SWAGGER=$ENABLE_SWAGGER
EOF
    
    log_success "环境配置完成: $ENVIRONMENT"
}

# 检查系统依赖
check_system_dependencies() {
    log_info "检查系统依赖"
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装"
        exit 1
    fi
    
    # 检查PostgreSQL
    if ! command -v psql &> /dev/null; then
        log_warning "PostgreSQL客户端未安装，正在安装..."
        sudo apt update
        sudo apt install -y postgresql-client
    fi
    
    # 检查Redis
    if ! command -v redis-cli &> /dev/null; then
        log_warning "Redis客户端未安装，正在安装..."
        sudo apt install -y redis-tools
    fi
    
    log_success "系统依赖检查完成"
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

# 数据库设置
setup_database() {
    log_info "设置数据库"
    
    # 创建数据库（如果不存在）
    local db_name
    case $ENVIRONMENT in
        production) db_name="qa_app_prod" ;;
        staging) db_name="qa_app_staging" ;;
        development) db_name="qa_app_dev" ;;
    esac
    
    # 检查数据库连接
    if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
        log_success "数据库连接正常"
    else
        log_warning "数据库连接失败，尝试创建数据库"
        # 这里需要根据实际情况调整
        createdb "$db_name" || true
    fi
    
    # 运行数据库迁移
    log_info "运行数据库迁移"
    cd "$PROJECT_ROOT"
    pnpm db:generate
    pnpm db:migrate
    
    log_success "数据库设置完成"
}

# 构建后端应用
build_application() {
    log_info "构建后端应用"
    cd "$PROJECT_ROOT"
    
    # 构建所有后端服务
    pnpm build:api
    pnpm build:backend
    
    log_success "应用构建完成"
}

# 运行测试
run_tests() {
    log_info "运行测试套件"
    cd "$PROJECT_ROOT"
    
    # 运行API测试
    if pnpm test:api --passWithNoTests; then
        log_success "API测试通过"
    else
        log_error "API测试失败"
        exit 1
    fi
    
    # 运行后端服务测试
    if pnpm test:backend --passWithNoTests; then
        log_success "后端服务测试通过"
    else
        log_error "后端服务测试失败"
        exit 1
    fi
}

# 部署应用
deploy_application() {
    log_info "部署后端应用到服务器"
    
    # 创建部署目录
    sudo mkdir -p "$DEPLOY_DIR"
    sudo mkdir -p "$DB_DEPLOY_DIR"
    
    # 停止现有服务
    if systemctl is-active --quiet qa-app-api; then
        log_info "停止现有API服务"
        sudo systemctl stop qa-app-api
    fi
    
    if systemctl is-active --quiet qa-app-backend; then
        log_info "停止现有后端服务"
        sudo systemctl stop qa-app-backend
    fi
    
    # 备份当前部署（如果存在）
    if [[ -d "$DEPLOY_DIR/current" ]]; then
        log_info "备份当前部署"
        sudo mv "$DEPLOY_DIR/current" "$DEPLOY_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # 复制新构建
    log_info "复制构建文件"
    sudo cp -r "$PROJECT_ROOT" "$DEPLOY_DIR/current"
    
    # 复制环境变量文件
    sudo cp /tmp/.env "$DEPLOY_DIR/current/"
    
    # 设置权限
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    log_success "文件部署完成"
}

# 配置服务
configure_services() {
    log_info "配置后端服务"
    
    # 创建API服务文件
    cat > /tmp/qa-app-api.service << EOF
[Unit]
Description=QAapp API Service
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_DIR/current/apps/api
EnvironmentFile=$DEPLOY_DIR/current/.env
ExecStart=/usr/bin/node dist/main.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # 创建后端服务文件
    cat > /tmp/qa-app-backend.service << EOF
[Unit]
Description=QAapp Backend Service
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$DEPLOY_DIR/current/packages/backend
EnvironmentFile=$DEPLOY_DIR/current/.env
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # 安装服务
    sudo mv /tmp/qa-app-api.service /etc/systemd/system/
    sudo mv /tmp/qa-app-backend.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable qa-app-api
    sudo systemctl enable qa-app-backend
    
    log_success "服务配置完成"
}

# 启动服务
start_services() {
    log_info "启动后端服务"
    
    # 启动API服务
    sudo systemctl start qa-app-api
    
    # 启动后端服务
    sudo systemctl start qa-app-backend
    
    # 检查服务状态
    sleep 5
    
    if systemctl is-active --quiet qa-app-api; then
        log_success "API服务启动成功"
    else
        log_error "API服务启动失败"
        sudo journalctl -u qa-app-api --no-pager -n 20
        exit 1
    fi
    
    if systemctl is-active --quiet qa-app-backend; then
        log_success "后端服务启动成功"
    else
        log_error "后端服务启动失败"
        sudo journalctl -u qa-app-backend --no-pager -n 20
        exit 1
    fi
}

# 健康检查
health_check() {
    log_info "执行健康检查"
    
    local max_attempts=30
    local attempt=1
    
    # 检查API健康状态
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_success "API服务健康检查通过"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "API健康检查失败"
            exit 1
        fi
        
        log_info "等待API服务启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 检查数据库连接
    if psql "$DATABASE_URL" -c '\q' 2>/dev/null; then
        log_success "数据库连接检查通过"
    else
        log_error "数据库连接检查失败"
        exit 1
    fi
    
    # 检查Redis连接
    if redis-cli -u "$REDIS_URL" ping | grep -q PONG; then
        log_success "Redis连接检查通过"
    else
        log_error "Redis连接检查失败"
        exit 1
    fi
}

# 主执行流程
main() {
    log_info "========================================"
    log_info "    QAapp 后端部署脚本 v1.0"
    log_info "========================================"
    
    configure_environment
    check_system_dependencies
    install_dependencies
    setup_database
    build_application
    
    if [[ "$ENVIRONMENT" != "development" ]]; then
        run_tests
    fi
    
    deploy_application
    configure_services
    start_services
    health_check
    
    log_success "========================================"
    log_success "   后端部署完成！"
    log_success "   环境: $ENVIRONMENT"
    log_success "   API地址: http://localhost:3001"
    log_success "   Swagger文档: http://localhost:3001/api"
    log_success "========================================"
}

# 错误处理
trap 'log_error "部署过程中发生错误，退出码: $?"' ERR

# 执行主函数
main "$@"