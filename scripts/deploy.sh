#!/bin/bash

# QAapp 一键部署脚本
# 使用方法: ./scripts/deploy.sh [production|staging|development]

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

log_info "========================================"
log_info "    QAapp 一键部署脚本 v1.0"
log_info "========================================"
log_info "环境: $ENVIRONMENT"
log_info "项目路径: $PROJECT_ROOT"

# 检查Docker环境
check_docker() {
    log_info "检查Docker环境"
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "docker-compose 未安装，请先安装docker-compose"
        exit 1
    fi
    
    # 检查Docker是否运行
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker daemon 未运行，请启动Docker"
        exit 1
    fi
    
    log_success "Docker环境检查完成"
}

# 环境配置
setup_environment() {
    log_info "设置部署环境"
    cd "$PROJECT_ROOT"
    
    # 创建环境变量文件
    if [[ ! -f ".env.${ENVIRONMENT}" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example ".env.${ENVIRONMENT}"
            log_warning "已创建 .env.${ENVIRONMENT} 文件，请根据需要修改配置"
        else
            log_error "缺少环境变量模板文件 .env.example"
            exit 1
        fi
    fi
    
    # 设置构建变量
    export BUILD_VERSION=$(git describe --tags --always 2>/dev/null || echo "latest")
    export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
    
    log_success "环境配置完成"
}

# 构建镜像
build_images() {
    log_info "构建Docker镜像"
    cd "$PROJECT_ROOT"
    
    # 根据环境设置目标构建阶段
    local build_target
    case $ENVIRONMENT in
        production)
            build_target="production"
            ;;
        staging)
            build_target="production"
            ;;
        development)
            build_target="development"
            ;;
    esac
    
    # 构建前端镜像
    log_info "构建前端镜像..."
    docker build -t qa-app-web:${BUILD_VERSION} \
        --target ${build_target} \
        --build-arg BUILD_VERSION=${BUILD_VERSION} \
        --build-arg BUILD_TIME="${BUILD_TIME}" \
        --build-arg COMMIT_SHA=${COMMIT_SHA} \
        -f apps/web/Dockerfile .
    
    # 构建后端镜像
    log_info "构建后端镜像..."
    docker build -t qa-app-api:${BUILD_VERSION} \
        --target ${build_target} \
        --build-arg BUILD_VERSION=${BUILD_VERSION} \
        --build-arg BUILD_TIME="${BUILD_TIME}" \
        --build-arg COMMIT_SHA=${COMMIT_SHA} \
        -f apps/api/Dockerfile .
    
    log_success "镜像构建完成"
}

# 部署服务
deploy_services() {
    log_info "部署服务"
    cd "$PROJECT_ROOT"
    
    # 停止现有服务
    log_info "停止现有服务..."
    docker-compose down || true
    
    # 清理旧容器和镜像
    if [[ "$ENVIRONMENT" == "production" ]]; then
        log_info "清理旧容器和镜像..."
        docker system prune -f
    fi
    
    # 根据环境选择不同的compose配置
    local compose_file="docker-compose.yml"
    local compose_override=""
    
    case $ENVIRONMENT in
        production)
            compose_override="-f docker-compose.prod.yml"
            ;;
        staging)
            compose_override="-f docker-compose.staging.yml"
            ;;
        development)
            # 使用默认配置
            ;;
    esac
    
    # 启动服务
    log_info "启动服务..."
    if [[ "$ENVIRONMENT" == "production" ]]; then
        # 生产环境使用profile
        docker-compose --profile production up -d
    else
        # 开发/测试环境
        docker-compose up -d
    fi
    
    log_success "服务部署完成"
}

