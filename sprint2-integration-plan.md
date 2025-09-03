# 🚀 Sprint 2: 全面系统整合计划

## 📅 计划概述
- **开始日期**: 2025-01-04
- **预计完成**: 2025-01-18 (2周冲刺)
- **目标**: 将系统页面、组件和API模块大幅精简，提升效率50%+
- **风险等级**: 中等（有完善的回滚方案）

## 📊 当前系统状态（Sprint 1 完成后）

### 前端现状
- **页面数量**: 30个（从40个减少）
- **组件文件**: 53个
- **组件目录**: 15个
- **Mock数据点**: 122处
- **重复代码**: 约35%

### 后端现状
- **API模块**: 26个
- **重复模块**: 5对（user/users等）
- **未使用模块**: 4个已删除
- **测试文件**: 29个（分散）

## 🎯 Phase 1: 前端深度整合（页面: 30 → 15）

### 1.1 创建统一运营中心（管理员）

```typescript
// 新建: /admin/operations/page.tsx
export default function OperationsCenter() {
  // 整合以下功能到标签页:
  // - 用户管理 (原 /admin/users)
  // - 产品管理 (原 /admin/products)  
  // - 订单管理 (原 /admin/orders)
  // - 代理管理 (原 /admin/agents)
  // - 提现处理 (原 /admin/withdrawals)
}
```

**删除页面**:
- `/admin/users`
- `/admin/products`
- `/admin/orders`
- `/admin/agents`
- `/admin/withdrawals`

### 1.2 创建业务分析中心（管理员）

```typescript
// 新建: /admin/analytics/page.tsx
export default function AnalyticsCenter() {
  // 整合以下功能:
  // - 佣金分析 (原 /admin/commissions)
  // - 报表中心 (原 /admin/reports)
  // - 通知管理 (原 /admin/notifications)
  // - 实时业务统计
}
```

**删除页面**:
- `/admin/commissions`
- `/admin/reports`
- `/admin/notifications`

### 1.3 优化用户仪表板

**主仪表板增强** (`/dashboard/page.tsx`):
- 集成个人资料编辑（侧边栏抽屉）
- 集成钱包管理（快速操作卡片）
- 集成通知中心（弹出面板）

**删除页面**:
- `/dashboard/profile` → 整合到主页侧边栏
- `/dashboard/wallets` → 整合到主页快速操作
- `/dashboard/notifications` → 整合为弹出面板

**最终用户页面结构**:
```
/dashboard (主页，包含profile、wallets、notifications)
/dashboard/activity (活动中心)
/dashboard/commissions (佣金中心)
/dashboard/reports (报表中心)
```

### 1.4 整合管理员与用户的重复页面

创建共享组件，根据用户角色显示不同内容:

```typescript
// components/shared/CommissionsView.tsx
export function CommissionsView({ userRole }: { userRole: 'admin' | 'user' }) {
  // 管理员看到所有用户佣金
  // 普通用户只看到自己的佣金
}

// components/shared/ReportsView.tsx  
export function ReportsView({ userRole }: { userRole: 'admin' | 'user' }) {
  // 管理员看到系统报表
  // 普通用户看到个人报表
}
```

### 1.5 迁移与重定向策略（避免路由中断）

- 旧 Admin 子页面（如 `/admin/users|products|orders|agents|withdrawals|reports|notifications`）在合并后：
  - 添加临时 307 重定向至新中心页内相应 Tab（`/admin/operations?tab=users` 等）。
  - 保留页面壳 1 个版本周期，提示“路径已迁移”，并提供返回新页面的 CTA。
- Dashboard 内联改造：
  - `profile|wallets|notifications` 保留旧路由并 307 到 `/dashboard#profile|#wallets|#notifications`。
  - 主仪表板增加锚点容器，支持深链接与浏览器返回。
- 导航与面包屑：
  - 更新侧边导航以指向新中心页；旧菜单项标记“已合并”。
- 功能开关：
  - 以环境变量驱动（例如 `NEXT_PUBLIC_FLAGS=operationsCenter,analyticsCenter`），逐步打开新中心页；默认关闭时回退到旧页面。

## 🎯 Phase 2: 后端API整合（模块: 26 → 15）

### 2.1 用户模块整合

