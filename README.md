# 🚀 QA App - Web3固定收益平台

[![CI/CD](https://github.com/qa-app/qa-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/qa-app/qa-app/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/qa-app/qa-app/branch/main/graph/badge.svg)](https://codecov.io/gh/qa-app/qa-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🌟 **安全可靠的Web3投资平台，提供稳定的固定收益产品**

## 📋 项目概览

QA App是一个创新的Web3金融平台，将传统固定收益产品与区块链技术完美结合：

- 💎 **NFT权益凭证** - 投资产品以ERC-1155 NFT形式持有
- 💰 **稳定固定收益** - 年化收益率高达18%，按月分发
- 🤝 **社交化推荐** - C2C分享奖励1%，代理奖励3%
- 🛡️ **企业级安全** - 多重签名、智能合约审计、资金托管
- 🔄 **实时数据同步** - WebSocket推送，链上链下数据一致性

## 🏗️ 技术架构

### 核心技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: NestJS + Prisma + PostgreSQL + Redis + BullMQ  
- **区块链**: Solidity + Hardhat + Polygon/Arbitrum
- **Web3集成**: wagmi + viem + RainbowKit
- **部署**: Docker + Kubernetes + GitHub Actions

### 项目结构
```
qa-app/
├── apps/                     # 应用程序
│   ├── web/                  # Next.js 前端应用
│   └── api/                  # NestJS 后端API
├── packages/                 # 共享包
│   ├── ui/                   # UI组件库
│   ├── shared/               # 共享类型和工具
│   ├── database/             # Prisma数据库层
│   └── contracts/            # 智能合约
├── docs/                     # 项目文档
├── k8s/                      # Kubernetes部署配置
└── scripts/                  # 部署和工具脚本
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.17.0
- pnpm >= 8.0.0
- Docker & Docker Compose
- PostgreSQL >= 14
- Redis >= 6

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/qa-app/qa-app.git
cd qa-app
```

2. **安装依赖**
```bash
pnpm install
```

3. **环境配置**
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑配置文件
vim .env
```

4. **启动开发环境**
```bash
# 启动所有服务(数据库、Redis、Hardhat、API、Web)
docker-compose up -d

# 或者手动启动
pnpm run dev
```

5. **初始化数据库**
```bash
# 运行数据库迁移
pnpm run db:migrate

# 种子数据
pnpm run db:seed
```

6. **访问应用**
- 🌐 前端应用: http://localhost:3000
- 🔌 API文档: http://localhost:3001/api/docs  
- 🗄️ 数据库管理: http://localhost:8080 (Adminer)
- 🔴 Redis管理: http://localhost:8081
- 📧 邮件测试: http://localhost:8025 (MailHog)

## 🛠️ 开发指南

### 常用命令

```bash
# 开发
pnpm run dev              # 启动所有服务
pnpm run build            # 构建所有应用
pnpm run start            # 启动生产版本

# 测试
pnpm run test             # 运行单元测试
pnpm run test:e2e         # 运行端到端测试
pnpm run test:cov         # 测试覆盖率

# 数据库
pnpm run db:generate      # 生成Prisma客户端
pnpm run db:push          # 推送schema到数据库
pnpm run db:migrate       # 运行迁移
pnpm run db:seed          # 种子数据
pnpm run db:studio        # Prisma Studio

# 智能合约
pnpm run contracts:compile   # 编译合约
pnpm run contracts:test      # 测试合约  
pnpm run contracts:deploy    # 部署合约
pnpm run contracts:verify    # 验证合约

# 代码质量
pnpm run lint             # ESLint检查
pnpm run format           # Prettier格式化
pnpm run type-check       # TypeScript类型检查
```

### 项目规范

#### Git提交规范
```
feat: 新功能
fix: Bug修复  
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建/工具相关
```

#### 代码规范
- 使用TypeScript严格模式
- 遵循ESLint和Prettier配置
- 组件使用PascalCase命名
- 工具函数使用camelCase命名
- 常量使用UPPER_SNAKE_CASE命名

#### 分支管理
- `main` - 生产环境分支
- `develop` - 开发环境分支  
- `feature/*` - 功能开发分支
- `hotfix/*` - 紧急修复分支

## 📊 核心功能

### 用户功能
- ✅ 钱包连接 (MetaMask, WalletConnect, Coinbase)
- ✅ 产品浏览和购买 (银卡/金卡/钻石卡)
- ✅ NFT权益凭证管理
- ✅ 收益查看和领取
- ✅ 分享奖励机制
- ✅ 实时数据同步

### 管理功能
- ✅ 产品配置管理
- ✅ 用户权限管理  
- ✅ 收益批量分发
- ✅ 佣金结算管理
- ✅ 系统监控和审计
- ✅ 风控策略配置

### 技术特性
- 🔐 JWT + RBAC权限控制
- 🚦 智能速率限制
- 📊 实时性能监控
- 🛡️ 多层安全防护
- 🔄 自动故障恢复
- 📈 可水平扩展

## 🔒 安全特性

### 智能合约安全
- ✅ OpenZeppelin标准库
- ✅ 多重签名控制
- ✅ 角色权限管理
- ✅ 重入攻击防护
- ✅ 溢出检查
- ✅ 第三方审计

### 应用安全
- ✅ HTTPS强制加密
- ✅ CSRF防护
- ✅ XSS防护
- ✅ SQL注入防护
- ✅ 速率限制
- ✅ 输入验证和净化
- ✅ 敏感数据加密存储

### 运维安全
- ✅ 容器安全扫描
- ✅ 依赖漏洞检测
- ✅ 实时安全监控
- ✅ 自动备份
- ✅ 审计日志
- ✅ 权限最小化

## 📈 性能指标

### 前端性能
- ⚡ First Contentful Paint: < 1.5s
- ⚡ Largest Contentful Paint: < 2.5s  
- ⚡ Cumulative Layout Shift: < 0.1
- ⚡ First Input Delay: < 100ms

### 后端性能  
- 🚀 API响应时间: < 200ms (P95)
- 🚀 数据库查询: < 50ms (P95)
- 🚀 并发处理: 10,000+ req/s
- 🚀 系统可用性: 99.9%+

## 🚀 部署指南

### Docker部署
```bash
# 构建镜像
docker-compose -f docker-compose.prod.yml build

# 启动服务
docker-compose -f docker-compose.prod.yml up -d

# 健康检查
curl http://localhost/health
```

### Kubernetes部署
```bash
# 应用配置
kubectl apply -f k8s/production/

# 检查状态
kubectl get pods -n qa-app-production

# 查看日志
kubectl logs -f deployment/qa-app-api -n qa-app-production
```

### 环境变量配置
生产环境需要配置以下关键变量：
- `DATABASE_URL` - PostgreSQL连接串
- `REDIS_URL` - Redis连接串  
- `JWT_SECRET` - JWT签名密钥
- `ENCRYPTION_KEY` - 数据加密密钥
- 区块链RPC端点和私钥
- 第三方服务API密钥

## 🧪 测试

### 单元测试
```bash
# 运行所有测试
pnpm run test

# 监视模式
pnpm run test:watch

# 覆盖率报告
pnpm run test:cov
```

### 端到端测试
```bash
# 运行E2E测试
pnpm run test:e2e

# 调试模式
pnpm run test:e2e:debug
```

### 智能合约测试
```bash
# 测试所有合约
pnpm run contracts:test

# 测试覆盖率
pnpm run contracts:coverage

# Gas使用分析
pnpm run contracts:gas
```

## 📚 API文档

### REST API
完整的API文档可在开发环境访问：http://localhost:3001/api/docs

### GraphQL API  
GraphQL Playground: http://localhost:3001/graphql

### WebSocket API
实时事件推送端点：`ws://localhost:3001/socket.io`

## 🤝 参与贡献

我们欢迎所有形式的贡献！

### 贡献方式
1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)  
5. 创建Pull Request

### 开发环境设置
1. 确保满足环境要求
2. 遵循代码规范
3. 编写测试用例
4. 更新相关文档

### 问题报告
请使用GitHub Issues报告问题，包含：
- 详细的问题描述
- 复现步骤
- 环境信息
- 错误日志

## 📄 许可证

本项目基于 [MIT许可证](LICENSE) 开源。

## 🙏 致谢

感谢以下开源项目：
- [Next.js](https://nextjs.org/) - React框架
- [NestJS](https://nestjs.com/) - Node.js框架  
- [Prisma](https://prisma.io/) - 数据库工具
- [OpenZeppelin](https://openzeppelin.com/) - 智能合约库
- [wagmi](https://wagmi.sh/) - React钩子for Ethereum
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库

## 📞 联系我们

- 📧 邮箱: contact@qa-app.com
- 🐦 Twitter: [@QAApp](https://twitter.com/QAApp)  
- 💬 Discord: [QA App Community](https://discord.gg/qaapp)
- 🌐 官网: [qa-app.com](https://qa-app.com)

---

<div align="center">
  <strong>🚀 让我们一起构建Web3金融的未来！</strong>
</div>