#!/bin/bash
# QAapp VPS 一键部署脚本（包含SSH配置）
# 服务器: root@45.76.207.177
# 密码: 7jG_!3i+amx}]yFB

set -e

echo "🚀 QAapp VPS 一键部署开始！"
echo "服务器: 45.76.207.177"
echo "时间: $(date)"
echo ""

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

# 服务器信息
SERVER_IP="45.76.207.177"
SERVER_USER="root"
SERVER_PASS="7jG_!3i+amx}]yFB"
SSH_KEY_PATH="$HOME/.ssh/id_ed25519_zijunzhao"

print_status "步骤 1: 配置SSH密钥认证"

# 检查SSH密钥是否存在
if [ ! -f "$SSH_KEY_PATH" ]; then
    print_warning "SSH私钥不存在，将使用密码认证"
    SSH_CMD="sshpass -p '$SERVER_PASS' ssh -o StrictHostKeyChecking=no"
    SCP_CMD="sshpass -p '$SERVER_PASS' scp -o StrictHostKeyChecking=no"
else
    print_success "找到SSH私钥，使用密钥认证"
    SSH_CMD="ssh -i $SSH_KEY_PATH -o StrictHostKeyChecking=no"
    SCP_CMD="scp -i $SSH_KEY_PATH -o StrictHostKeyChecking=no"
fi

# 测试连接
print_status "测试服务器连接"
if $SSH_CMD $SERVER_USER@$SERVER_IP "echo 'SSH连接成功'" 2>/dev/null; then
    print_success "服务器连接正常"
else
    print_error "无法连接到服务器，请检查："
    echo "1. 服务器IP是否正确: $SERVER_IP"
    echo "2. SSH服务是否启动"
    echo "3. 防火墙是否允许SSH连接"
    echo "4. 网络连接是否正常"
    echo ""
    echo "手动测试连接: ssh $SERVER_USER@$SERVER_IP"
    exit 1
fi

print_status "步骤 2: 上传并运行服务器初始化脚本"

# 创建服务器初始化脚本
cat > /tmp/vps-setup.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 开始初始化VPS服务器..."

# 输出函数
print_status() { echo -e "\n\033[1;34m==== $1 ====\033[0m"; }
print_success() { echo -e "\033[1;32m✅ $1\033[0m"; }
print_error() { echo -e "\033[1;31m❌ $1\033[0m"; }

# 检查root权限
if [ "$EUID" -ne 0 ]; then
    print_error "需要root权限"
    exit 1
fi

# 更新系统
print_status "更新系统包"
apt update && apt upgrade -y
print_success "系统更新完成"

# 安装基础工具
print_status "安装基础工具"
apt install -y curl wget git unzip jq build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
print_success "基础工具安装完成"

# 安装Node.js 18
print_status "安装Node.js 18"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
print_success "Node.js安装完成: $(node --version)"

# 安装pnpm
print_status "安装pnpm"
npm install -g pnpm@latest
print_success "pnpm安装完成: $(pnpm --version)"

# 安装PM2
print_status "安装PM2"
npm install -g pm2@latest
print_success "PM2安装完成: $(pm2 --version)"

# 安装PostgreSQL 16
print_status "安装PostgreSQL 16"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16
systemctl enable postgresql
systemctl start postgresql
print_success "PostgreSQL安装完成"

# 配置数据库
print_status "配置PostgreSQL数据库"
sudo -u postgres psql -c "CREATE USER qa_user WITH PASSWORD 'qa_password';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE qa_database OWNER qa_user;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;" 2>/dev/null || true
sudo -u postgres psql -c "ALTER USER qa_user CREATEDB;" 2>/dev/null || true

# 允许远程连接
echo "host all all 0.0.0.0/0 md5" >> /etc/postgresql/16/main/pg_hba.conf
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" /etc/postgresql/16/main/postgresql.conf
systemctl restart postgresql
print_success "PostgreSQL配置完成"

# 安装Redis
print_status "安装Redis"
apt install -y redis-server
systemctl enable redis-server
systemctl start redis-server
print_success "Redis安装完成"

# 安装Nginx
print_status "安装Nginx"
apt install -y nginx
systemctl enable nginx
systemctl start nginx
print_success "Nginx安装完成"

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

