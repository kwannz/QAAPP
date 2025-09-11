# QAapp VPS 部署指南

> 🚀 将 QAapp 部署到 VPS 服务器 `45.76.207.177` 的完整指南

## 📋 目录结构

```
scripts/deployment/
├── setup-vps.sh              # 服务器初始化脚本
├── deploy.sh                 # 首次部署脚本
├── update.sh                 # 应用更新脚本
├── nginx.conf                # Nginx 配置文件
├── ecosystem.production.js   # PM2 生产配置
└── README.md                 # 本文档
```

## 🛠️ 部署步骤

### 第一步：服务器初始化

连接到服务器并运行初始化脚本：

```bash
# 连接到服务器
ssh root@45.76.207.177

# 上传初始化脚本
scp setup-vps.sh root@45.76.207.177:/root/

# 运行初始化脚本
chmod +x setup-vps.sh
./setup-vps.sh
```

**初始化脚本将安装：**
- Node.js 18.x 和 pnpm
- PostgreSQL 16
- Redis
- PM2 和 Nginx
- 配置防火墙和系统优化

### 第二步：部署应用

```bash
# 上传部署脚本
scp deploy.sh root@45.76.207.177:/root/

# 运行部署脚本
chmod +x deploy.sh
./deploy.sh
```

**部署脚本将完成：**
- 应用代码部署
- 依赖安装
- 数据库配置
- 应用构建
- PM2 进程启动
- Nginx 配置

### 第三步：验证部署

访问应用：
- **前端**: http://45.76.207.177
- **API**: http://45.76.207.177/api

检查服务状态：
```bash
pm2 status
pm2 logs
nginx -t
systemctl status nginx postgresql redis-server
```

## 🔄 应用更新

使用更新脚本进行零停机更新：

```bash
# 上传更新脚本
scp update.sh root@45.76.207.177:/root/

# 运行更新
chmod +x update.sh
./update.sh
```

**更新功能：**
- 自动备份当前版本
- 零停机滚动更新
- 健康检查验证
- 失败自动回滚

## 🗄️ 数据库配置

### PostgreSQL 信息
- **主机**: localhost
- **端口**: 5432
- **数据库**: qa_database
- **用户名**: qa_user
- **密码**: qa_password

### 连接字符串
```
postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public
```

### 数据库管理
```bash
# 连接数据库
sudo -u postgres psql -d qa_database

# 备份数据库
pg_dump -h localhost -U qa_user -d qa_database > backup.sql

# 恢复数据库
psql -h localhost -U qa_user -d qa_database < backup.sql
```

## ⚙️ 服务管理

### PM2 进程管理

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs
pm2 logs qa-api
pm2 logs qa-web

# 重启服务
pm2 restart qa-api
pm2 restart qa-web
pm2 restart all

# 停止服务
pm2 stop qa-api
pm2 stop qa-web
pm2 stop all

# 删除服务
pm2 delete qa-api
pm2 delete qa-web
pm2 delete all

# 保存配置
pm2 save

# 监控
pm2 monit
```

### Nginx 管理

```bash
# 测试配置
nginx -t

# 重启 Nginx
systemctl reload nginx
systemctl restart nginx

# 查看状态
systemctl status nginx

# 查看访问日志
tail -f /var/log/nginx/qaapp_access.log

# 查看错误日志
tail -f /var/log/nginx/qaapp_error.log
```

### 系统服务状态

```bash
# 查看所有相关服务
systemctl status postgresql redis-server nginx

# 重启服务
systemctl restart postgresql
systemctl restart redis-server
systemctl restart nginx
```

## 📁 重要目录

| 目录 | 用途 | 说明 |
|------|------|------|
| `/var/www/qaapp` | 应用根目录 | 包含所有应用文件 |
| `/var/log/qaapp` | 应用日志 | PM2 进程日志 |
| `/var/log/nginx` | Nginx 日志 | 访问和错误日志 |
| `/etc/nginx/sites-available/qaapp` | Nginx 配置 | 站点配置文件 |
| `/etc/postgresql/16/main` | PostgreSQL 配置 | 数据库配置文件 |

## 🔐 安全配置

### JWT 密钥配置

生产环境必须设置安全的 JWT 密钥：

```bash
# 生成安全密钥
openssl rand -hex 32

# 设置环境变量
export JWT_SECRET="your-generated-secret"
export JWT_REFRESH_SECRET="your-generated-refresh-secret"
```

### 防火墙规则

```bash
# 查看防火墙状态
ufw status

# 允许的端口
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw allow 3000/tcp  # Web App
ufw allow 3001/tcp  # API
ufw allow 5432/tcp  # PostgreSQL
```

### SSL 证书配置

使用 Let's Encrypt 配置 HTTPS：

```bash
# 安装 SSL 证书
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run

