**Sprint 1 — Consolidated Plan / 冲刺1——整理版计划**

- Objective / 目标: 减少重复、统一入口、分阶段灰度迁移（不改业务行为）。
- Alignment / 对齐: 本计划已对齐 `sprint2-integration-plan.md` 的分期与约束（Operations/Analytics 中心、`monitoring/*` 与 `finance/transactions/*` 迁移、旧路由代理与弃用提示）。
- Epics / 史诗: A) 权限与监控整合，B) 交易整合与灰度，C) 前端 API 客户端与页面整合。
- Iterations / 迭代: A1/A2、B1/B2、C1/C2（详见文末「Comprehensive Optimization Plan / 全面优化计划」）。
- TODO Snapshot / 待办快照: `@Auth` 扩展至 Reports/Notifications [DONE]；统一旧路由弃用头（持续补齐）；观察日志迁移数据；小范围前端 `apiClient` 替换扩展。
- Note / 说明: 下方保留原 Sprint 1 详细内容与历史记录，便于追溯。

**Pre‑Execution Review Gate / 执行前评审闸门（必须先 Review Code First）**
- Review code first / 先审查代码：
  - Scope freeze for the iteration（本迭代范围冻结，避免范围蔓延）。
  - Identify risks, migration blast‑radius（识别风险与迁移影响面）。
  - Confirm authority modules and imports（确认权威入口与导入路径）。
  - Check deprecation headers and shims readiness（检查弃用头/代理是否齐备）。
  - Backup/branch strategy ready（备份/分支策略就绪）。
  - Lint/Build/Test dry‑run（静态检查/构建/测试预跑，允许既有失败但不得新增）。
- Approvals / 审批：获得产品/技术负责人对本迭代改动的书面确认后执行。
- Rollback plan / 回滚：明确对应文件和撤销步骤（git revert/feature flag/路由回退）。

**Sprint 1 Plan**

- **目标**: 审视后端与前端结构，减少重复代码，抽出通用模块，做小而确定的重构，不过度开发；确保可回滚与可验证。

**系统概览**

- **后端**: `apps/api` 为 NestJS 单体应用，按领域模块划分（auth、users、finance、monitoring、database、cache、blockchain 等），具备拦截器/过滤器/缓存/日志/WebSocket/Swagger 等基础设施。数据库层通过 `packages/database`(Prisma + scripts) 提供模型与连接，`packages/shared` 提供通用类型与缓存枚举。
- **前端**: `apps/web` 为 Next.js 应用，通过 `apps/web/components/ui/index.ts` 复用 `@qa-app/ui` 设计系统并补充业务 UI；`packages/ui` 提供原子和业务组件库。

**发现的问题与重复**

- 重复的鉴权守卫/装饰器文件：
  - `apps/api/src/auth/guards/*` 已为标准位置，但仍存在未使用副本：
    - `apps/api/src/auth/jwt-auth.guard.ts`（重复）
    - `apps/api/src/auth/roles.guard.ts`（重复）
    - `apps/api/src/auth/roles.decorator.ts`（弱类型版本，重复）
- 日志配置重复：
  - `apps/api/src/common/logger/winston.config.ts` 已被使用；`logger.config.ts` 为未被引用的冗余实现。
- 数据查询优化模块存在概念重叠：
  - `apps/api/src/database/query-optimizer.service.ts` 与 `apps/api/src/common/database/optimized-queries.service.ts` 都承担“优化查询”职责，但依赖面不同。此项合并价值高但影响面广，推迟到后续 Sprint。

**本次 Sprint 范围（降重 + 模块化最小变更）**

1) 移除未使用的重复文件（已完成）
   - 删除 `auth` 下重复的守卫与装饰器 3 个文件；
   - 删除未使用的 `common/logger/logger.config.ts`，统一以 `winston.config.ts` 为准。

2) 保持导入路径一致性（验证）
   - 全量检索确认控制器均从 `auth/guards/*` 与 `auth/decorators/*` 引入；无遗留旧路径（已验证）。

