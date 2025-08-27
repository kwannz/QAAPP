# QAapp 部署指南

Web3固定收益平台完整部署文档

## 🚀 快速部署

### 一键部署命令

```bash
# 开发环境部署
./scripts/deploy.sh development

# 测试环境部署
./scripts/deploy.sh staging  

# 生产环境部署
./scripts/deploy.sh production
```

## 📋 部署前准备

### 系统要求

- **操作系统**: Ubuntu 20.04+ / CentOS 8+ / macOS 10.15+
- **Docker**: 20.10+ 
- **docker-compose**: 1.29+
- **内存**: 最低4GB，推荐8GB+
- **磁盘空间**: 最低20GB，推荐50GB+
- **端口**: 3000, 3001, 5432, 6379, 80, 443

### 依赖安装

#### Ubuntu/Debian
```bash
# 更新系统包
sudo apt update && sudo apt upgrade -y

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 安装docker-compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 重新登录或执行
newgrp docker
```

#### macOS
```bash
# 安装Docker Desktop
# https://www.docker.com/products/docker-desktop

# 验证安装
docker --version
docker-compose --version
```

## 🔧 配置说明

### 环境变量配置

1. **复制环境变量模板**:
```bash
cp .env.example .env.production
cp .env.example .env.staging
cp .env.example .env.development
```

2. **编辑环境变量文件**:
```bash
# 根据部署环境编辑对应文件
vim .env.production  # 生产环境
vim .env.staging     # 测试环境  
vim .env.development # 开发环境
```

### 必须修改的配置项

#### 数据库配置
```bash
DATABASE_URL="postgresql://qa_user:CHANGE_PASSWORD@localhost:5432/qa_app_prod"
POSTGRES_PASSWORD=CHANGE_PASSWORD
```

#### JWT和加密密钥
```bash
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
ENCRYPTION_KEY="your-32-character-encryption-key"
```

#### Web3配置
```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# 智能合约地址
NEXT_PUBLIC_TREASURY_CONTRACT_MAINNET=0x...
NEXT_PUBLIC_QA_CARD_CONTRACT_MAINNET=0x...
```

#### SSL证书配置（生产环境）
```bash
# 将SSL证书放置到以下目录
mkdir -p ssl/
# ssl/qa-app.crt  - SSL证书
# ssl/qa-app.key  - 私钥
```

## 🐳 Docker部署方式

### 方式1: 使用一键部署脚本（推荐）

```bash
# 检查脚本帮助
./scripts/deploy.sh help

# 部署开发环境
./scripts/deploy.sh development

# 部署生产环境
./scripts/deploy.sh production
```

### 方式2: 使用docker-compose

```bash
# 开发环境
docker-compose up -d

# 生产环境（需要配置profile）
docker-compose --profile production up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service_name]
```

### 方式3: 分别部署前后端

```bash
# 部署前端
./scripts/deploy-frontend.sh production

# 部署后端  
./scripts/deploy-backend.sh production
```

## 🌐 传统服务器部署

### 前端部署

```bash
# 安装Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装pnpm
npm install -g pnpm@10.15.0

# 构建前端
pnpm install
pnpm build:web

# 使用PM2管理进程
npm install -g pm2
pm2 start apps/web/server.js --name qa-app-web
```

### 后端部署

```bash
# 安装PostgreSQL
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 安装Redis
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 构建后端
pnpm install
pnpm build:api

# 数据库迁移
pnpm db:generate
pnpm db:migrate

# 启动API服务
pm2 start apps/api/dist/main.js --name qa-app-api
```

## 📊 服务监控

### 健康检查端点

- **前端**: `http://localhost:3000/`
- **API**: `http://localhost:3001/health`
- **数据库**: `docker-compose exec postgres pg_isready`
- **Redis**: `docker-compose exec redis redis-cli ping`

### 日志管理

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f postgres
docker-compose logs -f redis

