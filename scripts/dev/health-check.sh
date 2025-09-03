#!/bin/bash

# 简单的健康检查脚本 - QA App
# 验证所有核心服务的健康状态

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
API_URL=${API_URL:-"http://localhost:3001"}
WEB_URL=${WEB_URL:-"http://localhost:3000"}
POSTGRES_HOST=${POSTGRES_HOST:-"localhost"}
POSTGRES_PORT=${POSTGRES_PORT:-"5432"}
REDIS_HOST=${REDIS_HOST:-"localhost"}
REDIS_PORT=${REDIS_PORT:-"6379"}

# 函数：打印状态
print_status() {
    local service=$1
    local status=$2
    local message=$3
    
    if [ "$status" = "OK" ]; then
        echo -e "${GREEN}✓${NC} $service: $message"
    elif [ "$status" = "WARN" ]; then
        echo -e "${YELLOW}⚠${NC} $service: $message"
    else
        echo -e "${RED}✗${NC} $service: $message"
    fi
}

# 函数：检查HTTP端点
check_http() {
    local url=$1
    local timeout=${2:-10}
    
    if curl -s -f --max-time $timeout "$url" > /dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# 函数：检查TCP端口
check_tcp() {
    local host=$1
    local port=$2
    local timeout=${3:-5}
    
    if timeout $timeout bash -c "echo >/dev/tcp/$host/$port" 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

echo "🏥 QA App 系统健康检查"
echo "==============================="

# 检查API健康状态
echo "检查API服务..."
if check_http "$API_URL/health"; then
    # 获取详细健康信息
    health_data=$(curl -s "$API_URL/health/detailed" 2>/dev/null || echo '{}')
    uptime=$(echo "$health_data" | grep -o '"uptime":"[^"]*"' | cut -d'"' -f4 || echo "unknown")
    print_status "API服务" "OK" "运行正常 (运行时间: $uptime)"
else
    print_status "API服务" "FAIL" "无法访问 $API_URL/health"
fi

# 检查Web应用
echo "检查Web应用..."
if check_http "$WEB_URL"; then
    print_status "Web应用" "OK" "运行正常"
else
    print_status "Web应用" "FAIL" "无法访问 $WEB_URL"
fi

# 检查PostgreSQL
echo "检查PostgreSQL数据库..."
if check_tcp "$POSTGRES_HOST" "$POSTGRES_PORT"; then
    print_status "PostgreSQL" "OK" "端口 $POSTGRES_PORT 可访问"
else
    print_status "PostgreSQL" "FAIL" "端口 $POSTGRES_PORT 不可访问"
fi

# 检查Redis
echo "检查Redis缓存..."
if check_tcp "$REDIS_HOST" "$REDIS_PORT"; then
    print_status "Redis" "OK" "端口 $REDIS_PORT 可访问"
else
    print_status "Redis" "FAIL" "端口 $REDIS_PORT 不可访问"
fi

# 检查API指标端点
echo "检查监控指标..."
if check_http "$API_URL/health/metrics"; then
    metrics_data=$(curl -s "$API_URL/health/metrics" 2>/dev/null || echo '{}')
    total_requests=$(echo "$metrics_data" | grep -o '"totalRequests":[0-9]*' | cut -d':' -f2 || echo "0")
    error_rate=$(echo "$metrics_data" | grep -o '"errorRate":[0-9.]*' | cut -d':' -f2 || echo "0")
    print_status "监控指标" "OK" "请求总数: $total_requests, 错误率: ${error_rate}%"
else
    print_status "监控指标" "WARN" "指标端点不可访问"
fi

# 检查磁盘空间
echo "检查系统资源..."
disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    print_status "磁盘空间" "OK" "使用率: ${disk_usage}%"
elif [ "$disk_usage" -lt 90 ]; then
    print_status "磁盘空间" "WARN" "使用率: ${disk_usage}% (接近阈值)"
else
    print_status "磁盘空间" "FAIL" "使用率: ${disk_usage}% (超过阈值)"
fi

# 检查内存使用
memory_usage=$(free | grep Mem | awk '{printf "%.1f", ($3/$2) * 100.0}')
memory_int=${memory_usage%.*}
if [ "$memory_int" -lt 80 ]; then
    print_status "内存使用" "OK" "使用率: ${memory_usage}%"
elif [ "$memory_int" -lt 90 ]; then
    print_status "内存使用" "WARN" "使用率: ${memory_usage}% (接近阈值)"
else
    print_status "内存使用" "FAIL" "使用率: ${memory_usage}% (超过阈值)"
fi

echo ""
echo "✅ 健康检查完成"
echo "时间: $(date '+%Y-%m-%d %H:%M:%S')"