```typescript
// 保留 users 模块，删除 user 模块
// users/users.service.ts
export class UsersService {
  // 整合所有用户相关功能
  // 包含原 user 模块的功能
}
```

**迁移与兼容策略**:
- 在 `user/` 控制器层（v1/v2）增加代理，将旧路由代理到 `users` 对应方法；返回 `Deprecation` 响应头与日志。
- 公布迁移窗口（2 个小版本）；窗口期内同时保留 `user/*` 与 `users/*`。
- 在 `packages/shared/src/api-versioning` 内增加枚举与注释，标注弃用的版本与替代路由。

### 2.2 监控模块整合

```typescript
// 新建 monitoring 模块
monitoring/
├── monitoring.module.ts
├── monitoring.service.ts (整合 logs + audit + alerts + performance)
├── monitoring.controller.ts
└── dto/
```

**删除模块**:
- `logs/`
- `audit/`
- `alerts/`
- `performance/`

**迁移与兼容策略**:
- 第一阶段仅新增 `monitoring` 门面（facade），内部注入现有 `logs|audit|alerts|performance` 服务，不立刻删除旧模块。
- 将通用拦截器（`common/interceptors/monitoring.interceptor.ts`）与日志模块（`common/logger/*`）、指标模块（`common/metrics/*`）透出到 `monitoring`，提供统一 API。
- 第二阶段将旧模块对外控制器路由标记为弃用，返回 `Deprecation` 响应头；新增路由以 `/monitoring/*` 暴露。
- 第三阶段（灰度完成后）移除旧模块导出与控制器。

### 2.3 金融模块整合

```typescript
// 新建 finance 模块
finance/
├── finance.module.ts
├── services/
│   ├── orders.service.ts
│   ├── positions.service.ts
│   ├── transactions.service.ts (整合 payouts + withdrawals)
│   └── commissions.service.ts
└── controllers/
```

**整合内容**:
- `payouts` + `withdrawals` → `transactions.service.ts`
- 保持 orders、positions、commissions 独立但在同一模块

**迁移与兼容策略**:
- 在 `finance` 中新增 `transactions.controller.ts`，统一 `payouts/withdrawals` 能力，并保留旧路由代理与 `Deprecation` 头。
- DTO/权限守卫沿用原模块，先以 re-export 方式暴露；逐步合并为 `finance/dto`。
- 前端 API 调用点先切换到 `finance/*`，旧端点保留 1 个小版本周期。

## 🎯 Phase 3: 组件库优化（组件: 53 → 30）

### 3.1 创建高级通用组件

```typescript
// components/core/DataTable.tsx
export function DataTable<T>({
  data,
  columns,
  actions,
  filters,
  pagination
}: DataTableProps<T>) {
  // 统一所有表格展示逻辑
}

// components/core/FormBuilder.tsx
export function FormBuilder({
  schema,
  onSubmit,
  validation
}: FormBuilderProps) {
  // 动态表单生成器
}

// components/core/EntityManager.tsx
export function EntityManager<T>({
  entityType,
  permissions,
  customActions
}: EntityManagerProps<T>) {
  // 通用 CRUD 管理界面
}
```

**落地与替换策略**:
- 第一步仅在新中心页内使用这些通用组件包装现有功能组件，保证 UI 行为一致。
- 第二步逐步替换旧的分散表格/表单/CRUD 组件，建立统一样式与交互规范。
- 建立组件基准测试（渲染性能/交互延迟），保障替换不退化。

### 3.2 整合业务组件

**整合前**:
```
components/
├── payments/
├── payouts/
├── positions/
├── products/
└── wallet/
```

**整合后**:
```
components/
└── business/
    ├── TransactionFlow.tsx (整合 payments + payouts)
    ├── PortfolioManager.tsx (整合 positions + products)
    └── WalletManager.tsx
```

**增量替换策略**:
- 先在新页面路由内引入 `business/*` 组件，保持旧页面继续可用。
- 为 `TransactionFlow` 提供 `payments/payouts` 兼容适配层，避免一次性替换 API。

## 🎯 Phase 4: 数据与状态管理优化

### 4.1 统一数据获取层

```typescript
// hooks/useEntityData.ts
export function useEntityData<T>(
  entityType: EntityType,
  filters?: FilterOptions
) {
  // 通用数据获取逻辑
  // 自动缓存、分页、错误处理
}

// hooks/useAnalytics.ts
export function useAnalytics(
  metricType: MetricType,
  dateRange: DateRange
) {
  // 统一分析数据获取
  // 实时更新、聚合计算
}
```

