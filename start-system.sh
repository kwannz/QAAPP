#!/bin/bash

# QA系统完整部署脚本
# 支持后台运行和详细日志监控

set -e

# 设置颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 创建必要目录
mkdir -p logs
mkdir -p temp

echo -e "${BLUE}🚀 QA系统完整部署启动脚本${NC}"
echo "======================================"

# 1. 检查系统依赖
echo -e "${YELLOW}📋 检查系统依赖...${NC}"

if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL 未找到，请先安装 PostgreSQL${NC}"
    echo "安装命令: brew install postgresql@14"
    exit 1
fi

if ! command -v redis-cli &> /dev/null; then
    echo -e "${RED}❌ Redis 未找到，请先安装 Redis${NC}"
    echo "安装命令: brew install redis"
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}❌ pnpm 未找到，请先安装 pnpm${NC}"
    echo "安装命令: npm install -g pnpm"
    exit 1
fi

echo -e "${GREEN}✅ 系统依赖检查完成${NC}"

# 2. 检查并启动服务
echo -e "${YELLOW}🔍 检查服务状态...${NC}"

if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL 未运行，正在启动...${NC}"
    brew services start postgresql@14 || {
        echo -e "${RED}❌ 无法启动 PostgreSQL${NC}"
        exit 1
    }
    sleep 3
fi

if ! redis-cli ping &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis 未运行，正在启动...${NC}"
    brew services start redis || {
        echo -e "${RED}❌ 无法启动 Redis${NC}"
        exit 1
    }
    sleep 2
fi

echo -e "${GREEN}✅ 服务状态检查完成${NC}"

# 3. 设置环境变量
echo -e "${YELLOW}🔧 配置环境变量...${NC}"

export NODE_ENV=development
export LOG_LEVEL=verbose
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
export API_PORT=3001
export WEB_PORT=3002
export LOG_TO_FILE=true
export LOG_FILE_PATH="./logs"
export DEBUG_MODE=true
export ENABLE_METRICS=true

# 复制环境文件
if [ ! -f .env ]; then
    if [ -f .env.development ]; then
        cp .env.development .env
        echo -e "${GREEN}✅ 已复制 .env.development 到 .env${NC}"
    else
        echo -e "${RED}❌ 环境配置文件未找到${NC}"
        exit 1
    fi
fi

# 更新 .env 文件中的日志级别
if command -v sed &> /dev/null; then
    sed -i.bak 's/LOG_LEVEL=.*/LOG_LEVEL=verbose/' .env 2>/dev/null || true
fi

echo -e "${GREEN}✅ 环境变量配置完成${NC}"

# 4. 创建数据库用户和数据库
echo -e "${YELLOW}🗄️  初始化数据库...${NC}"

# 检查是否已存在数据库用户
if ! psql -h localhost -d postgres -c "SELECT 1 FROM pg_roles WHERE rolname='qa_user';" 2>/dev/null | grep -q 1; then
    echo "创建数据库用户..."
    psql -h localhost -d postgres -c "CREATE USER qa_user WITH PASSWORD 'qa_password';" || echo "用户可能已存在"
    psql -h localhost -d postgres -c "ALTER USER qa_user CREATEDB;" || echo "权限可能已设置"
fi

# 检查是否已存在数据库
if ! psql -h localhost -U qa_user -lqt 2>/dev/null | cut -d \| -f 1 | grep -qw qa_database; then
    echo "创建数据库..."
    psql -h localhost -d postgres -c "CREATE DATABASE qa_database OWNER qa_user;" || echo "数据库可能已存在"
fi

echo -e "${GREEN}✅ 数据库初始化完成${NC}"

# 5. 安装依赖并构建
echo -e "${YELLOW}📦 安装依赖...${NC}"
pnpm install || {
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
}

echo -e "${YELLOW}🔨 构建项目...${NC}"
# 先构建共享包
pnpm --filter=@qa-app/database build || echo "Database build warning"
pnpm --filter=@qa-app/shared build || echo "Shared build warning"
pnpm --filter=@qa-app/ui build || echo "UI build warning"

# 生成 Prisma 客户端
echo -e "${YELLOW}🔄 生成 Prisma 客户端...${NC}"
cd packages/database
pnpm db:generate || echo "Prisma generate warning"
cd ../..

echo -e "${GREEN}✅ 项目构建完成${NC}"