# 查看证书状态
certbot certificates
```

## 📊 监控和日志

### 日志文件位置

```bash
# PM2 日志
/var/log/qaapp/api-combined.log
/var/log/qaapp/web-combined.log

# Nginx 日志
/var/log/nginx/qaapp_access.log
/var/log/nginx/qaapp_error.log

# 系统日志
/var/log/syslog
/var/log/postgresql/postgresql-16-main.log
```

### 日志查看命令

```bash
# 实时查看 PM2 日志
pm2 logs --lines 100

# 查看 Nginx 访问日志
tail -f /var/log/nginx/qaapp_access.log

# 查看系统日志
journalctl -f -u nginx
journalctl -f -u postgresql
```

### 性能监控

```bash
# 系统资源监控
htop
free -h
df -h

# 网络连接
netstat -tuln
ss -tuln

# PM2 监控
pm2 monit

# 数据库连接
sudo -u postgres psql -c "SELECT * FROM pg_stat_activity;"
```

## 🚨 故障排除

### 常见问题

#### 1. 应用无法启动

```bash
# 检查 PM2 进程
pm2 status
pm2 logs --lines 50

# 检查端口占用
netstat -tuln | grep :3000
netstat -tuln | grep :3001

# 检查数据库连接
psql -h localhost -U qa_user -d qa_database -c "SELECT 1;"
```

#### 2. Nginx 502 错误

```bash
# 检查上游服务
curl http://localhost:3000
curl http://localhost:3001/health

# 检查 Nginx 配置
nginx -t

# 查看 Nginx 错误日志
tail -f /var/log/nginx/qaapp_error.log
```

#### 3. 数据库连接失败

```bash
# 检查 PostgreSQL 状态
systemctl status postgresql

# 检查数据库连接
sudo -u postgres psql -l

# 检查连接配置
cat /etc/postgresql/16/main/postgresql.conf | grep listen_addresses
cat /etc/postgresql/16/main/pg_hba.conf
```

#### 4. 内存不足

```bash
# 检查内存使用
free -h

# 调整 PM2 内存限制
pm2 restart qa-api --max-memory-restart 2G
pm2 restart qa-web --max-memory-restart 2G

# 添加交换文件
dd if=/dev/zero of=/swapfile bs=1024 count=2097152
mkswap /swapfile
swapon /swapfile
```

### 应急恢复

#### 完全重启

```bash
# 停止所有服务
pm2 delete all
systemctl stop nginx postgresql redis-server

# 重启系统服务
systemctl start postgresql redis-server nginx

# 重新部署应用
cd /var/www/qaapp
pm2 start ecosystem.production.js --env production
```

#### 回滚到备份

```bash
# 查看可用备份
ls -la /var/www/qaapp-backup-*

# 停止当前应用
pm2 delete all

# 恢复备份
rm -rf /var/www/qaapp
mv /var/www/qaapp-backup-YYYYMMDD-HHMMSS /var/www/qaapp

# 重启应用
cd /var/www/qaapp
pm2 start ecosystem.production.js --env production
```

## 🔧 高级配置

### 环境变量配置

创建 `/var/www/qaapp/.env.production` 文件：

```env
# 数据库配置
DATABASE_URL=postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public

# JWT 配置
JWT_SECRET=your-super-secure-jwt-secret
JWT_REFRESH_SECRET=your-super-secure-refresh-secret

# Web3 配置
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.alchemyapi.io/v2/YOUR_API_KEY
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com

# 其他配置...
```

### 性能优化

#### 数据库优化

编辑 `/etc/postgresql/16/main/postgresql.conf`：

```ini
# 内存配置
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB

# 连接配置
max_connections = 100
```

#### Nginx 优化

编辑 `/etc/nginx/nginx.conf`：

```nginx
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
client_max_body_size 10M;
gzip on;
gzip_comp_level 6;
```

## 📞 技术支持

如果遇到问题，请检查：

1. **日志文件**: 查看详细错误信息
2. **服务状态**: 确保所有服务正常运行
3. **网络连接**: 检查端口是否正确开放
4. **资源使用**: 确保有足够的内存和磁盘空间

### 有用的命令

```bash
# 一键状态检查
echo "=== PM2 状态 ===" && pm2 status && \
echo "=== 系统服务 ===" && systemctl status nginx postgresql redis-server && \
echo "=== 端口监听 ===" && netstat -tuln | grep -E ':(80|3000|3001|5432|6379) ' && \
echo "=== 磁盘空间 ===" && df -h && \
echo "=== 内存使用 ===" && free -h

# 一键重启所有服务
pm2 restart all && systemctl reload nginx && echo "✅ 所有服务已重启"
```

---

🎉 **部署完成！** 你的 QAapp 现在已经在 VPS 服务器上运行了。

如有问题，请查看相关日志文件或联系技术支持。