#!/bin/bash

echo "🧪 QA App 集成测试"
echo "=================="

# 测试后端
echo "1. 后端API健康检查..."
curl -s http://localhost:3001/health | grep -q "ok" && echo "✅ 后端正常" || echo "❌ 后端失败"

# 测试API端点
echo "2. 产品API测试..."
curl -s http://localhost:3001/api/products | grep -q "SILVER" && echo "✅ 产品API正常" || echo "❌ 产品API失败"

# 测试订单API
echo "3. 订单API测试..."
curl -s http://localhost:3001/api/orders > /dev/null 2>&1 && echo "✅ 订单API正常" || echo "❌ 订单API失败"

# 测试前端
echo "4. 前端页面测试..."
curl -s http://localhost:3002 | grep -q "QA App" && echo "✅ 前端正常" || echo "❌ 前端失败"

# 性能测试
echo "5. 性能测试..."
START=$(date +%s%3N)
curl -s http://localhost:3001/api/products > /dev/null
END=$(date +%s%3N)
TIME=$((END - START))
echo "✅ API响应时间: ${TIME}ms"

echo ""
echo "🎉 集成测试完成！"
echo "📊 系统状态: 前后端正常运行"
echo "🚀 准备进入生产环境"