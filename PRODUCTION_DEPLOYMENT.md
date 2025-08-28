# QA App 生产部署指南

## 概述

QA App 是一个简化的Web3固定收益投资平台，采用现代化的容器化部署方案。本文档提供完整的生产环境部署指南。

## 系统架构

```
[用户] → [Nginx] → [Web前端:3000] → [API后端:3001] → [PostgreSQL:5432]
                                                    → [Redis:6379]
```

### 核心组件

- **Web前端**: Next.js 应用 (端口 3000)
- **API后端**: NestJS 应用 (端口 3001)
- **数据库**: PostgreSQL 15 (端口 5432)
- **缓存**: Redis 7 (端口 6379)
- **代理**: Nginx (端口 80)

## 快速开始

### 1. 环境要求

- Docker 20.10+
- Docker Compose 2.0+
- 最少 4GB RAM
- 最少 20GB 磁盘空间

### 2. 快速部署

```bash
# 克隆代码库
git clone <repository-url>
cd QAAPP

# 配置环境变量
cp .env.api.production .env.api.production.local
# 编辑配置文件，修改密码和敏感信息

# 快速构建和启动
./scripts/fast-build.sh

# 验证部署
./scripts/health-check.sh
```

### 3. 访问应用

- **Web应用**: http://localhost:3000
- **API文档**: http://localhost:3001/api
- **健康检查**: http://localhost:3001/health

## 详细配置

### 环境变量配置

#### 必须修改的生产环境变量:

```bash
# .env.api.production.local
POSTGRES_PASSWORD=your-secure-db-password
REDIS_PASSWORD=your-secure-redis-password
JWT_SECRET=your-256-bit-jwt-secret
DATABASE_URL=postgresql://qaapp_user:your-secure-db-password@postgres:5432/qaapp_prod?schema=public
```

#### 可选配置:

```bash
# 外部访问URL
API_URL=https://api.yourdomain.com
WS_URL=wss://api.yourdomain.com

# 邮件配置（可选）
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 监控配置（可选）
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

### 数据库初始化

```bash
# 首次部署需要运行数据库迁移
docker-compose -f docker-compose.simple.yml exec api pnpm prisma migrate deploy

# 创建管理员用户（可选）
docker-compose -f docker-compose.simple.yml exec api node scripts/create-admin.js
```

## 运维管理

### 常用命令

```bash
# 启动服务
docker-compose -f docker-compose.simple.yml up -d

# 停止服务
docker-compose -f docker-compose.simple.yml down

# 重启特定服务
docker-compose -f docker-compose.simple.yml restart api

# 查看日志
docker-compose -f docker-compose.simple.yml logs -f

# 查看服务状态
docker-compose -f docker-compose.simple.yml ps
```

### 健康检查

```bash
# 运行完整健康检查
./scripts/health-check.sh

# 检查特定服务
curl http://localhost:3001/health
curl http://localhost:3001/health/detailed
curl http://localhost:3001/health/metrics
```

### 日志管理

```bash
# 查看API日志
docker-compose -f docker-compose.simple.yml logs api

# 查看数据库日志
docker-compose -f docker-compose.simple.yml logs postgres

# 实时日志
docker-compose -f docker-compose.simple.yml logs -f
```

### 数据备份

```bash
# 数据库备份
docker-compose -f docker-compose.simple.yml exec postgres pg_dump -U qaapp_user qaapp_prod > backup.sql

# Redis备份
docker-compose -f docker-compose.simple.yml exec redis redis-cli BGSAVE
```

## 扩展配置

### SSL/HTTPS 配置

如需HTTPS支持，修改nginx配置:

```bash
# 添加SSL证书
mkdir -p ssl/
# 将证书文件放入 ssl/ 目录

# 使用HTTPS版本的nginx配置
cp nginx/nginx-https.conf nginx/nginx-simple.conf

# 重启nginx
docker-compose -f docker-compose.simple.yml restart nginx
```

### 高级监控 (可选)

如需完整监控栈，使用:

```bash
# 使用完整版docker-compose（包含Prometheus + Grafana）
docker-compose -f docker-compose.production.yml up -d
```

### 性能调优

#### 数据库优化:
```bash
# 修改PostgreSQL配置
# 编辑 postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
```

#### API性能:
```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 故障排除

### 常见问题

1. **服务无法启动**
   ```bash
   # 检查端口冲突
   netstat -tlnp | grep :3000
   netstat -tlnp | grep :3001
   
   # 检查Docker状态
   docker-compose -f docker-compose.simple.yml ps
   ```

2. **数据库连接失败**
   ```bash
   # 检查数据库状态
   docker-compose -f docker-compose.simple.yml exec postgres pg_isready
   
   # 检查连接字符串
   echo $DATABASE_URL
   ```

3. **内存不足**
   ```bash
   # 检查系统资源
   free -h
   df -h
   
   # 清理Docker缓存
   docker system prune -f
   ```

### 日志分析

```bash
# API错误日志
docker-compose -f docker-compose.simple.yml logs api | grep ERROR

# 系统资源监控
docker stats

# 容器健康状态
docker-compose -f docker-compose.simple.yml exec api curl localhost:3001/health
```

## 更新部署

### 滚动更新

```bash
# 拉取最新代码
git pull origin main

# 重新构建镜像
docker-compose -f docker-compose.simple.yml build --no-cache

# 重启服务（零停机）
docker-compose -f docker-compose.simple.yml up -d --no-deps web
docker-compose -f docker-compose.simple.yml up -d --no-deps api
```

### 数据库迁移

```bash
# 运行数据库迁移
docker-compose -f docker-compose.simple.yml exec api pnpm prisma migrate deploy

# 验证迁移结果
docker-compose -f docker-compose.simple.yml exec api pnpm prisma db status
```

## 安全最佳实践

1. **定期更新密码**
2. **使用强JWT密钥** (256位随机字符串)
3. **启用防火墙** (仅开放必要端口)
4. **定期备份数据**
5. **监控系统日志**
6. **使用HTTPS** (生产环境必须)

## 联系支持

- 技术文档: `/docs`
- 健康检查: `/health`
- API文档: `/api/docs`
- 系统状态: `./scripts/health-check.sh`

---

**最后更新**: $(date '+%Y-%m-%d')  
**版本**: v1.0.0 (简化生产版)