3) 约定与文档化（新增说明）
   - 约定安全相关统一放于 `auth/guards|decorators|strategies`；
   - 日志配置统一使用 `common/logger/winston.config.ts` 导出的方法与类型。

4) 候选优化（不在本次实施，供下个 Sprint）
   - 合并 Query Optimizer：将 `query-optimizer.service.ts` 能力收敛到 `optimized-queries.service.ts`（或相反），并统一由 `common/database` 对外暴露；
   - 提供 `@Auth(roles?: UserRole[])` 组合装饰器，抽象 `@UseGuards(JwtAuthGuard, RolesGuard)` 与 `@Roles(...)` 的常用组合，减少控制器样板代码；
   - 前端抽出简单的 `apiClient` 封装（基础 fetch + 错误处理 + 类型），减少 `fetch` 重复与字符串路径散落。

**验收标准**

- 构建与测试通过（无新增编译与类型错误）；
- 代码检索无对已删除文件的引用；
- 项目启动行为不变（功能零回归）；
- 目录约定在 README/注释中可被发现与遵循。

**任务清单（Sprint 1）**

- 已完成
  - 移除重复文件：`auth/jwt-auth.guard.ts`、`auth/roles.guard.ts`、`auth/roles.decorator.ts`；
  - 移除未使用日志实现：`common/logger/logger.config.ts`；
  - 全量检索验证引用路径一致性。

- 已追加
  - 在 `common/logger/winston.config.ts` 顶部补充简短注释，标明为“唯一来源”；
  - 在 `apps/api/src/auth/decorators/roles.decorator.ts` 增加 JSDoc，强调 `UserRole` 强类型。

- 下个 Sprint 建议
  - 统一 Query Optimizer 能力（一步到位或分阶段迁移）；
  - 新增 `@Auth()` 组合装饰器并以增量方式替换控制器；
  - `apps/web` 新增极简 `apiClient.ts`（含基础错误提示），逐步替换散落的 `fetch` 调用。

**风险与回滚**

- 本次仅删除未使用文件，风险极低；如遇遗漏引用，可通过 git 恢复文件并修复导入。

**时间估算**

- 清理 + 验证：0.5 天；
- 文档化与注释：0.5 天；
- 预研下一步合并方案：0.5–1 天（不纳入本 Sprint 交付）。

**Sprint 2 Plan**

- 目标: 在不改变业务行为的前提下，继续降重与模块化，统一查询优化入口，减少控制器样板，前端引入最小 API 客户端以消除重复 fetch。

- 范围/任务
  - 查询优化统一化
    - 选定权威入口：以 `apps/api/src/common/database/optimized-queries.service.ts` 为准；对 `apps/api/src/database/query-optimizer.service.ts` 标注弃用注释并添加导向。
    - 在 `common/database` 暴露统一接口；创建轻量 façade（如 `QueryFacade`）用于过渡调用，逐步迁移现有调用点（先 users、monitoring，再 finance）。
    - 保持方法签名与返回结构一致，避免大范围重写测试。
  - 组合鉴权装饰器
    - 新增 `apps/api/src/auth/decorators/auth.decorator.ts`，封装常见组合：`@Auth()` = `@UseGuards(JwtAuthGuard)`，`@Auth(roles)` = `@UseGuards(JwtAuthGuard, RolesGuard)+@Roles(...)`，`@Public()` 继续独立。
    - 在 2–3 个高频控制器中增量替换样板用法（如 config、orders、monitoring 部分路由）。
  - Web API 客户端（最小实现）
    - 新增 `apps/web/lib/apiClient.ts`：基址、超时、错误统一、JSON 解析、轻量类型辅助。
    - 将 `components/payouts/PayoutDashboard.tsx` 的两处 fetch 改为 `apiClient.get/post`；记录后续可替换清单，不做大规模重构。
  - 校验与响应约定（轻量）
    - 将通用 `ValidationPipe` 与响应包装工具聚合在 `apps/api/src/common/pipes` 与 `common/interceptors`，统一从模块导出；不更改现有 DTO 定义。
  - 日志使用统一
    - 在 `LoggerModule` 明确只从 `common/logger/winston.config.ts` 导入；添加 lint/代码搜索检查项（文档化即可），防止重新引入并行配置。

