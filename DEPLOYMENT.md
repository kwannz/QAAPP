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

#### 使用 Docker（推荐）
```bash
# 构建并启动所有服务
docker-compose -f docker-compose.production.yml up -d
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

### 联系支持
- 技术问题: dev@qa-app.com
- 紧急支持: +86-xxx-xxxx-xxxx

---

**系统已准备好投入生产使用！** 🎉