# 查看实时日志
docker-compose logs -f --tail=100 api
```

### 性能监控

项目包含Prometheus和Grafana监控栈：

```bash
# 启动监控服务
docker-compose --profile monitoring up -d

# 访问监控页面
# Prometheus: http://localhost:9090
# Grafana: http://localhost:3001 (admin/admin)
```

## 🔐 安全配置

### 防火墙设置

```bash
# Ubuntu/Debian
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 3000  # 前端（开发环境）
sudo ufw allow 3001  # API（开发环境）
```

### SSL/TLS配置

生产环境强烈建议使用HTTPS：

1. **获取SSL证书**:
```bash
# 使用Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d qa-app.com -d www.qa-app.com
```

2. **配置Nginx**:
SSL证书会自动配置到nginx容器中

### 数据库安全

```bash
# 修改默认密码
ALTER USER postgres PASSWORD 'new_secure_password';

# 创建应用专用用户
CREATE USER qa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE qa_app_prod TO qa_user;
```

## 📈 性能优化

### 数据库优化

```sql
-- PostgreSQL配置优化
-- 在postgresql.conf中设置
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.7
wal_buffers = 16MB
default_statistics_target = 100
```

### Redis优化

```bash
# redis.conf配置
maxmemory 512mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

### Nginx优化

```nginx
# 工作进程数
worker_processes auto;

# 连接数优化
events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

# 缓存配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=STATIC:10m inactive=7d use_temp_path=off;
```

## 🚨 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 查看端口占用
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000

# 杀死占用进程
sudo kill -9 <PID>
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker-compose exec postgres pg_isready
docker-compose logs postgres

# 重置数据库
docker-compose down -v
docker-compose up -d postgres
```

#### 3. 内存不足
```bash
# 检查内存使用
free -h
docker stats

# 清理未使用的容器
docker system prune -a
```

#### 4. 构建失败
```bash
# 清理构建缓存
docker builder prune -a

# 重新构建
docker-compose build --no-cache
```

### 日志分析

```bash
# API错误日志
docker-compose logs api | grep ERROR

# 数据库慢查询
docker-compose exec postgres psql -c "SELECT query FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Nginx访问日志
docker-compose logs nginx | grep "HTTP/1.1\" 5"
```

## 🔄 升级部署

### 版本升级

```bash
# 1. 备份数据
docker-compose exec postgres pg_dump qa_app_prod > backup.sql

# 2. 停止服务
./scripts/deploy.sh stop

# 3. 拉取最新代码
git pull origin main

# 4. 重新部署
./scripts/deploy.sh production

# 5. 数据库迁移（如需要）
docker-compose exec api pnpm db:migrate
```

### 回滚操作

```bash
# 1. 切换到上一个稳定版本
git checkout <stable_commit>

# 2. 重新部署
./scripts/deploy.sh production

# 3. 如需要恢复数据库
docker-compose exec postgres psql qa_app_prod < backup.sql
```

## 📝 维护任务

### 定期维护

```bash
# 每周执行的维护脚本
#!/bin/bash

# 清理Docker
docker system prune -f

# 备份数据库
docker-compose exec postgres pg_dump qa_app_prod > "backup_$(date +%Y%m%d).sql"

# 检查磁盘空间
df -h

# 更新系统包
sudo apt update && sudo apt upgrade -y
```

### 监控告警

建议配置以下监控告警：

- 服务可用性检查
- 资源使用率监控（CPU、内存、磁盘）
- 数据库连接数监控
- API响应时间监控
- 错误日志监控

## 📞 技术支持

如遇到部署问题，请联系技术团队：

- **文档**: 本部署指南
- **日志**: 使用`docker-compose logs`查看详细日志
- **健康检查**: 访问`/health`端点
- **监控**: 使用Grafana查看系统状态

---

> 🎉 **恭喜！** 您的QAapp系统已成功部署！
> 
> - 前端访问: http://localhost:3000
> - API文档: http://localhost:3001/api  
> - 管理面板: http://localhost:8080 (Adminer)