- 非目标
  - 不改动数据库 schema 与业务规则；不清理历史测试里与域行为偏差的断言；不处理 UI 大规模风格问题。

- 验收标准
  - 现有功能与接口不变；
  - 选定的控制器使用 `@Auth` 替换样板代码且行为一致；
  - `optimized-queries` 为唯一对外入口，旧服务文件保留但带弃用标注且无新引用；
  - `PayoutDashboard` 使用 `apiClient`，错误提示与加载逻辑保持一致；
  - 构建、单元测试运行（允许现有失败集保留，但不新增因本次变更导致的失败）。

- 风险与缓解
  - 统一查询入口易引发隐性依赖：先做 façade 和类型对齐，灰度迁移；
  - 组合装饰器易误配：提供使用示例与 e2e 冒烟；
  - Web `apiClient` 引入回归：先局部替换，保留原实现可回滚。

- 时间估算
  - 查询优化统一（第一阶段迁移 3–4 处调用）：1–1.5 天；
  - 组合装饰器 + 局部替换：0.5 天；
  - `apiClient` + 局部替换：0.5 天；
  - 文档与回归验证：0.5 天。

**TODOs (Actionable Checklist)**

- Add `@Auth` decorator: create composite auth decorator and apply to a few admin routes to reduce guard boilerplate. [DONE]
- Update controllers: replace `@UseGuards(JwtAuthGuard, RolesGuard) + @Roles('ADMIN')` with `@Auth('ADMIN')` in Monitoring and Config controllers (admin endpoints only). [DONE]
- Web client usage: switch PayoutDashboard fetches to `apiClient` for consistency and error handling. [DONE]
- Optimizer deprecation: mark `apps/api/src/database/query-optimizer.service.ts` as deprecated and point to `common/database/optimized-queries.service`. [DONE]
- Database barrel export: add an `index.ts` in `common/database` to re-export `OptimizedQueriesService` as the authoritative entry for future imports. [DONE]

---

**Comprehensive Optimization Plan / 全面优化计划（Bilingual）**

Summary / 摘要
- Goal: Reduce duplication, unify modules, and standardize API and UI usage without breaking behaviors. Align with sprint2-integration-plan.md phases and proceed iteratively with clear DoD, metrics, and rollback.
- 目标：在不改变业务行为的前提下，持续降重与统一；对齐 sprint2-integration-plan.md 的分期，采用小步快跑的敏捷方式推进，并设置明确的验收标准、度量与回滚机制。

Guiding Principles / 原则
- Minimal risk, reversible steps / 小步改造、可回滚
- Authority modules and single source of truth / 权威入口与单一来源
- Incremental adoption with shims and deprecations / 通过代理与弃用头灰度迁移
- Keep tests building, don’t expand scope / 保持可构建，不扩范围

Roadmap (High-Level) / 路线图（高层）
- Phase 1 Frontend consolidation (refer sprint2) / 前端整合（参考 Sprint2）
- Phase 2 Backend module unification (monitoring, finance transactions) / 后端整合（监控与交易）
- Phase 3 Design system and business components trimming / 设计系统与业务组件收敛
- Phase 4 Tooling and DX improvements / 工具与开发体验

Metrics / 度量
- Duplicate code ratio ↓, controllers using `@Auth` ↑, fetch→apiClient 替换点数 ↑
- Module count ↓, Deprecated endpoints调用量 ↓（日志监控）

Rollback / 回滚
- 保留旧端点代理 + 返回 `Deprecation` 头；设置灰度窗口；变更可逐步撤销

Integration Constraints (from sprint2-integration-plan.md) / 集成约束
- Admin 端集中到 Operations/Analytics 中心；API 迁移到 `monitoring/*` 与 `finance/transactions/*`；旧路由保持代理与提示。

Epics and Iterations / 史诗与迭代

Epic A: API 权限与监控整合 (1–2 迭代)
- Iteration A1
  - Add `@Auth` decorator and adopt in high-impact controllers (Monitoring, Config, Orders admin, Transactions). [COMPLETED]
  - Mark `query-optimizer.service.ts` deprecated; add `common/database/index.ts` barrel. [COMPLETED]
  - DoD: 构建通过，无新增导入错误；控制器行为无变化；文档更新。