**实施细节**:
- 基于 `@tanstack/react-query` 封装，统一错误边界与重试策略；对接后端 `/monitoring/*` 与 `/finance/*` 新端点。
- 先覆盖 1-2 个典型页面（如 `admin/analytics`、`dashboard/reports`），再推广全站。

### 4.2 Mock数据清理

```typescript
// services/mock/MockService.ts (仅开发环境)
class MockService {
  private static instance: MockService;
  
  // 集中管理所有 mock 数据
  // 使用 MSW 拦截请求
  // 生产环境自动禁用
}

// 删除所有硬编码的 mockData 常量
// 删除所有内联的假数据
```

**说明**: 当前仓库未采用集中 Mock；建议新增 `apps/web/services/mock` + MSW，仅在开发模式启动。

## 🎯 Phase 5: 测试架构优化

### 5.1 测试文件重组

```
tests/
├── unit/
│   ├── components/    # 组件单元测试
│   ├── services/      # 服务单元测试
│   └── utils/         # 工具函数测试
├── integration/
│   ├── api/           # API集成测试
│   └── workflows/     # 业务流程测试
├── e2e/
│   ├── critical/      # 关键路径测试
│   └── regression/    # 回归测试
└── fixtures/          # 测试数据
```

### 5.2 测试覆盖率目标

| 类型 | 当前 | 目标 | 说明 |
|------|------|------|------|
| 单元测试 | 45% | 100% | 核心业务逻辑 |
| 集成测试 | 30% | 100% | API端点 |
| E2E测试 | 60% | 100% | 关键用户流程 |

## 🎯 Phase 6: 配置与构建优化

### 6.1 配置文件整合

```javascript
// 根目录统一配置
.eslintrc.shared.js    // 共享ESLint规则
tsconfig.base.json     // 基础TypeScript配置
.env.schema            // 环境变量模式
```

**实施细节**:
- 新增根级 `tsconfig.base.json` 并让各 package 的 `tsconfig.json` 通过 `extends` 继承。
- 新增根级 ESLint 配置并通过 `overrides` 区分前端/后端规则集。

### 6.2 构建优化策略

```javascript
// next.config.js 优化
module.exports = {
  // 代码分割
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        priority: 10
      }
    }
  },
  
  // 懒加载
  // 使用动态 import 语法与现有 splitChunks，不单独配置 dynamicImports 字段
  
  // 图片优化
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60
  }
}
```

## 📈 预期成果

### 数量指标

| 指标 | 当前 | 目标 | 改善 |
|------|------|------|------|
| 前端页面 | 30 | 15 | -50% |
| API模块 | 26 | 15 | -42% |
| 组件文件 | 53 | 30 | -43% |
| 代码行数 | ~50k | ~30k | -40% |
| Mock数据点 | 122 | 0 | -100% |

### 性能指标

| 指标 | 当前 | 目标 | 改善 |
|------|------|------|------|
| 首次加载(FCP) | 2.1s | 1.2s | -43% |
| 完全加载(LCP) | 3.5s | 2.0s | -43% |
| 构建时间 | 45s | 30s | -33% |
| 打包体积 | 1.8MB | 1.0MB | -44% |
| 内存占用 | 180MB | 120MB | -33% |

### 质量指标

| 指标 | 当前 | 目标 |
|------|------|------|
| 代码复用率 | 35% | 75% |
| 测试覆盖率 | 45% | 85% |
| TypeScript覆盖 | 80% | 100% |
| 可访问性评分 | 78 | 95 |

## 🛡️ 风险管理与保护措施

### 风险矩阵

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 功能丢失 | 低 | 高 | 功能清单核对、自动化测试 |
| 性能退化 | 低 | 中 | 性能监控、A/B测试 |
| 用户困惑 | 中 | 中 | 用户引导、渐进式发布 |
| 数据丢失 | 极低 | 高 | 备份、事务处理、回滚方案 |

### 保护措施

