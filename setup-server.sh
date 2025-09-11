#!/bin/bash
# QAapp 服务器初始化脚本
set -e

echo "🚀 开始初始化 QAapp 服务器..."
echo "服务器: 45.76.207.177"
echo "时间: $(date)"

print_status() {
    echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    print_error "请以 root 用户身份运行此脚本"
    exit 1
fi

# 更新系统
print_status "更新系统包"
apt update && apt upgrade -y
print_success "系统更新完成"

# 安装基本工具
print_status "安装基本工具"
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release build-essential
print_success "基本工具安装完成"

# 安装 Node.js 18.x
print_status "安装 Node.js 18.x"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node_version=$(node --version)
npm_version=$(npm --version)
print_success "Node.js 安装完成: $node_version, npm: $npm_version"

# 安装 pnpm
print_status "安装 pnpm"
npm install -g pnpm@latest
pnpm_version=$(pnpm --version)
print_success "pnpm 安装完成: $pnpm_version"

# 安装 PM2
print_status "安装 PM2"
npm install -g pm2@latest
pm2_version=$(pm2 --version)
print_success "PM2 安装完成: $pm2_version"

# 安装 PostgreSQL 16
print_status "安装 PostgreSQL 16"
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
echo "deb http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list
apt update
apt install -y postgresql-16 postgresql-client-16 postgresql-contrib-16
systemctl start postgresql
systemctl enable postgresql
print_success "PostgreSQL 16 安装完成"

# 配置 PostgreSQL
print_status "配置 PostgreSQL"
sudo -u postgres psql -c "CREATE USER qa_user WITH PASSWORD 'qa_password';" 2>/dev/null || echo "用户已存在"
sudo -u postgres psql -c "CREATE DATABASE qa_database OWNER qa_user;" 2>/dev/null || echo "数据库已存在"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;"
sudo -u postgres psql -c "ALTER USER qa_user CREATEDB;"

# 配置 PostgreSQL 允许远程连接
pg_hba_conf="/etc/postgresql/16/main/pg_hba.conf"
postgresql_conf="/etc/postgresql/16/main/postgresql.conf"

# 备份原配置文件
cp $pg_hba_conf $pg_hba_conf.backup
cp $postgresql_conf $postgresql_conf.backup

# 修改 PostgreSQL 配置
echo "host    all             all             0.0.0.0/0               md5" >> $pg_hba_conf
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/g" $postgresql_conf

systemctl restart postgresql
print_success "PostgreSQL 配置完成"

# 安装 Redis
print_status "安装 Redis"
apt install -y redis-server
systemctl start redis-server
systemctl enable redis-server
print_success "Redis 安装完成"

# 安装 Nginx
print_status "安装 Nginx"
apt install -y nginx
systemctl start nginx
systemctl enable nginx
print_success "Nginx 安装完成"

# 配置防火墙
print_status "配置防火墙"
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP
ufw allow 443/tcp     # HTTPS
ufw allow 3000/tcp    # Web App
ufw allow 3001/tcp    # API
ufw allow 5432/tcp    # PostgreSQL
ufw --force enable
print_success "防火墙配置完成"

# 创建应用目录
print_status "创建应用目录"
mkdir -p /var/www/qaapp
mkdir -p /var/log/qaapp
mkdir -p /var/www/qaapp/uploads
chown -R www-data:www-data /var/www/qaapp
chown -R www-data:www-data /var/log/qaapp
print_success "应用目录创建完成"

# 配置 PM2 开机启动
print_status "配置 PM2 开机启动"
pm2 startup
pm2 save
print_success "PM2 开机启动配置完成"

# 安装 jq (用于 JSON 处理)
apt install -y jq

echo "🎉 VPS 服务器初始化完成！"
echo ""
echo "📋 安装的组件版本:"
echo "  - Node.js: $(node --version)"
echo "  - pnpm: $(pnpm --version)" 
echo "  - PM2: $(pm2 --version)"
echo "  - PostgreSQL: $(psql --version | head -n1)"
echo "  - Redis: $(redis-server --version)"
echo "  - Nginx: $(nginx -v 2>&1)"
print_success "服务器已准备就绪，可以开始部署应用！"
