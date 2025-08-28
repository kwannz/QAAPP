#!/bin/bash

echo "🚀 启动 QA App 完整系统..."
echo "=============================="

# 创建必要的目录
mkdir -p logs

# 设置环境变量
export NODE_ENV=development

echo "启动后端 API 服务..."
cd apps/api
pnpm dev 2>&1 | tee ../../logs/api.log &
API_PID=$!
cd ../..

echo "等待 API 服务启动..."
sleep 5

echo "启动前端 Web 服务..."
cd apps/web
pnpm dev 2>&1 | tee ../../logs/web.log &
WEB_PID=$!
cd ../..

echo "系统启动完成！"
echo "=============================="
echo "API 服务: http://localhost:3001"
echo "Web 服务: http://localhost:3000"
echo ""
echo "进程 ID:"
echo "  API: $API_PID"
echo "  Web: $WEB_PID"
echo ""
echo "日志文件:"
echo "  API: logs/api.log"
echo "  Web: logs/web.log"
echo ""
echo "使用 Ctrl+C 停止所有服务"

# 等待用户中断
wait