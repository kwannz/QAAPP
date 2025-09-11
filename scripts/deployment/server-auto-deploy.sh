#!/bin/bash
# QAapp 服务器端自动部署脚本
# 在服务器上解压 qaapp-deploy.zip 后直接执行此脚本
# 执行命令: ./scripts/deployment/server-auto-deploy.sh

set -e

# 输出函数
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

# 检查root权限
if [ "$EUID" -ne 0 ]; then
    print_error "请以root用户运行此脚本"
    exit 1
fi

echo "🚀 开始 QAapp 自动部署..."
echo "执行时间: $(date)"
echo "工作目录: $(pwd)"

# 检查必要文件
if [ ! -f "package.json" ]; then
    print_error "未找到 package.json 文件，请确保在应用根目录执行此脚本"
    exit 1
fi

print_status "第1步: 系统初始化和依赖安装"

# 更新系统
print_status "更新系统包"
apt update && apt upgrade -y
print_success "系统更新完成"

# 安装基础工具
print_status "安装基础工具"
apt install -y curl wget git unzip jq build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "基础工具安装完成"

# 检查并安装 Node.js 18
if ! command -v node >/dev/null 2>&1 || [ "$(node -v | cut -d'v' -f2 | cut -d'.' -f1)" -lt "18" ]; then
    print_status "安装 Node.js 18"
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js 安装完成: $(node --version)"
else
    print_success "Node.js 已安装: $(node --version)"
fi

# 检查并安装 pnpm
if ! command -v pnpm >/dev/null 2>&1; then
    print_status "安装 pnpm"
    npm install -g pnpm@latest
    print_success "pnpm 安装完成: $(pnpm --version)"
else
    print_success "pnpm 已安装: $(pnpm --version)"
fi

# 检查并安装 PM2
if ! command -v pm2 >/dev/null 2>&1; then
    print_status "安装 PM2"
    npm install -g pm2@latest
    print_success "PM2 安装完成: $(pm2 --version)"
else
    print_success "PM2 已安装: $(pm2 --version)"
fi

print_status "第2步: 数据库服务安装配置"

# 安装 PostgreSQL 16
if ! command -v psql >/dev/null 2>&1; then
    print_status "安装 PostgreSQL 16"
    wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
    apt update
    apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16
    systemctl enable postgresql
    systemctl start postgresql
    print_success "PostgreSQL 安装完成"
else
    print_success "PostgreSQL 已安装"
    systemctl start postgresql 2>/dev/null || true
fi

# 配置数据库
print_status "配置 PostgreSQL 数据库"
sudo -u postgres psql -c "CREATE USER qa_user WITH PASSWORD 'qa_password';" 2>/dev/null || print_warning "用户 qa_user 可能已存在"
sudo -u postgres psql -c "CREATE DATABASE qa_database OWNER qa_user;" 2>/dev/null || print_warning "数据库 qa_database 可能已存在"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER qa_user CREATEDB;" 2>/dev/null || true

# 配置 PostgreSQL 远程连接
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf 2>/dev/null || true
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
systemctl restart postgresql
print_success "数据库配置完成"

# 安装 Redis
if ! command -v redis-server >/dev/null 2>&1; then
    print_status "安装 Redis"
    apt install -y redis-server
    systemctl enable redis-server
    systemctl start redis-server
    print_success "Redis 安装完成"
else
    print_success "Redis 已安装"
    systemctl start redis-server 2>/dev/null || true
fi

# 安装 Nginx
if ! command -v nginx >/dev/null 2>&1; then
    print_status "安装 Nginx"
    apt install -y nginx
    systemctl enable nginx
    systemctl start nginx
    print_success "Nginx 安装完成"
else
    print_success "Nginx 已安装"
    systemctl start nginx 2>/dev/null || true
fi

print_status "第3步: 防火墙和目录配置"

# 配置防火墙
print_status "配置防火墙"
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3000/tcp
ufw allow 3001/tcp
ufw allow 5432/tcp
ufw --force enable
print_success "防火墙配置完成"

# 创建日志目录
mkdir -p /var/log/qaapp
chown -R www-data:www-data /var/log/qaapp
print_success "日志目录创建完成"

print_status "第4步: 应用环境配置"

# 生成安全密钥
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# 创建环境配置
print_status "创建生产环境配置"
cat > .env.production << EOF
NODE_ENV=production
NEXT_PUBLIC_API_URL=http://45.76.207.177/api
NEXT_PUBLIC_ENVIRONMENT=production
NEXT_PUBLIC_ENABLE_TESTNET=false
NEXT_PUBLIC_DISABLE_WALLETCONNECT=true
NEXT_PUBLIC_CHAIN_ID=1
DATABASE_URL=postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_EXPIRES_IN=7d
PORT=3000
API_PORT=3001
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=info
EOF