# 健康检查
health_check() {
    log_info "执行服务健康检查"
    
    local max_attempts=60
    local attempt=1
    
    # 检查数据库
    log_info "检查数据库连接..."
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
            log_success "数据库连接正常"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "数据库连接失败"
            docker-compose logs postgres
            exit 1
        fi
        
        log_info "等待数据库启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 检查Redis
    log_info "检查Redis连接..."
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if docker-compose exec -T redis redis-cli ping | grep -q PONG; then
            log_success "Redis连接正常"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "Redis连接失败"
            docker-compose logs redis
            exit 1
        fi
        
        log_info "等待Redis启动... ($attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    # 检查API服务
    log_info "检查API服务..."
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3001/health > /dev/null 2>&1; then
            log_success "API服务健康检查通过"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "API服务健康检查失败"
            docker-compose logs api
            exit 1
        fi
        
        log_info "等待API服务启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    # 检查前端服务
    log_info "检查前端服务..."
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f http://localhost:3000 > /dev/null 2>&1; then
            log_success "前端服务健康检查通过"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            log_error "前端服务健康检查失败"
            docker-compose logs web
            exit 1
        fi
        
        log_info "等待前端服务启动... ($attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done
    
    log_success "所有服务健康检查通过"
}

# 显示部署信息
show_deployment_info() {
    log_info "========================================"
    log_info "        部署完成信息"
    log_info "========================================"
    
    log_success "环境: $ENVIRONMENT"
    log_success "版本: $BUILD_VERSION"
    log_success "构建时间: $BUILD_TIME"
    log_success "提交SHA: $COMMIT_SHA"
    
    echo ""
    log_info "访问地址:"
    log_info "- 前端: http://localhost:3000"
    log_info "- API: http://localhost:3001"
    log_info "- API文档: http://localhost:3001/api"
    
    if docker-compose ps | grep -q adminer; then
        log_info "- 数据库管理: http://localhost:8080"
    fi
    
    if docker-compose ps | grep -q redis-commander; then
        log_info "- Redis管理: http://localhost:8081"
    fi
    
    echo ""
    log_info "管理命令:"
    log_info "- 查看状态: docker-compose ps"
    log_info "- 查看日志: docker-compose logs -f [service]"
    log_info "- 停止服务: docker-compose down"
    log_info "- 重启服务: docker-compose restart [service]"
    
    log_info "========================================"
}

# 错误处理
cleanup_on_error() {
    log_error "部署过程中发生错误"
    log_info "正在清理..."
    
    cd "$PROJECT_ROOT"
    docker-compose down 2>/dev/null || true
    
    exit 1
}

# 主执行流程
main() {
    # 设置错误处理
    trap cleanup_on_error ERR
    
    check_docker
    setup_environment
    build_images
    deploy_services
    health_check
    show_deployment_info
    
    log_success "========================================"
    log_success "   QAapp 部署成功完成！"
    log_success "========================================"
}

# 脚本选项处理
case "${1:-help}" in
    production|staging|development)
        main
        ;;
    logs)
        cd "$PROJECT_ROOT"
        docker-compose logs -f "${2:-}"
        ;;
    status)
        cd "$PROJECT_ROOT"
        docker-compose ps
        ;;
    stop)
        cd "$PROJECT_ROOT"
        docker-compose down
        log_success "服务已停止"
        ;;
    restart)
        cd "$PROJECT_ROOT"
        docker-compose restart "${2:-}"
        log_success "服务已重启"
        ;;
    clean)
        cd "$PROJECT_ROOT"
        docker-compose down -v --rmi all
        docker system prune -f
        log_success "清理完成"
        ;;
    help|*)
        echo "QAapp 部署脚本使用说明:"
        echo ""
        echo "部署命令:"
        echo "  ./scripts/deploy.sh production   - 生产环境部署"
        echo "  ./scripts/deploy.sh staging      - 测试环境部署"
        echo "  ./scripts/deploy.sh development  - 开发环境部署"
        echo ""
        echo "管理命令:"
        echo "  ./scripts/deploy.sh status       - 查看服务状态"
        echo "  ./scripts/deploy.sh logs [service] - 查看服务日志"
        echo "  ./scripts/deploy.sh stop         - 停止所有服务"
        echo "  ./scripts/deploy.sh restart [service] - 重启服务"
        echo "  ./scripts/deploy.sh clean        - 清理所有容器和镜像"
        echo ""
        ;;
esac