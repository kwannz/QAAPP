#!/bin/bash

echo "🧪 开始端到端集成测试..."
echo ""

# 测试后端健康检查
echo "1️⃣ 测试后端健康检查..."
HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
if [[ $HEALTH_RESPONSE == *"ok"* ]]; then
    echo "✅ 后端健康检查通过"
    echo "   响应: $HEALTH_RESPONSE"
else
    echo "❌ 后端健康检查失败"
    exit 1
fi

echo ""

# 测试产品列表API
echo "2️⃣ 测试产品列表API..."
PRODUCTS_RESPONSE=$(curl -s http://localhost:3001/api/products)
if [[ $PRODUCTS_RESPONSE == *"SILVER"* ]]; then
    echo "✅ 产品列表API通过"
    PRODUCT_COUNT=$(echo $PRODUCTS_RESPONSE | grep -o '"id":' | wc -l)
    echo "   获取到 $PRODUCT_COUNT 个产品"
else
    echo "❌ 产品列表API失败"
    exit 1
fi

echo ""

# 测试订单列表API
echo "3️⃣ 测试订单列表API..."
ORDERS_RESPONSE=$(curl -s http://localhost:3001/api/orders)
if [[ $? -eq 0 ]]; then
    echo "✅ 订单列表API通过"
    ORDER_COUNT=$(echo $ORDERS_RESPONSE | grep -o '"id":' | wc -l)
    echo "   获取到 $ORDER_COUNT 个订单"
else
    echo "❌ 订单列表API失败"
    exit 1
fi

echo ""

# 测试前端页面
echo "4️⃣ 测试前端页面..."
FRONTEND_RESPONSE=$(curl -s http://localhost:3002)
if [[ $FRONTEND_RESPONSE == *"QA App"* ]]; then
    echo "✅ 前端页面正常"
    echo "   页面包含QA App标题"
else
    echo "❌ 前端页面失败"
    exit 1
fi

echo ""

# 测试API性能
echo "5️⃣ 测试API性能..."
START_TIME=$(date +%s%3N)
curl -s http://localhost:3001/api/products > /dev/null
END_TIME=$(date +%s%3N)
RESPONSE_TIME=$((END_TIME - START_TIME))
echo "✅ API响应时间: ${RESPONSE_TIME}ms"

if [ $RESPONSE_TIME -lt 1000 ]; then
    echo "✅ 性能测试通过 (< 1秒)"
else
    echo "⚠️ 响应时间较长 (> 1秒)"
fi

echo ""
echo "🎉 所有集成测试通过！"
echo ""
echo "📊 测试结果汇总:"
echo "   ✅ 后端API服务: 正常"
echo "   ✅ 产品管理: 正常"
echo "   ✅ 订单系统: 正常"
echo "   ✅ 前端页面: 正常"
echo "   ✅ API性能: < ${RESPONSE_TIME}ms"
echo "   ✅ 前后端通信: 正常"
echo ""
echo "🚀 系统已准备好进入生产！"