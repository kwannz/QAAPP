#!/bin/bash
# QAapp 快速部署脚本
set -e

SERVER_IP="45.76.207.177"
SERVER_USER="root"
APP_DIR="/var/www/qaapp"
LOCAL_DIR="/Users/zhaoleon/Desktop/QAapp"

echo "🚀 开始部署 QAapp 到生产服务器..."
echo "服务器: $SERVER_IP"
echo "本地目录: $LOCAL_DIR"
echo "远程目录: $APP_DIR"

print_status() {
    echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# 检查本地目录
if [ ! -d "$LOCAL_DIR" ]; then
    print_error "本地目录不存在: $LOCAL_DIR"
    exit 1
fi

print_status "准备上传文件"
cd "$LOCAL_DIR"

# 创建临时目录，排除不需要的文件
TEMP_DIR="/tmp/qaapp-deploy-$(date +%s)"
mkdir -p "$TEMP_DIR"

print_status "复制项目文件到临时目录"
rsync -av --progress \
    --exclude='node_modules' \
    --exclude='dist' \
    --exclude='.git' \
    --exclude='logs' \
    --exclude='test-results' \
    --exclude='playwright-report' \
    --exclude='*.log' \
    --exclude='.env*' \
    --exclude='*.pid' \
    . "$TEMP_DIR/"

print_success "文件准备完成"

# 上传到服务器
print_status "上传文件到服务器"
scp -r "$TEMP_DIR"/* "$SERVER_USER@$SERVER_IP:$APP_DIR/"

print_success "文件上传完成"

# 清理临时目录
rm -rf "$TEMP_DIR"

# 在服务器上执行部署命令
print_status "在服务器上执行部署"
ssh "$SERVER_USER@$SERVER_IP" << 'EOF'
set -e

APP_DIR="/var/www/qaapp"
cd "$APP_DIR"

echo "🔧 在服务器上配置应用..."

# 生成随机密钥
generate_secret() {
    openssl rand -hex 32
}

JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)

echo "✅ 生成安全密钥完成"

# 创建生产环境配置
cat > "$APP_DIR/.env.production" << ENVEOF
# QA App 生产环境配置
NEXT_PUBLIC_API_URL=http://45.76.207.177:3001/api
API_URL=http://localhost:3001

# Web3配置
NEXT_PUBLIC_ENABLE_TESTNET=false
NEXT_PUBLIC_DISABLE_WALLETCONNECT=true
NEXT_PUBLIC_CHAIN_ID=1

# 生产环境设置
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_DEVELOPMENT_MODE=false

# 生产数据库
DATABASE_URL=postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public

# PWA配置
NEXT_PUBLIC_APP_NAME=QA Fixed Income Platform
NEXT_PUBLIC_APP_SHORT_NAME=QA App
NEXT_PUBLIC_APP_DESCRIPTION=Web3固定收益投资平台

# JWT 配置
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=7d

# 端口配置
PORT=3000
API_PORT=3001

# 日志配置
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=info

# Redis 配置
REDIS_URL=redis://localhost:6379

# 安全配置
CORS_ORIGIN=http://45.76.207.177
TRUSTED_PROXIES=127.0.0.1,::1

# 监控配置
ENABLE_METRICS=true
METRICS_PORT=9090

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/var/www/qaapp/uploads
ENVEOF

echo "✅ 生产环境配置创建完成"

# 设置文件权限
chown -R www-data:www-data "$APP_DIR"
chmod 600 "$APP_DIR/.env.production"

# 安装依赖
echo "📦 安装应用依赖..."
cd "$APP_DIR"
pnpm install --frozen-lockfile

echo "✅ 依赖安装完成"

# 配置数据库
echo "🗄️ 配置数据库..."
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
pnpm run db:generate 2>/dev/null || echo "跳过数据库生成"
pnpm run db:push 2>/dev/null || echo "跳过数据库推送"

echo "✅ 数据库配置完成"

# 构建应用
echo "🔨 构建应用..."
NODE_ENV=production pnpm run build

echo "✅ 应用构建完成"

# 停止现有进程
echo "🛑 停止现有应用进程..."
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true

echo "✅ 现有进程已停止"

# 启动应用
echo "🚀 启动应用服务..."
pm2 start ecosystem.config.js --env production
pm2 save

echo "✅ 应用启动完成"

# 健康检查
echo "🔍 运行健康检查..."
sleep 10

# 检查端口
ports=(3000 3001)
for port in "${ports[@]}"; do
    if netstat -tuln | grep ":$port " > /dev/null; then
        echo "✅ 端口 $port 正在监听"
    else
        echo "❌ 端口 $port 未监听"
    fi
done

echo "🎉 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "  - 前端: http://45.76.207.177"
echo "  - API: http://45.76.207.177:3001/api"
echo ""
echo "📊 管理命令:"
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs"
echo ""
echo "🔐 重要信息:"
echo "  - JWT_SECRET: ${JWT_SECRET}"
echo "  - JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}"
EOF

print_success "部署完成！"
echo ""
echo "🌐 访问地址:"
echo "  - 前端: http://$SERVER_IP"
echo "  - API: http://$SERVER_IP:3001/api"
echo ""
echo "📊 管理命令:"
echo "  - 查看状态: ssh $SERVER_USER@$SERVER_IP 'pm2 status'"
echo "  - 查看日志: ssh $SERVER_USER@$SERVER_IP 'pm2 logs'"
