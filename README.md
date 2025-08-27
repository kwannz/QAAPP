# 🚀 QA App - Web3固定收益平台

[![CI/CD](https://github.com/qa-app/qa-app/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/qa-app/qa-app/actions/workflows/ci-cd.yml)
[![codecov](https://codecov.io/gh/qa-app/qa-app/branch/main/graph/badge.svg)](https://codecov.io/gh/qa-app/qa-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> 🌟 **安全可靠的Web3投资平台，提供稳定的固定收益产品**

## 📋 项目概览

**项目状态**: ✅ **生产就绪**  
**完成度**: **95%**  
**最后更新**: 2025-08-28  

QA App是一个创新的Web3金融平台，将传统固定收益产品与区块链技术完美结合：

- 💎 **NFT权益凭证** - 投资产品以ERC-1155 NFT形式持有
- 💰 **稳定固定收益** - 年化收益率高达18%，按月分发
- 🤝 **社交化推荐** - C2C分享奖励1%，代理奖励3%
- 🛡️ **企业级安全** - 多重签名、智能合约审计、资金托管
- 🔄 **实时数据同步** - WebSocket推送，链上链下数据一致性

## 🏗️ 技术架构

### 核心技术栈
- **前端**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: NestJS + Prisma + PostgreSQL + Redis
- **区块链**: Solidity + Hardhat + OpenZeppelin
- **Web3集成**: wagmi + viem + RainbowKit
- **部署**: Docker + nginx

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
├── nginx/                    # nginx配置
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
git clone https://github.com/kwannz/QAAPP.git
cd QAAPP
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
# 开发模式
pnpm run dev              # 启动所有服务
pnpm run dev:web          # 仅启动前端
pnpm run dev:api          # 仅启动后端

# 构建
pnpm run build            # 构建所有应用
pnpm run build:web        # 构建前端
pnpm run build:api        # 构建后端

# 测试
pnpm run test             # 运行所有测试
pnpm run test:contracts   # 智能合约测试
pnpm run test:e2e         # 端到端测试

# 数据库
pnpm run db:migrate       # 数据库迁移
pnpm run db:seed          # 种子数据
pnpm run db:studio        # Prisma Studio

# 部署
pnpm run deploy           # 部署到生产环境
pnpm run deploy:staging   # 部署到测试环境
```

### 智能合约开发
```bash
# 编译合约
pnpm run contracts:compile

# 运行测试
pnpm run contracts:test

# 部署到本地网络
pnpm run contracts:deploy:local

# 部署到测试网
pnpm run contracts:deploy:testnet
```

## 📚 核心文档

- **PROJECT_STATUS.md**: 项目状态总结和功能概览
- **PRD.md**: 产品需求文档
- **FULLSTACK_ARCHITECTURE.md**: 全栈架构设计
- **COMPONENT_LIBRARY_SPECS.md**: 组件库规范
- **USER_EXPERIENCE_FLOWS.md**: 用户体验流程
- **DESIGN_SYSTEM_PRO.md**: 设计系统规范

## 🔒 安全特性

- **智能合约**: 重入攻击防护、权限控制、安全审计
- **API安全**: JWT认证、RBAC权限系统、输入验证
- **数据库**: 参数化查询、SQL注入防护、数据加密
- **前端**: XSS防护、CSRF保护、安全头部

## 📈 性能指标

- **API响应时间**: < 100ms
- **页面加载时间**: < 2s
- **合约部署成本**: 优化完成
- **Gas使用效率**: 高度优化

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- **项目主页**: [https://github.com/kwannz/QAAPP](https://github.com/kwannz/QAAPP)
- **问题反馈**: [Issues](https://github.com/kwannz/QAAPP/issues)
- **讨论交流**: [Discussions](https://github.com/kwannz/QAAPP/discussions)

---

⭐ 如果这个项目对您有帮助，请给我们一个星标！