- Iteration A2
  - Expand `@Auth` to additional controllers (Reports, Notifications) incrementally.
  - Add consistent deprecation headers for legacy endpoints (confirm coverage). Log rates for legacy usage.
  - DoD: 覆盖关键管理端路由；弃用调用可见于日志；无功能回归。

Epic B: Finance 交易整合与灰度 (1–2 迭代)
- Iteration B1
  - Ensure `finance/transactions` covers payouts+withdrawals use cases; maintain legacy shims with deprecation headers.
  - Switch a small set of internal service calls to unified TransactionsService.
  - DoD: 新端点可用；旧端点无感；监控到弃用调用。
- Iteration B2
  - Incremental client migration (web/api-client) to `finance/transactions` where applicable.
  - DoD: 客户端少量改点已迁移，无用户可感知差异。

Epic C: Web 前端整合与 API 客户端收敛 (1–2 迭代)
- Iteration C1
  - Replace scattered fetch with `apiClient` in selected components (已在 PayoutDashboard 完成一处)。
  - Introduce minimal `apiClient` helpers for standardization (已存在)。
  - DoD: 新增替换点记录与回滚路径。
- Iteration C2
  - Align with Operations/Analytics centers as per sprint2; add redirects (307) and feature flags scaffolding (document only in this sprint)。
  - DoD: 文档、路由策略与开关方案明确；未执行大改动。

Risks / 风险
- 广域变更导致隐性依赖破裂 → 先 façade/代理迁移 + 日志观测
- 权限装饰器误用 → 提供示例与审批点、冒烟验证

Acceptance / 验收
- 构建与单测可运行（允许现存失败保留，但不新增由本次改动引入的失败）
- 业务行为与响应不变；日志能观测到弃用调用与迁移进度

Execution Log / 执行日志
- Pre‑Execution Review Gate / 执行前评审闸门（Review code first）
  - Scope freeze / 范围冻结：确认按 A2 小范围推进（扩展 `@Auth`、统一弃用头、日志观测），避免范围蔓延。状态：确认。
  - Risks / 风险：中等（隐性依赖、权限装饰器误配）；缓解：façade/代理 + 弃用头灰度、示例与冒烟校验，分步发布。状态：可接受。
  - Authority modules / 权威入口：
    - Auth：`auth/guards/*` 与 `auth/decorators/*`（新增 `auth.decorator.ts`）。
    - Logger：`common/logger/winston.config.ts`（唯一来源）。
    - Database：`common/database/index.ts`（导出 `optimized-queries.service` 为权威）。
    - 已核对本次改动文件导入路径正确。状态：通过。
  - Deprecation & shims / 弃用与代理：
    - Monitoring 旧端点与 Transactions Legacy payouts 端点均返回 `Deprecation` 头；A2 将补齐其余旧端点检查。状态：部分覆盖，计划补齐。
  - Backup/branch / 备份分支：采用最小变更 + 可撤销策略（git revert / 关停新装饰器使用点 / 回退路由），遵循当前环境约束不额外创建分支。状态：可回滚。
  - Lint/Build/Test dry‑run / 预跑：
    - Lint 存在既有 UI 包样式问题；
    - API 构建已通过（修复 lru-cache 类型不兼容与 Deprecated 装饰器类级用法）。
    - Web 类型检查仍有既有 `lib/hooks/usePerformance.ts` 语法问题，与本次改动无关；
    - 后续在提交前对变更范围内用例做冒烟校验。状态：可继续。
  - Approval / 审批：产品/技术负责人（本会话用户）已确认继续推进 A2。状态：通过。
  - Decision / 决策：进入执行阶段 A2（小步替换与统一弃用头）。