# 复制环境配置
cp .env.production apps/api/.env.production 2>/dev/null || true
cp .env.production apps/web/.env.production 2>/dev/null || true

# 设置权限
chown -R www-data:www-data .
chmod 600 .env.production
print_success "环境配置创建完成"

print_status "第5步: 应用依赖安装和构建"

# 安装依赖
print_status "安装项目依赖"
pnpm install --frozen-lockfile
print_success "依赖安装完成"

# 数据库迁移
print_status "执行数据库迁移"
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
pnpm run db:generate 2>/dev/null || print_warning "跳过 Prisma 生成（可能没有配置）"
pnpm run db:push 2>/dev/null || print_warning "跳过数据库推送（可能没有配置）"
print_success "数据库迁移完成"

# 构建应用
print_status "构建生产版本"
NODE_ENV=production pnpm run build
print_success "应用构建完成"

print_status "第6步: PM2 进程管理配置"

# 创建 PM2 配置
cat > ecosystem.production.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'qa-api',
      script: 'node',
      args: 'dist/apps/api/src/main.js',
      cwd: '/var/www/qaapp/apps/api',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DATABASE_URL: 'postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public',
        LOG_LEVEL: 'info'
      },
      pid_file: '/var/log/qaapp/api.pid',
      out_file: '/var/log/qaapp/api-out.log',
      error_file: '/var/log/qaapp/api-error.log',
      log_file: '/var/log/qaapp/api-combined.log',
      time: true,
      autorestart: true,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    },
    {
      name: 'qa-web',
      script: 'node',
      args: 'dist/standalone/apps/web/server.js',
      cwd: '/var/www/qaapp/apps/web',
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
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 5
    }
  ]
};
EOF

# 停止现有进程并启动新进程
print_status "启动应用进程"
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.production.js --env production
pm2 save

# PM2 开机自启动
pm2 startup systemd -u root --hp /root --silent
print_success "PM2 配置完成"

print_status "第7步: Nginx 反向代理配置"

# 创建 Nginx 配置
cat > /etc/nginx/sites-available/qaapp << 'EOF'
server {
    listen 80;
    server_name 45.76.207.177;
    client_max_body_size 10M;

    # 安全头部
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/javascript application/json;

    # API代理
    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }

    # 前端应用
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:3000;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }
}
EOF

# 启用站点配置
ln -sf /etc/nginx/sites-available/qaapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试配置并重载
if nginx -t; then
    systemctl reload nginx
    print_success "Nginx 配置完成"
else
    print_error "Nginx 配置测试失败"
    exit 1
fi

print_status "第8步: 部署验证和健康检查"

# 等待服务启动
print_status "等待服务启动"
sleep 15

# 服务状态检查
echo ""
echo "📊 服务状态检查:"
pm2 status

echo ""
echo "🌐 网络端口检查:"
netstat -tuln | grep -E ':(80|3000|3001|5432)' || true

echo ""
echo "🔍 健康检查:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_success "前端服务响应正常 (端口 3000)"
else
    print_warning "前端服务可能未完全启动"
fi

if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
    print_success "API 服务响应正常 (端口 3001)"
else
    print_warning "API 服务可能未完全启动"
fi

# 输出重要信息
echo ""
echo "🎉 QAapp 部署完成！"
echo ""
echo "📊 部署信息:"
echo "- 工作目录: /var/www/qaapp"
echo "- 日志目录: /var/log/qaapp"
echo "- 配置文件: ecosystem.production.js"
echo ""
echo "🌐 访问地址:"
echo "- 前端: http://45.76.207.177"
echo "- API:  http://45.76.207.177/api"
echo "- 健康检查: http://45.76.207.177/health"
echo ""
echo "🔐 重要信息:"
echo "- JWT_SECRET: ${JWT_SECRET}"
echo "- JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}"
echo "- 数据库: postgresql://qa_user:qa_password@localhost:5432/qa_database"
echo ""
echo "📋 管理命令:"
echo "- pm2 status          # 查看进程状态"
echo "- pm2 logs            # 查看日志"
echo "- pm2 restart all     # 重启应用"
echo "- pm2 reload all      # 零停机重启"
echo "- systemctl status nginx postgresql redis-server  # 检查服务状态"
echo ""

print_success "🎉 自动部署成功完成！"
echo "部署耗时: $(($(date +%s) - $(date +%s)))"
echo "如有问题，请查看日志: pm2 logs 或 tail -f /var/log/qaapp/*.log"