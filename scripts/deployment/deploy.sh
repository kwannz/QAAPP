#!/bin/bash
# QAapp 应用部署脚本
# 首次部署到 VPS 服务器: 45.76.207.177

set -e  # 遇到错误时退出

# 配置变量
SERVER_IP="45.76.207.177"
APP_DIR="/var/www/qaapp"
REPO_URL="https://github.com/your-username/qaapp.git"  # 请替换为实际的仓库地址
APP_NAME="qaapp"
NODE_ENV="production"

echo "🚀 开始部署 QAapp 到生产服务器..."
echo "服务器: $SERVER_IP"
echo "应用目录: $APP_DIR" 
echo "时间: $(date)"

# 颜色输出函数
print_status() {
    echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️ $1\033[0m"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    print_error "请以 root 用户身份运行此脚本"
    exit 1
fi

# 检查必要的服务是否运行
print_status "检查系统服务状态"
services=("postgresql" "redis-server" "nginx")
for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        print_success "$service 服务正在运行"
    else
        print_error "$service 服务未运行，请先运行 setup-vps.sh"
        exit 1
    fi
done

# 生成随机密钥
generate_secret() {
    openssl rand -hex 32
}

JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)

print_success "生成安全密钥完成"

# 停止现有的 PM2 进程
print_status "停止现有应用进程"
pm2 delete all 2>/dev/null || true
pm2 kill 2>/dev/null || true
print_success "现有进程已停止"

# 清理应用目录
print_status "准备应用目录"
rm -rf $APP_DIR
mkdir -p $APP_DIR
cd $APP_DIR

# 如果是本地部署，复制文件而不是克隆
if [ -d "/Users/zhaoleon/Desktop/QAapp" ]; then
    print_status "从本地复制应用文件"
    cp -r /Users/zhaoleon/Desktop/QAapp/* $APP_DIR/
    print_success "应用文件复制完成"
else
    # 克隆代码仓库
    print_status "克隆代码仓库"
    git clone $REPO_URL .
    print_success "代码仓库克隆完成"
fi

# 创建生产环境配置
print_status "创建生产环境配置"
cat > $APP_DIR/.env.production << EOF
# QA App 生产环境配置
# =================================
# API配置 - 生产服务器
# =================================
NEXT_PUBLIC_API_URL=http://${SERVER_IP}:3001/api

# =================================
# Web3配置 - 生产环境
# =================================
# 禁用测试网络支持
NEXT_PUBLIC_ENABLE_TESTNET=false

# 禁用 WalletConnect (避免 403 错误)
NEXT_PUBLIC_DISABLE_WALLETCONNECT=true

# 主网链配置
NEXT_PUBLIC_CHAIN_ID=1

# 生产 RPC 端点
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/your-api-key
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

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

# PM2 配置
PM2_INSTANCES=1
PM2_MAX_MEMORY=1G
EOF

print_success "生产环境配置创建完成"

# 复制到各个应用目录
cp $APP_DIR/.env.production $APP_DIR/apps/api/.env.production
cp $APP_DIR/.env.production $APP_DIR/apps/web/.env.production

# 设置文件权限
chown -R www-data:www-data $APP_DIR
chmod 600 $APP_DIR/.env.production

# 安装依赖
print_status "安装应用依赖"
cd $APP_DIR
pnpm install --frozen-lockfile
print_success "依赖安装完成"

# 生成数据库
print_status "配置数据库"
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
pnpm run db:generate
pnpm run db:push
print_success "数据库配置完成"

# 构建应用
print_status "构建应用"
NODE_ENV=production pnpm run build
print_success "应用构建完成"

# 创建生产环境 PM2 配置
print_status "创建 PM2 配置"
cat > $APP_DIR/ecosystem.production.js << 'EOF'
const DB_URL = process.env.DATABASE_URL || 'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public'

// 验证数据库 URL
if (!DB_URL.startsWith('postgresql://')) {
  console.error('❌ DATABASE_URL 必须是 PostgreSQL 连接字符串');
  process.exit(1);
}

module.exports = {
  apps: [
    {
      name: 'qa-api',
      script: 'node',
      args: 'dist/apps/api/src/main.js',
      cwd: './apps/api',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: DB_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        LOG_LEVEL: 'info',
        ENABLE_METRICS: 'true'
      },
      pid_file: '/var/log/qaapp/api.pid',
      out_file: '/var/log/qaapp/api-out.log',
      error_file: '/var/log/qaapp/api-error.log',
      log_file: '/var/log/qaapp/api-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    },
    {
      name: 'qa-web',
      script: 'node',
      args: 'dist/standalone/apps/web/server.js',
      cwd: './apps/web',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_URL: 'http://localhost:3001',
        LOG_LEVEL: 'info',
        NEXT_PUBLIC_LOG_LEVEL: 'info'
      },
      pid_file: '/var/log/qaapp/web.pid',
      out_file: '/var/log/qaapp/web-out.log',
      error_file: '/var/log/qaapp/web-error.log',
      log_file: '/var/log/qaapp/web-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    }
  ]
};
EOF

print_success "PM2 配置创建完成"

# 启动应用
print_status "启动应用服务"
cd $APP_DIR
pm2 start ecosystem.production.js --env production
pm2 save
print_success "应用启动完成"

# 配置 Nginx
print_status "配置 Nginx"
cat > /etc/nginx/sites-available/qaapp << EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # API 代理
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # WebSocket 支持
    location /socket.io/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    # 前端应用
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF

# 启用站点
ln -sf /etc/nginx/sites-available/qaapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重启 Nginx
nginx -t
systemctl reload nginx
print_success "Nginx 配置完成"

# 配置日志轮转
print_status "配置日志轮转"
cat > /etc/logrotate.d/qaapp << EOF
/var/log/qaapp/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
print_success "日志轮转配置完成"

# 健康检查
print_status "运行健康检查"
sleep 10

# 检查 PM2 进程状态
pm2_status=$(pm2 jlist | jq -r '.[].pm2_env.status' 2>/dev/null || echo "error")
if [[ "$pm2_status" == *"online"* ]]; then
    print_success "PM2 进程状态正常"
else
    print_warning "PM2 进程可能存在问题，请检查日志"
fi

# 检查端口
ports=(3000 3001)
for port in "${ports[@]}"; do
    if netstat -tuln | grep ":$port " > /dev/null; then
        print_success "端口 $port 正在监听"
    else
        print_error "端口 $port 未监听"
    fi
done

# 检查 HTTP 响应
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "前端应用响应正常"
else
    print_warning "前端应用可能未完全启动，请稍等片刻"
fi

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "API 应用响应正常"
else
    print_warning "API 应用可能未完全启动，请检查日志"
fi

# 显示部署信息
print_status "部署完成信息"
echo "🎉 QAapp 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "  - 前端: http://$SERVER_IP"
echo "  - API: http://$SERVER_IP/api"
echo ""
echo "📊 PM2 进程管理:"
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs"
echo "  - 重启应用: pm2 restart all"
echo ""
echo "📁 重要目录:"
echo "  - 应用目录: $APP_DIR"
echo "  - 日志目录: /var/log/qaapp"
echo "  - Nginx 配置: /etc/nginx/sites-available/qaapp"
echo ""
echo "🔐 安全信息:"
echo "  - JWT_SECRET: ${JWT_SECRET}"
echo "  - JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}"
echo ""
echo "🔧 下一步操作:"
echo "  1. 配置域名解析到 $SERVER_IP"
echo "  2. 运行 SSL 证书安装: certbot --nginx -d yourdomain.com"
echo "  3. 更新 RPC 端点配置"
echo "  4. 运行完整的健康检查"
echo ""
print_success "部署成功！应用现在可以通过 http://$SERVER_IP 访问"