- A1: 实现 `@Auth` 装饰器并应用至 Monitoring/Config/Orders(管理员)/Transactions 控制器；新增 DB barrel；标注优化器弃用；PayoutDashboard 使用 apiClient。状态：完成。
- A2: 已执行（第一批）：
   - Reports/Notifications 控制器增量替换为 `@Auth('ADMIN')`（行为与权限不变）；
   - 为旧端点补充 Deprecation 响应头与简单日志：`/payouts/*`、`/finance/withdrawals/*`，引导迁移至 `/finance/transactions/*`；
   - 下一步：补齐其余旧路由的弃用头并持续观测日志数据。
- 追加（第二批）：
  - 统一 LegacyTransactionsController 的权限装饰器为 `@Auth('ADMIN')`；
  - 复核 monitoring 旧端点（logs/audit/alerts/performance）已带弃用头；
  - 状态：完成。
  - 追加（第三批）：
    - AdminController 类级守卫采用 `@Auth()`（方法级 `@Roles('ADMIN')` 保持不变）；
    - ProductsController 管理端接口替换为 `@Auth('ADMIN')`，减少样板代码；
  - 弃用端点日志采用结构化字段（endpoint、timestamp 等），便于汇聚统计；
  - 状态：完成。
  - 追加（第四批）：
    - 在全局监控拦截器中，当响应头包含 `Deprecation` 时，记录弃用端点命中（MetricsService.recordDeprecation）；
    - 新增 `GET /monitoring/deprecations` 接口，返回弃用端点统计（按命中次数降序）；
    - 状态：完成。


Explanation:

**Sync Status / 同步状态**
- Controllers using `@Auth` / 使用 `@Auth` 的控制器：Monitoring（类级）、Config（管理员端）、Orders（管理员端）、Transactions（类级与管理员端）、Reports（管理员端）、Notifications（管理员端）、Risk（管理员端）、Database Optimization（管理员端）、Users（管理员端）、Commissions（管理员端）、Yield-Distribution（管理员端）、Admin（类级 ADMIN，已移除方法级冗余 @Roles）。
- Legacy deprecation headers / 旧端点弃用头：Monitoring logs/audit/alerts/performance（已覆盖）；Payouts（claimable/history/claim，已覆盖）；Withdrawals（列表/统计/详情/更新/批量，已覆盖）。
- Authority exports / 权威导出：`common/database/index.ts` 导出 `optimized-queries.service`；`query-optimizer.service.ts` 已标注弃用。
- Frontend `apiClient` 统一：
  - 已在 `PayoutDashboard` 与 `PortfolioManager` 完成替换点；
  - 新增 Monitoring API 包装（metrics/dashboard/deprecations），Admin 监控页接入 Dashboard + 新增弃用端点统计面板（失败回退至 mock）；新增 Recharts 图表（响应时间、告警、错误率、查询时长对比）。
- 监控页额外接入 `/monitoring/metrics` 并合并关键 KPI（响应时间、缓存命中、查询统计、优化器状态）。
 - 新增 e2e 冒烟用例：验证管理端路由 `GET /users/admin/stats` 守卫行为（无 token 401，管理员 200）。
  - `admin/operations/page.tsx` 关键列表/统计调用替换为 `apiClient`，并对提现列表改用统一 `finance/transactions?type=WITHDRAWAL`；
  - `admin/analytics/page.tsx` 使用 `monitoringApi.getDashboard` 替换 fetch；
  - `components/positions/UserPositions.tsx` 使用 `apiClient` 替换用户持仓查询与赎回；
  - `components/dev/SystemMonitor.tsx` 使用 `monitoringApi` 接入 Dashboard（最小字段映射），保留实时指标 fetch（后续接入 SSE）。
  - `components/dashboard/InvestmentDashboard.tsx` 使用 `apiClient` 并行获取持仓与可领取分红；
  - `components/business/TransactionFlow.tsx` 使用 `apiClient` 获取交易与分红历史。
- The composite `@Auth` decorator consolidates common guard + role patterns, reducing duplication while keeping behavior unchanged.
- Limiting controller changes to high‑impact admin endpoints avoids broad refactors and minimizes risk.
- Using a single `apiClient` centralizes base URL, auth, and error handling, replacing scattered fetch calls incrementally.
- Deprecating the old optimizer clarifies direction without breaking existing code; the barrel export eases gradual adoption.
