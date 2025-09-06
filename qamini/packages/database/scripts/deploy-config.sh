#!/bin/bash
# 数据库部署配置脚本
# 用于在不同环境间切换数据库配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATABASE_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$(dirname "$DATABASE_DIR")")"

print_info "QA App 数据库配置管理工具"
echo "======================================"

# 检查参数
if [ $# -eq 0 ]; then
    echo "用法: $0 <environment> [action]"
    echo ""
    echo "环境:"
    echo "  development  - 开发环境 (默认)"
    echo "  test         - 测试环境"
    echo "  staging      - 预发布环境"
    echo "  production   - 生产环境"
    echo ""
    echo "动作:"
    echo "  validate     - 验证数据库配置 (默认)"
    echo "  migrate      - 执行数据库迁移"
    echo "  seed         - 运行数据填充"
    echo "  reset        - 重置数据库"
    echo "  status       - 查看数据库状态"
    echo ""
    exit 1
fi

ENVIRONMENT=${1:-development}
ACTION=${2:-validate}

print_info "环境: $ENVIRONMENT"
print_info "动作: $ACTION"
echo ""

# 设置环境变量
export NODE_ENV="$ENVIRONMENT"

case $ENVIRONMENT in
    "development")
        export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_app_dev?schema=public"
        ;;
    "test")
        export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_app_test?schema=public"
        ;;
    "staging")
        if [ -z "$DATABASE_STAGING_URL" ]; then
            print_error "DATABASE_STAGING_URL 环境变量未设置"
            exit 1
        fi
        export DATABASE_URL="$DATABASE_STAGING_URL"
        ;;
    "production")
        if [ -z "$DATABASE_PROD_URL" ] && [ -z "$DATABASE_AWS_URL" ] && [ -z "$DATABASE_SUPABASE_URL" ] && [ -z "$DATABASE_RAILWAY_URL" ]; then
            print_error "生产环境数据库URL未配置"
            print_error "请设置以下环境变量之一:"
            echo "  - DATABASE_PROD_URL"
            echo "  - DATABASE_AWS_URL"
            echo "  - DATABASE_SUPABASE_URL"
            echo "  - DATABASE_RAILWAY_URL"
            exit 1
        fi
        ;;
    *)
        print_error "未知环境: $ENVIRONMENT"
        exit 1
        ;;
esac

# 执行动作
case $ACTION in
    "validate")
        print_info "验证数据库配置..."
        cd "$DATABASE_DIR"
        node -e "
        const { validateDatabaseConfig, getDatabaseConfig, checkDatabaseConnection } = require('./dist/src/index.js');
        
        console.log('🧪 验证配置...');
        if (validateDatabaseConfig()) {
            console.log('');
            const config = getDatabaseConfig();
            console.log('📋 配置详情:');
            console.log('   环境:', process.env.NODE_ENV);
            console.log('   URL:', config.url.replace(/(:)[^:@]*(@)/, '\$1****\$2'));
            console.log('   连接池大小:', config.poolSize);
            console.log('   连接超时:', config.connectionTimeout + 'ms');
            console.log('   SSL:', config.ssl ? '启用' : '禁用');
        } else {
            process.exit(1);
        }
        "
        print_success "配置验证完成"
        ;;
    
    "migrate")
        print_info "执行数据库迁移..."
        cd "$DATABASE_DIR"
        pnpm prisma migrate deploy
        print_success "数据库迁移完成"
        ;;
    
    "seed")
        print_info "运行数据填充..."
        cd "$DATABASE_DIR"
        pnpm prisma db seed
        print_success "数据填充完成"
        ;;
    
    "reset")
        if [ "$ENVIRONMENT" = "production" ]; then
            print_error "禁止在生产环境重置数据库！"
            exit 1
        fi
        
        print_warning "即将重置 $ENVIRONMENT 环境的数据库"
        read -p "确认继续? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_info "操作已取消"
            exit 0
        fi
        
        print_info "重置数据库..."
        cd "$DATABASE_DIR"
        pnpm prisma migrate reset --force
        print_success "数据库重置完成"
        ;;
    
    "status")
        print_info "检查数据库状态..."
        cd "$DATABASE_DIR"
        node -e "
        const { healthCheck, checkDatabaseConnection } = require('./dist/src/index.js');
        
        (async () => {
            console.log('🔍 检查数据库连接...');
            const health = await healthCheck();
            
            console.log('');
            console.log('📊 数据库状态:');
            console.log('   连接状态:', health.database ? '✅ 正常' : '❌ 失败');
            console.log('   检查时间:', health.timestamp);
            if (health.version) {
                console.log('   数据库版本:', health.version.split(',')[0]);
            }
            
            if (!health.database) {
                process.exit(1);
            }
        })();
        "
        ;;
    
    *)
        print_error "未知动作: $ACTION"
        exit 1
        ;;
esac

echo ""
print_success "操作完成！"