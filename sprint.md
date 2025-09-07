# 敏捷修复计划（Sprint Plan）

## 目标与门禁
- 构建全绿：`pnpm install && pnpm build && pnpm start`
- 质量门禁：变更代码 100% 覆盖率；Playwright e2e 通过
- Lint/TS 严格：恢复构建期间 ESLint 校验（去掉忽略）
- 文档同步：更新 AGENTS.md/README，流程可复现

## 问题清单（分组）
- 构建/配置：typedRoutes 类型约束、动态路由 `params` 签名、PM2 web 启动路径、构建阶段 ESLint 冲突
- 代码质量（web）：未使用 import/变量、import 顺序、缺失逗号/尾空格、嵌套三元、魔法数字、隐式类型转换
- React Hooks：条件调用、依赖缺失、内联函数导致依赖不稳定
- 可访问性：label 关联、空组件自闭合等
- 测试：变更范围单测不足，e2e 补充

## 优先级
- P0：构建/配置稳定、阻塞性 Hooks/类型错误、关键路由
- P1：可维护性与可访问性、日志降噪
- P2：风格类与“警告清零”、typedRoutes 评估

## 迭代拆分（短冲刺）
- Sprint 0（已完成）
  - 修复 PM2 路径与日志、关闭 typedRoutes 影响、解锁构建
- Sprint 1（配置稳态）
  - 收敛 web ESLint 配置，消除插件冲突；将 `next lint` 迁移到 ESLint CLI（package.json）
  - 保持 Hooks 严格；风格类先降为 warning，确保 `pnpm --filter @qa-app/web build` 通过
- Sprint 2（自动修复）
  - 批量移除未使用 import/变量，修正 import/order、尾逗号、尾空格、max-len、console 清理
- Sprint 3（Hooks 与运行时）
  - 修复条件调用、补依赖、上移内联函数；拆解嵌套三元；关键 a11y
  - 去掉 `eslint.ignoreDuringBuilds`，构建在严格模式下通过
- Sprint 4（类型与路由）
  - 统一动态路由 `params` 签名；评估与（必要时）恢复 `typedRoutes`
- Sprint 5（测试与覆盖率）
  - 为变更补单测至 100% 覆盖；启动服务后跑 `pnpm test:e2e` 并补关键场景
- Sprint 6（门禁与文档）
  - 分批将 warning 提升为 error；开启 CI 门禁；更新 AGENTS.md/README

## 验证命令
- 类型/Lint：`pnpm --filter @qa-app/web type-check && pnpm --filter @qa-app/web lint`
- 构建：`pnpm --filter @qa-app/web build`
- 覆盖率：`pnpm test:web:coverage`
- e2e：`pnpm test:e2e`（`--headed`/`--debug` 可选）

## 风险与回滚
- 短期允许少量 P2 警告；严格保留 Hooks/类型
- 小步提交，随时回滚；UI 变更附截图证明
