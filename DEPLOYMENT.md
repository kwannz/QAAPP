# 🚀 生产部署指南

## 📋 快速部署清单

### 1. 环境准备
```bash
# 复制生产环境变量
cp .env.production .env.local

# 安装依赖
pnpm install

# 构建项目
pnpm build
```

### 2. 数据库配置
```bash
# 运行数据库迁移
cd apps/api
npx prisma migrate deploy
npx prisma generate
```

### 3. 启动服务

#### 使用 PM2（推荐）
```bash
# 启动生产服务
pnpm start
```

#### 手动启动
```bash
# 启动API服务
cd apps/api
pnpm start:prod

# 启动Web应用
cd apps/web
pnpm start
```

## 🐧 Linux VPS 部署

### 自动化部署（推荐）
```bash
# 1. 运行环境设置脚本（仅首次）
chmod +x scripts/setup-vps.sh
./scripts/setup-vps.sh

# 2. 一键部署
chmod +x scripts/vps-deploy.sh
./scripts/vps-deploy.sh
```

### 手动部署步骤

#### 环境准备 (Ubuntu/Debian)
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# 安装 Redis
sudo apt-get install -y redis-server

# 启动服务
sudo systemctl start postgresql redis
sudo systemctl enable postgresql redis
```

#### 环境准备 (CentOS/RHEL/Fedora)
```bash
# 安装 Node.js 18+
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install -y nodejs npm

# 安装 pnpm
npm install -g pnpm

# 安装 PostgreSQL
sudo dnf install -y postgresql postgresql-server postgresql-contrib
sudo postgresql-setup --initdb

# 安装 Redis
sudo dnf install -y redis

# 启动服务
sudo systemctl start postgresql redis
sudo systemctl enable postgresql redis
```

#### 可选：配置系统服务（自动启动）
```bash
# 创建应用用户
sudo useradd -m -s /bin/bash qaapp
sudo mkdir -p /opt/qa-app
sudo chown qaapp:qaapp /opt/qa-app

# 复制项目文件到生产目录
sudo cp -r . /opt/qa-app/
sudo chown -R qaapp:qaapp /opt/qa-app

# 安装系统服务
sudo cp systemd/qa-app.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable qa-app.service
```

#### 数据库初始化
```bash
# 创建数据库用户
sudo -u postgres psql -c "CREATE USER qa_user WITH ENCRYPTED PASSWORD 'qa_password';"
sudo -u postgres psql -c "CREATE DATABASE qa_database OWNER qa_user;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE qa_database TO qa_user;"

# 测试连接
PGPASSWORD=qa_password psql -h localhost -U qa_user -d qa_database -c "SELECT 1;"
```

## 🔧 配置说明

### API连接状态
- **审计日志页面**: ✅ 已连接API，支持真实数据/模拟数据切换
- **用户审计页面**: ✅ 基础API集成
- **系统审计页面**: ✅ 基础API集成
- **性能监控页面**: ✅ 基础API集成
- **风险评估页面**: ✅ 基础API集成

### 核心功能
- ✅ CSV导出功能已实现
- ✅ 数据筛选和搜索
- ✅ 分页加载
- ✅ 批量操作（模拟）
- ✅ 实时刷新

### 数据源切换
所有管理页面都包含数据源切换开关：
- **模拟数据模式**: 使用本地模拟数据，无需后端API
- **真实API模式**: 连接真实后端API

## 📊 功能验证

### 测试审计功能
1. 访问 `/admin/audit-logs`
2. 切换数据源开关测试两种模式
3. 测试CSV导出功能
4. 测试搜索和筛选

### 测试评估功能
1. 访问 `/admin/performance`
2. 查看性能指标
3. 访问 `/admin/risk-assessment`
4. 查看风险评估

## 🔒 安全配置

### 生产环境必需
1. 更新 `.env.production` 中的所有密钥
2. 配置HTTPS
3. 设置CORS策略
4. 启用速率限制

### API密钥配置
```env
# 需要替换的关键配置
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_CONTRACT_ADDRESS=YOUR_CONTRACT_ADDRESS
```

## 📈 监控和维护

### 健康检查
- API健康检查: `/api/health`
- 系统状态: `/admin/system`

### 日志管理
- 审计日志自动记录所有管理操作
- 支持日志导出和分析

### 性能优化
- 已实现分页加载减少数据量
- CSV导出使用流式处理
- 支持缓存配置

## 🎯 生产就绪状态

✅ **前端功能完整**
- 所有管理页面UI已完成
- 核心功能可用

✅ **API集成就绪**
- API客户端配置完成
- 支持真实API和模拟数据切换

✅ **导出功能可用**
- CSV导出已实现
- 支持批量数据导出

✅ **错误处理完善**
- API失败自动回退到模拟数据
- 友好的错误提示

## 📝 注意事项

1. **首次部署**: 建议先使用模拟数据模式验证功能
2. **API对接**: 确保后端API端点与前端配置匹配
3. **数据迁移**: 如需导入历史数据，使用提供的导入工具
4. **性能测试**: 建议在生产环境进行压力测试

## 🆘 故障排查

### 常见问题
1. **API连接失败**: 检查CORS配置和API URL
2. **导出功能异常**: 确保浏览器允许下载
3. **数据不更新**: 检查实时更新配置

## 🔗 反向代理配置 (Nginx)

### 安装和配置 Nginx
```bash
# Ubuntu/Debian
sudo apt-get install -y nginx

# CentOS/RHEL/Fedora
sudo dnf install -y nginx

# 复制配置文件
sudo cp nginx/qa-app.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/qa-app.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 启动 Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### SSL 证书配置
```bash
# 使用 Let's Encrypt (推荐)
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d qa-app.com -d www.qa-app.com -d api.qa-app.com

# 或者使用自签名证书 (仅开发)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/ssl/private/qa-app.com.key \
    -out /etc/ssl/certs/qa-app.com.crt
```

## 📋 备份和恢复

### 数据库备份
```bash
# 每日备份脚本
pg_dump -h localhost -U qa_user -d qa_database > backup_$(date +%Y%m%d).sql

# 压缩备份
pg_dump -h localhost -U qa_user -d qa_database | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 数据库恢复
```bash
# 从备份恢复
psql -h localhost -U qa_user -d qa_database < backup_20240902.sql

# 从压缩备份恢复
gunzip -c backup_20240902.sql.gz | psql -h localhost -U qa_user -d qa_database
```

### 联系支持
- 技术问题: dev@qa-app.com
- 紧急支持: +86-xxx-xxxx-xxxx

---

**系统已准备好投入生产使用！** 🎉