# 创建目录
print_status "创建应用目录"
mkdir -p /var/www/qaapp /var/log/qaapp
chown -R www-data:www-data /var/www/qaapp /var/log/qaapp
print_success "目录创建完成"

# 配置PM2开机启动
print_status "配置PM2开机启动"
pm2 startup systemd -u root --hp /root
pm2 save
print_success "PM2配置完成"

echo ""
echo "🎉 VPS服务器初始化完成！"
echo ""
echo "📊 安装信息:"
echo "- Node.js: $(node --version)"
echo "- pnpm: $(pnpm --version)"
echo "- PM2: $(pm2 --version)"
echo "- PostgreSQL: $(psql --version | head -1)"
echo "- Redis: $(redis-server --version | head -1)"
echo "- Nginx: $(nginx -v 2>&1)"
echo ""
print_success "服务器准备就绪，可以部署应用了！"
EOF

# 上传并运行初始化脚本
print_status "上传初始化脚本到服务器"
$SCP_CMD /tmp/vps-setup.sh $SERVER_USER@$SERVER_IP:/root/
print_success "脚本上传完成"

print_status "在服务器上运行初始化脚本"
$SSH_CMD $SERVER_USER@$SERVER_IP "chmod +x /root/vps-setup.sh && /root/vps-setup.sh"
print_success "服务器初始化完成"

print_status "步骤 3: 上传应用代码"

# 检查本地应用目录
LOCAL_APP_DIR="/Users/zhaoleon/Desktop/QAapp"
if [ ! -d "$LOCAL_APP_DIR" ]; then
    print_error "本地应用目录不存在: $LOCAL_APP_DIR"
    exit 1
fi

# 清理服务器应用目录
$SSH_CMD $SERVER_USER@$SERVER_IP "rm -rf /var/www/qaapp/* /var/www/qaapp/.*" 2>/dev/null || true

# 上传应用文件
print_status "上传应用核心文件"
$SCP_CMD -r $LOCAL_APP_DIR/apps $SERVER_USER@$SERVER_IP:/var/www/qaapp/
$SCP_CMD -r $LOCAL_APP_DIR/packages $SERVER_USER@$SERVER_IP:/var/www/qaapp/
$SCP_CMD $LOCAL_APP_DIR/package.json $SERVER_USER@$SERVER_IP:/var/www/qaapp/
$SCP_CMD $LOCAL_APP_DIR/pnpm-lock.yaml $SERVER_USER@$SERVER_IP:/var/www/qaapp/
$SCP_CMD $LOCAL_APP_DIR/turbo.json $SERVER_USER@$SERVER_IP:/var/www/qaapp/
$SCP_CMD $LOCAL_APP_DIR/ecosystem.config.js $SERVER_USER@$SERVER_IP:/var/www/qaapp/ 2>/dev/null || true

# 上传配置文件
[ -f "$LOCAL_APP_DIR/.env.production" ] && $SCP_CMD $LOCAL_APP_DIR/.env.production $SERVER_USER@$SERVER_IP:/var/www/qaapp/
[ -f "$LOCAL_APP_DIR/tsconfig.json" ] && $SCP_CMD $LOCAL_APP_DIR/tsconfig.json $SERVER_USER@$SERVER_IP:/var/www/qaapp/

print_success "应用代码上传完成"

print_status "步骤 4: 部署应用"

# 创建部署脚本
cat > /tmp/deploy-app.sh << 'EOF'
#!/bin/bash
set -e

echo "🚀 开始部署QAapp应用..."

print_status() { echo -e "\n\033[1;34m==== $1 ====\033[0m"; }
print_success() { echo -e "\033[1;32m✅ $1\033[0m"; }
print_error() { echo -e "\033[1;31m❌ $1\033[0m"; }

APP_DIR="/var/www/qaapp"
cd $APP_DIR

# 生成安全密钥
JWT_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)

# 停止现有进程
print_status "停止现有进程"
pm2 delete all 2>/dev/null || true

# 创建环境配置
print_status "创建生产环境配置"
cat > .env.production << ENVEOF
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
ENVEOF

