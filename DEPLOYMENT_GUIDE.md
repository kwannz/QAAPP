# QA App 完整部署指南

本指南介绍如何通过简单的 `pnpm install`, `pnpm build`, `pnpm start` 命令完成整个系统的部署。

## 🚀 一键部署方案

### 方案一：标准部署（推荐）

```bash
# 1. 安装依赖（自动初始化数据库）
pnpm install

# 2. 构建所有组件
pnpm build

# 3. 启动生产系统
pnpm start
```

### 方案二：Docker 部署（最简单）

```bash
# 一行命令启动所有服务
pnpm run start:docker

# 或者直接使用 Docker Compose
docker-compose up -d
```

## 📋 部署前准备

### 系统依赖
- Node.js >= 18.17.0
- pnpm >= 10.0.0
- PostgreSQL >= 14
- Redis >= 6
- Docker (可选，用于容器化部署)

### 自动安装依赖
系统会自动检查和安装以下服务：
- PostgreSQL (通过 Homebrew)
- Redis (通过 Homebrew)
- PM2 (进程管理器)

## 🔧 部署流程详解

### 1. `pnpm install` 阶段
- 安装所有项目依赖
- **自动执行** `postinstall` 脚本
- 检查 PostgreSQL 和 Redis 服务
- 自动启动数据库服务（如果未运行）
- 创建数据库用户和数据库
- 生成 Prisma 客户端
- 运行数据库迁移和种子数据

### 2. `pnpm build` 阶段
- 构建共享包：`@qa-app/shared`, `@qa-app/ui`, `@qa-app/database`
- 生成数据库客户端和推送架构
- 构建应用程序：`@qa-app/api`, `@qa-app/web`
- 优化生产构建

### 3. `pnpm start` 阶段
- **自动执行** `prestart` 脚本（确保构建完成）
- 启动生产环境进程管理器 (PM2)
- 启动 API 服务（端口 3001）
- 启动 Web 服务（端口 3002）
- 执行健康检查
- 显示服务状态和访问地址

## 🏗️ 构建选项

```bash
# 标准构建（依次构建，确保依赖顺序）
pnpm build

# 快速构建（并行构建）
pnpm run build:fast

# 生产构建（优化模式）
pnpm run build:production

# 缓存构建（利用 Turborepo 缓存）
pnpm run build:cache
```

## 🚀 启动选项

```bash
# 生产模式启动（PM2 管理）
pnpm start

# 开发模式启动
pnpm run start:dev

# Docker 容器启动
pnpm run start:docker
```

## 🛑 停止系统

```bash
# 优雅停止所有服务
pnpm run stop

# 或使用 shell 脚本
./stop-system.sh

# 停止 Docker 服务
pnpm run stop:docker
```

## 📊 系统管理

### 查看状态
```bash
# 查看服务状态
pnpm run status

# 查看 PM2 进程状态
pm2 status

# 健康检查
pnpm run health
```

### 查看日志
```bash
# 实时查看所有日志
pnpm run logs

# 查看 PM2 日志
pm2 logs

# 查看特定服务日志
tail -f logs/qa-api-combined.log
tail -f logs/qa-web-combined.log
```

### 重启服务
```bash
# 重启所有服务
pnpm run restart

# 重启特定服务
pm2 restart qa-api
pm2 restart qa-web
```

## 🌐 访问地址

部署完成后，可以通过以下地址访问：

- **前端应用**: http://localhost:3002
- **API 接口**: http://localhost:3001
- **API 文档**: http://localhost:3001/api
- **健康检查**: http://localhost:3001/health

## 🐳 Docker 部署

### 完整 Docker 环境
```bash
# 启动所有服务（包括数据库）
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境 Profiles
```bash
# 启动包含 Nginx 反向代理
docker-compose --profile nginx up -d

# 启动包含监控系统
docker-compose --profile monitoring up -d

# 启动完整监控环境
docker-compose --profile nginx --profile monitoring up -d
```

## 🔒 环境配置

系统会自动处理环境配置：

1. **开发环境**: 使用 `.env.development`
2. **生产环境**: 使用 `.env.production`
3. **Docker 环境**: 使用容器内环境变量

### 主要环境变量
```bash
DATABASE_URL=postgresql://qa_user:qa_password@localhost:5432/qa_database
REDIS_URL=redis://localhost:6379
API_PORT=3001
WEB_PORT=3002
NODE_ENV=production
LOG_LEVEL=info
```

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查 PostgreSQL 状态
brew services list | grep postgresql

# 启动 PostgreSQL
brew services start postgresql@14

# 重新初始化数据库
pnpm run db:setup
```

#### 2. 端口已被占用
```bash
# 查看端口占用
lsof -i :3001
lsof -i :3002

# 停止占用进程
pnpm run stop
```

#### 3. PM2 进程异常
```bash
# 查看 PM2 进程
pm2 status

# 重启 PM2
pm2 restart ecosystem.config.js

# 重置 PM2
pm2 delete all && pnpm start
```

#### 4. 构建失败
```bash
# 清理缓存重新构建
pnpm run clean
pnpm install
pnpm build
```

## 📈 监控和日志

### 日志文件位置
- API 日志: `logs/qa-api-combined.log`
- Web 日志: `logs/qa-web-combined.log`
- 系统日志: `logs/system.log`

### 监控工具（Docker）
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3000 (admin/admin123)

## 🔧 定制化配置

### PM2 配置
编辑 `ecosystem.config.js` 可以修改：
- 进程实例数量
- 内存限制
- 自动重启策略
- 日志配置

### Docker 配置
编辑 `docker-compose.yml` 可以修改：
- 服务端口映射
- 环境变量
- 卷挂载
- 网络配置

## 💡 最佳实践

1. **生产部署**：使用 Docker 方案确保环境一致性
2. **开发调试**：使用标准部署方案便于开发调试
3. **监控告警**：启用 monitoring profile 进行系统监控
4. **日志管理**：定期清理和归档日志文件
5. **备份策略**：定期备份数据库和配置文件

## 🆘 技术支持

如果遇到部署问题：

1. 查看部署日志和错误信息
2. 检查系统依赖是否正确安装
3. 确认端口没有被其他程序占用
4. 验证数据库和 Redis 服务正常运行
5. 查阅本指南的故障排除部分

---

通过以上配置，您的 QA App 系统现在支持真正的一键部署：`pnpm install && pnpm build && pnpm start`！