1. **功能开关 (Feature Flags)**
   ```typescript
   if (featureFlags.useNewOperationsCenter) {
     return <OperationsCenter />
   }
   return <LegacyPages />
   ```
   实现建议：
   - 前端：通过 `NEXT_PUBLIC_FLAGS` 环境变量传入，以逗号分隔；在 `lib/flags.ts` 提供 `isEnabled(flag)` 工具；默认关闭新功能。
   - 后端：通过 `CONFIG_FEATURE_FLAGS` 读取，结合守卫/拦截器决定是否暴露新路由。

2. **灰度发布计划**
   - Week 1: 内部测试（5%用户）
   - Week 2: Beta用户（20%用户）
   - Week 3: 逐步推广（50%用户）
   - Week 4: 全量发布（100%用户）

3. **回滚方案**
   - Git分支保护：保留 `pre-integration` 分支
   - 数据库快照：每日自动备份
   - 配置回滚：一键切换到旧版本
   - API 回滚：移除代理/重定向后保留 tag，可立即回到上一个发布镜像

4. **监控指标**
   - 错误率监控（Sentry）
   - 性能监控（Lighthouse CI）
   - 用户行为分析（Analytics）
   - 实时告警（PagerDuty）
   - 废弃调用监控：统计命中旧端点/旧路由次数，达阈值后发出弃用提醒

### 未覆盖模块的处置与影响评估

- 保留并标注归属：
  - `reports/`（与 `admin/analytics`、`dashboard/reports` 对应）
  - `notifications/`（与前端通知中心对应）
  - `products/`（由 `PortfolioManager` 消费）
  - `agents/`（Admin 运营中心子域）
  - `risk/`（金融域风控，纳入 `finance` 的依赖，不合并）
  - `websocket/`（实时流，供 `logs/monitoring` 与通知使用）
  - `cache/`、`database/`、`blockchain/`、`health/`、`config/`（底座能力，保持独立）

- 影响与措施：
  - 保持模块对外路由/接口不变，逐步在新聚合模块层面复用其服务。
  - 在聚合模块文档中声明依赖清单与生命周期，避免循环依赖。

## 📅 实施时间表

### Week 1 (1月4日 - 1月7日)
- [ ] 创建通用组件库（DataTable/FormBuilder/EntityManager 雏形）
- [ ] 设置功能开关系统（前后端 env + 工具函数）
- [ ] 搭建 Monitoring 门面模块（不移除旧模块）
- [ ] 准备测试环境（集成/端到端骨架）

### Week 2 (1月8日 - 1月11日)
- [ ] Phase 1: 前端页面整合（新增 admin/operations 与 admin/analytics 壳）
- [ ] Phase 2: 后端API整合（新增 finance 与 transactions；保留旧路由代理）
- [ ] Phase 3: 组件库优化（在新页内引入通用组件包装旧组件）
- [ ] 集成测试（为代理/重定向/新端点补充测试）

### Week 3 (1月12日 - 1月15日)
- [ ] Phase 4: 数据层优化（落地 useEntityData/useAnalytics 覆盖 1-2 页）
- [ ] Phase 5: 测试重组（覆盖率门槛与报告）
- [ ] 性能优化（前端 bundle 分析与拆分验证）
- [ ] Beta测试（灰度 20%-50% 用户）

### Week 4 (1月16日 - 1月18日)
- [ ] Phase 6: 配置优化（根级 tsconfig/eslint/env.schema）
- [ ] 问题修复（处理弃用命中与错误日志）
- [ ] 文档更新（迁移指南与 API 版本说明）
- [ ] 正式发布（关闭代理/保留回滚镜像）

## ✅ 完成标准 (Definition of Done)

- [ ] 所有页面整合完成，无功能丢失
- [ ] 测试覆盖率达到85%
- [ ] 性能指标达标（FCP < 1.5s）
- [ ] 无P0/P1级别bug
- [ ] 文档更新完成（迁移指南、API 版本变更、重定向/代理列表）
- [ ] 团队Code Review通过
- [ ] 用户验收测试通过
 - [ ] 3xx 重定向生效并通过 e2e 验证（旧路由→新中心页 Tab/锚点）
 - [ ] API 弃用策略达标（Deprecation 头、日志与命中频次低于阈值）

## 📝 备注

- 每日站会同步进度
- 遇到阻塞立即上报
- 保持与产品团队沟通
- 记录所有架构决策

---

*Last Updated: 2025-09-04*
*Author: QA-App Development Team*
*Status: Planning Phase*