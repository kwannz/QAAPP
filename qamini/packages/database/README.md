# QA App Database Package

这是 QA 固定收益投资平台的数据库包，使用 Prisma 作为 ORM，PostgreSQL 作为数据库。

## 🏗️ 数据库架构

### 核心实体
- **用户系统** (`users`, `wallets`) - 用户账户和钱包管理
- **产品系统** (`products`) - 投资产品定义
- **交易系统** (`orders`, `positions`) - 订单和仓位管理
- **收益系统** (`payouts`) - 分红记录
- **佣金系统** (`commissions`) - 推荐和代理佣金
- **审计系统** (`audit_logs`) - 操作日志记录
- **系统配置** (`system_configs`) - 系统参数配置
- **后台任务** (`batch_jobs`) - 批处理任务记录

### 关键特性
- 完整的用户角色体系 (USER/AGENT/ADMIN)
- 推荐关系链管理
- 多链钱包地址支持
- NFT 证书集成
- 佣金自动计算
- 操作审计追踪

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 环境配置

复制环境配置文件：
```bash
cp .env.example .env
```

修改 `.env` 文件中的数据库连接配置：
```env
DATABASE_URL="postgresql://username:password@localhost:5432/qa_app_dev?schema=public"
```

### 3. 数据库初始化

运行完整的数据库初始化脚本：
```bash
pnpm run db:init
```

这会自动执行：
- 数据库连接检查
- 运行迁移脚本
- 生成 Prisma 客户端
- 导入种子数据

### 4. 手动操作（可选）

如果需要单独执行某个步骤：

```bash
# 生成 Prisma 客户端
pnpm run db:generate

# 推送数据库结构（开发环境）
pnpm run db:push

# 运行迁移（生产环境）
pnpm run db:migrate:deploy

# 导入种子数据
pnpm run db:seed

# 打开数据库管理界面
pnpm run db:studio

# 重置数据库
pnpm run db:reset
```

## 📊 种子数据

初始化后，系统会自动创建以下测试数据：

### 测试账户
- **管理员**: admin@qa-app.com / Admin123!
- **代理商1**: agent1@qa-app.com / Agent123!
- **代理商2**: agent2@qa-app.com / Agent123!
- **用户1**: user1@example.com / User123!
- **用户2**: user2@example.com / User123!
- **用户3**: user3@example.com / User123!

### 产品配置
- **QASILVER**: 30天期白银卡，12% APR
- **QAGOLD**: 60天期黄金卡，15% APR
- **QADIAMOND**: 90天期钻石卡，18% APR

### 系统配置
- 平台手续费率: 0.5%
- C2C推荐佣金: 1%
- 代理商佣金: 3%

## 🛠️ 开发指南

### 数据库查询示例

```typescript
import { prisma } from '@qa-app/database';

// 查询用户及其仓位
const userWithPositions = await prisma.users.findUnique({
  where: { id: 'user-001' },
  include: {
    positions: {
      include: {
        product: true,
        payouts: true,
      },
    },
    wallets: true,
  },
});

// 分页查询订单
const orders = await prisma.orders.findMany({
  where: { status: 'SUCCESS' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});
```

### 使用辅助函数

```typescript
import { 
  createPaginationQuery, 
  createPaginatedResult,
  validateUserData,
  handleDatabaseError
} from '@qa-app/database';

// 分页查询
const { skip, take, page, limit } = createPaginationQuery({ page: 1, limit: 20 });

// 数据验证
const validation = validateUserData({
  email: 'test@example.com',
  password: 'Password123!',
  role: 'USER',
});

if (!validation.isValid) {
  console.error('验证失败:', validation.errors);
}

// 错误处理
try {
  await prisma.users.create({ data: userData });
} catch (error) {
  handleDatabaseError(error);
}
```

## 📋 可用脚本

| 命令 | 描述 |
|------|------|
| `pnpm run build` | 编译 TypeScript 代码 |
| `pnpm run dev` | 监听模式编译 |
| `pnpm run db:init` | 完整数据库初始化 |
| `pnpm run db:generate` | 生成 Prisma 客户端 |
| `pnpm run db:push` | 推送数据库结构 |
| `pnpm run db:migrate` | 创建迁移文件 |
| `pnpm run db:migrate:deploy` | 部署迁移到生产环境 |
| `pnpm run db:seed` | 运行种子数据 |
| `pnpm run db:studio` | 打开 Prisma Studio |
| `pnpm run db:reset` | 重置数据库 |

## 🔧 配置说明

### 环境变量

| 变量名 | 描述 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 主数据库连接字符串 | `postgresql://user:pass@localhost:5432/db` |
| `DATABASE_TEST_URL` | 测试数据库连接字符串 | `postgresql://user:pass@localhost:5432/test_db` |
| `DB_POOL_SIZE` | 连接池大小 | `10` |
| `PRISMA_STUDIO_PORT` | Studio 端口 | `5555` |

### Prisma 配置

数据库客户端已配置了以下特性：
- 查询日志记录
- 错误格式美化
- 连接池管理
- 优雅关闭处理

## 🚨 注意事项

### 生产环境部署

1. **迁移部署**: 使用 `pnpm run db:migrate:deploy` 而不是 `db:push`
2. **环境隔离**: 确保生产环境使用独立的数据库
3. **连接池**: 根据服务器配置调整连接池大小
4. **监控**: 配置数据库性能监控

### 安全考虑

1. **敏感数据**: 密码已使用 bcrypt 哈希
2. **访问控制**: 实现了基于角色的权限控制
3. **审计日志**: 记录所有重要操作
4. **数据验证**: 提供完整的数据验证函数

### 性能优化

1. **索引策略**: 已为查询热点字段创建索引
2. **分页查询**: 提供分页辅助函数
3. **连接复用**: 使用全局单例避免重复连接

## 🤝 贡献指南

1. 修改数据库结构时，务必创建迁移文件
2. 更新种子数据时，保持测试数据的一致性
3. 添加新的验证函数到 `validation-helpers.ts`
4. 更新相关文档和类型定义

## 📚 相关资源

- [Prisma 官方文档](https://www.prisma.io/docs/)
- [PostgreSQL 文档](https://www.postgresql.org/docs/)
- [项目架构文档](../../FULLSTACK_ARCHITECTURE.md)