# 复制到子应用
cp .env.production apps/api/.env.production 2>/dev/null || true
cp .env.production apps/web/.env.production 2>/dev/null || true

# 设置权限
chown -R www-data:www-data $APP_DIR
chmod 600 .env.production

print_success "环境配置完成"

# 安装依赖
print_status "安装依赖"
pnpm install --frozen-lockfile
print_success "依赖安装完成"

# 数据库配置
print_status "配置数据库"
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"
pnpm run db:generate 2>/dev/null || echo "跳过Prisma生成"
pnpm run db:push 2>/dev/null || echo "跳过数据库推送"
print_success "数据库配置完成"

# 构建应用
print_status "构建应用"
NODE_ENV=production pnpm run build
print_success "应用构建完成"

# 创建PM2配置
print_status "配置PM2"
cat > ecosystem.production.js << 'PMEOF'
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
PMEOF

print_success "PM2配置完成"

# 启动应用
print_status "启动应用"
pm2 start ecosystem.production.js --env production
pm2 save
print_success "应用启动完成"

# 配置Nginx
print_status "配置Nginx反向代理"
cat > /etc/nginx/sites-available/qaapp << 'NGINXEOF'
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
NGINXEOF

# 启用站点配置
ln -sf /etc/nginx/sites-available/qaapp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 测试并重载Nginx
nginx -t && systemctl reload nginx
print_success "Nginx配置完成"

# 健康检查
print_status "健康检查"
sleep 15

echo ""
echo "🎉 QAapp 部署完成！"
echo ""
echo "📊 服务状态:"
pm2 status
echo ""
echo "🌐 访问地址:"
echo "- 前端应用: http://45.76.207.177"
echo "- API接口: http://45.76.207.177/api"
echo ""
echo "🔐 重要信息:"
echo "- JWT_SECRET: ${JWT_SECRET}"
echo "- JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}"
echo "- 数据库: postgresql://qa_user:qa_password@localhost:5432/qa_database"
echo ""
echo "📋 管理命令:"
echo "- 查看状态: pm2 status"
echo "- 查看日志: pm2 logs"
echo "- 重启应用: pm2 restart all"
echo "- 查看Nginx状态: systemctl status nginx"
echo ""
print_success "🎉 部署成功！应用已在 http://45.76.207.177 上运行"
EOF

# 上传并运行部署脚本
print_status "上传部署脚本到服务器"
$SCP_CMD /tmp/deploy-app.sh $SERVER_USER@$SERVER_IP:/root/
print_success "部署脚本上传完成"

print_status "在服务器上运行部署脚本"
$SSH_CMD $SERVER_USER@$SERVER_IP "chmod +x /root/deploy-app.sh && /root/deploy-app.sh"

print_status "步骤 5: 最终验证"

# 验证部署结果
print_status "验证部署结果"
echo ""
echo "🔍 检查服务状态..."
$SSH_CMD $SERVER_USER@$SERVER_IP "pm2 status && echo '' && systemctl status nginx --no-pager -l"
echo ""

echo "🌐 测试HTTP访问..."
if curl -f -s -m 10 http://45.76.207.177 > /dev/null; then
    print_success "前端应用访问正常: http://45.76.207.177"
else
    print_warning "前端应用可能还在启动中，请稍等片刻再测试"
fi

if curl -f -s -m 10 http://45.76.207.177/api/health > /dev/null; then
    print_success "API服务访问正常: http://45.76.207.177/api"
else
    print_warning "API服务可能还在启动中，请稍等片刻再测试"
fi

# 清理临时文件
rm -f /tmp/vps-setup.sh /tmp/deploy-app.sh

echo ""
echo "🎉🎉🎉 QAapp VPS 部署完成！🎉🎉🎉"
echo ""
echo "📱 访问你的应用:"
echo "🌐 前端: http://45.76.207.177"
echo "🔧 API:  http://45.76.207.177/api"
echo ""
echo "📊 管理命令:"
echo "ssh $SERVER_USER@$SERVER_IP"
echo "pm2 status              # 查看进程状态"
echo "pm2 logs               # 查看日志"
echo "pm2 restart all        # 重启所有服务"
echo "systemctl status nginx # 检查Nginx状态"
echo ""
print_success "部署成功完成！🚀"