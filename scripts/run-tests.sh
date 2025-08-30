#!/bin/bash

echo "🚀 启动测试环境..."

# 确保服务运行
echo "检查服务状态..."

# 检查PostgreSQL
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "启动PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

# 检查Redis
if ! redis-cli ping > /dev/null 2>&1; then
    echo "启动Redis..."
    sudo service redis-server start
    sleep 2
fi

# 检查API服务
if ! curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "启动API服务..."
    cd /workspace/apps/api
    npm run build > /dev/null 2>&1
    nohup node dist/main.js > /dev/null 2>&1 &
    sleep 5
fi

# 检查Web服务
if ! curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo "启动Web服务..."
    cd /workspace/apps/web
    npm run build > /dev/null 2>&1
    nohup npm run start > /dev/null 2>&1 &
    sleep 10
fi

echo "✅ 服务准备就绪"

# 运行测试
echo "🧪 开始运行测试..."
cd /workspace

# 安装Playwright浏览器（如果需要）
npx playwright install chromium --with-deps > /dev/null 2>&1

# 运行测试
npx playwright test tests/system-test.spec.ts \
    --project=chromium \
    --reporter=list \
    --workers=1 \
    --timeout=60000 \
    --retries=1

# 获取测试结果
TEST_RESULT=$?

# 生成报告
if [ $TEST_RESULT -eq 0 ]; then
    echo "✅ 所有测试通过！"
else
    echo "❌ 部分测试失败"
    echo "查看详细报告: npx playwright show-report"
fi

# 显示测试统计
echo ""
echo "📊 测试统计："
npx playwright test tests/system-test.spec.ts --project=chromium --reporter=json 2>/dev/null | \
    jq -r '.stats | "总计: \(.total) | 通过: \(.passed) | 失败: \(.failed) | 跳过: \(.skipped)"' 2>/dev/null || \
    echo "无法获取测试统计"

exit $TEST_RESULT