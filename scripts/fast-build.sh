#!/bin/bash

# 快速构建脚本 - QA App
# 优化构建和启动速度

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🚀 QA App 快速构建${NC}"
echo "================================"

# 检查是否有 Docker
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装"
    exit 1
fi

# 检查是否有 docker-compose
if ! command -v docker-compose &> /dev/null; then
    echo "错误: docker-compose 未安装"
    exit 1
fi

# 并行构建选项
PARALLEL_BUILD=${PARALLEL_BUILD:-true}
BUILD_CACHE=${BUILD_CACHE:-true}
SKIP_TESTS=${SKIP_TESTS:-false}

echo -e "${YELLOW}构建配置:${NC}"
echo "- 并行构建: $PARALLEL_BUILD"
echo "- 构建缓存: $BUILD_CACHE"
echo "- 跳过测试: $SKIP_TESTS"
echo ""

# 清理旧容器和镜像（可选）
if [ "${CLEAN_BUILD:-false}" = "true" ]; then
    echo "🧹 清理旧构建..."
    docker-compose -f docker-compose.simple.yml down --volumes --remove-orphans 2>/dev/null || true
    docker system prune -f
fi

# 设置构建参数
BUILD_ARGS=""
if [ "$BUILD_CACHE" = "false" ]; then
    BUILD_ARGS="$BUILD_ARGS --no-cache"
fi

if [ "$PARALLEL_BUILD" = "true" ]; then
    BUILD_ARGS="$BUILD_ARGS --parallel"
fi

# 构建服务
echo "🔨 构建Docker镜像..."
start_time=$(date +%s)

if [ "$PARALLEL_BUILD" = "true" ]; then
    # 并行构建API和Web
    echo "并行构建API和Web服务..."
    docker-compose -f docker-compose.simple.yml build $BUILD_ARGS api &
    API_PID=$!
    docker-compose -f docker-compose.simple.yml build $BUILD_ARGS web &
    WEB_PID=$!
    
    # 等待构建完成
    wait $API_PID
    API_RESULT=$?
    wait $WEB_PID
    WEB_RESULT=$?
    
    if [ $API_RESULT -ne 0 ] || [ $WEB_RESULT -ne 0 ]; then
        echo "构建失败"
        exit 1
    fi
else
    # 顺序构建
    docker-compose -f docker-compose.simple.yml build $BUILD_ARGS
fi

build_time=$(($(date +%s) - $start_time))
echo -e "${GREEN}✅ 构建完成 (用时: ${build_time}s)${NC}"

# 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.simple.yml up -d

# 等待服务健康
echo "⏳ 等待服务启动..."
sleep 10

# 运行健康检查
echo "🏥 运行健康检查..."
if [ -f "./scripts/health-check.sh" ]; then
    ./scripts/health-check.sh
else
    # 简单健康检查
    if curl -s -f http://localhost:3000 > /dev/null && curl -s -f http://localhost:3001/health > /dev/null; then
        echo -e "${GREEN}✅ 服务运行正常${NC}"
    else
        echo "⚠️ 服务可能未完全启动，请检查日志"
        docker-compose -f docker-compose.simple.yml logs --tail=20
    fi
fi

total_time=$(($(date +%s) - $start_time))
echo ""
echo -e "${GREEN}🎉 部署完成!${NC}"
echo "总用时: ${total_time}s"
echo "Web应用: http://localhost:3000"
echo "API文档: http://localhost:3001/api"
echo ""
echo "有用的命令:"
echo "  查看日志: docker-compose -f docker-compose.simple.yml logs -f"
echo "  停止服务: docker-compose -f docker-compose.simple.yml down"
echo "  重启服务: docker-compose -f docker-compose.simple.yml restart"