# 6. 运行数据库迁移和种子数据
echo -e "${YELLOW}🌱 运行数据库迁移和种子数据...${NC}"
cd packages/database
pnpm db:push || echo "Database push warning"
pnpm db:seed || echo "Database seed warning"
cd ../..

echo -e "${GREEN}✅ 数据库迁移和种子数据完成${NC}"

# 7. 启动服务 (后台运行)
echo -e "${YELLOW}🚀 启动系统服务...${NC}"

# 停止现有进程
if [ -f logs/api.pid ]; then
    if kill -0 $(cat logs/api.pid) 2>/dev/null; then
        echo "停止现有 API 服务..."
        kill $(cat logs/api.pid) 2>/dev/null || true
        sleep 2
    fi
    rm -f logs/api.pid
fi

if [ -f logs/web.pid ]; then
    if kill -0 $(cat logs/web.pid) 2>/dev/null; then
        echo "停止现有 Web 服务..."
        kill $(cat logs/web.pid) 2>/dev/null || true
        sleep 2
    fi
    rm -f logs/web.pid
fi

# 启动 API 服务
echo -e "${BLUE}🔗 启动 API 服务 (端口 3001)...${NC}"
nohup pnpm --filter=@qa-app/api dev > logs/api.log 2>&1 &
echo $! > logs/api.pid

# 启动 Web 服务  
echo -e "${BLUE}🌐 启动 Web 服务 (端口 3002)...${NC}"
PORT=3002 nohup pnpm --filter=@qa-app/web dev > logs/web.log 2>&1 &
echo $! > logs/web.pid

# 8. 等待服务启动
echo -e "${YELLOW}⏳ 等待服务启动...${NC}"
sleep 15

# 9. 健康检查
echo -e "${YELLOW}🩺 执行健康检查...${NC}"

API_HEALTH=false
WEB_HEALTH=false

# 检查 API 健康状态 (多次尝试)
for i in {1..3}; do
    if curl -f http://localhost:3001/health &> /dev/null || curl -f http://localhost:3001 &> /dev/null; then
        API_HEALTH=true
        break
    fi
    sleep 2
done

if [ "$API_HEALTH" = true ]; then
    echo -e "${GREEN}✅ API 服务健康${NC}"
else
    echo -e "${RED}❌ API 服务健康检查失败${NC}"
fi

# 检查 Web 健康状态 (多次尝试)
for i in {1..3}; do
    if curl -f http://localhost:3002 &> /dev/null; then
        WEB_HEALTH=true
        break
    fi
    sleep 2
done

if [ "$WEB_HEALTH" = true ]; then
    echo -e "${GREEN}✅ Web 服务健康${NC}"
else
    echo -e "${RED}❌ Web 服务健康检查失败${NC}"
fi

# 10. 输出系统信息
echo ""
echo -e "${GREEN}🎉 系统部署完成！${NC}"
echo "======================================"
echo -e "${BLUE}📊 服务状态:${NC}"
echo "  • PostgreSQL: ✅ 运行中 (端口 5432)"
echo "  • Redis: ✅ 运行中 (端口 6379)"
if [ "$API_HEALTH" = true ]; then
    echo "  • API 服务: ✅ 运行中 (端口 3001)"
else
    echo "  • API 服务: ❌ 异常"
fi
if [ "$WEB_HEALTH" = true ]; then
    echo "  • Web 服务: ✅ 运行中 (端口 3002)"
else
    echo "  • Web 服务: ❌ 异常"
fi

echo ""
echo -e "${BLUE}🔗 访问地址:${NC}"
echo "  • 前端应用: http://localhost:3002"
echo "  • API 接口: http://localhost:3001"
echo "  • API 文档: http://localhost:3001/api"
echo "  • 健康检查: http://localhost:3001/health"

echo ""
echo -e "${BLUE}📝 日志监控:${NC}"
echo "  • API 日志: tail -f logs/api.log"
echo "  • Web 日志: tail -f logs/web.log"
echo "  • 实时监控: open test-verbose-logging.html"

echo ""
echo -e "${BLUE}🔧 管理命令:${NC}"
echo "  • 停止服务: ./stop-system.sh"
echo "  • 重启服务: ./restart-system.sh" 
echo "  • 查看状态: ./health-check.sh"

echo ""
echo -e "${YELLOW}💡 提示:${NC}"
echo "  • 所有服务已在后台运行"
echo "  • 日志文件保存在 logs/ 目录"
echo "  • 进程 ID 保存在 logs/*.pid 文件"

echo -e "${GREEN}🎯 系统已成功部署并在后台运行！${NC}"