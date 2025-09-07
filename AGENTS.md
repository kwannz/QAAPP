# Repository Guidelines | 仓库贡献指南

## Agile Plan & Cadence | 敏捷计划与节奏
- Short cycles: plan → implement → test → review → deploy — 短周期：计划→实现→测试→评审→发布。
- DoD: build passes, 100% coverage on changes, Playwright e2e green, lint/type-check clean, docs updated — 完成标准：构建通过，变更代码100%覆盖率，Playwright e2e 通过，Lint/类型检查无误，文档已更新。
- Keep PRs small; log blockers in issues/docs — PR 小而专注；阻碍请记录在 Issue/文档中。

## Project Structure & Module Organization | 项目结构与模块组织
- Monorepo (pnpm + Turbo) — 单仓多包结构：
  - `apps/api` – NestJS backend — 后端
  - `apps/web` – Next.js (App Router) — 前端
  - `packages/database` – Prisma schema/client — 数据库
  - `packages/contracts` – Hardhat contracts — 合约
  - `packages/shared` – Shared types/utils — 共享类型/工具
  - `packages/ui` – Shared UI — 共享组件库
- Support: `scripts/` automation, `tests/` e2e/fixtures, `.turbo/` cache — 支持目录。

## Build, Test, and Development Commands | 构建、测试与开发命令
- Quick start: `pnpm install && pnpm build && pnpm start` — 快速启动（自动启动 API/Web，若有 PM2 则使用）。
- `pnpm dev` – Run dev servers — 开发模式运行。
- `pnpm build` – Build deps/db/apps — 构建依赖、数据库产物与应用。
- `pnpm test` – Unit tests — 单元测试。
- `pnpm test:e2e` – Playwright e2e (`--headed|--debug`) — 端到端测试。
- `pnpm db:generate|db:push|db:migrate|db:seed` – Prisma — 数据库流程。
- `pnpm blockchain:start` / `blockchain:deploy:local` — 本地链与部署。
- `pnpm stack:up` / `stack:down` — Docker 本地服务编排。

## Coding Style & Naming Conventions
- Language: TypeScript first; 2-space indentation.
- Lint/format: ESLint (`pnpm lint`, `pnpm lint:fix`) and Prettier (`pnpm format`).
- Names: camelCase for variables/functions, PascalCase for types/components, kebab-case for files, `CONSTANT_CASE` for env keys.
- Module layout mirrors feature areas (e.g., `apps/api/src/finance/*`).

## Testing Guidelines | 测试指南
- 100% coverage on changed code — 变更代码需 100% 覆盖率（语句/分支/函数/行）。
- Jest for unit/integration; Playwright for e2e — 单元/集成用 Jest；端到端用 Playwright。
- Tests: `*.spec.ts|*.test.ts` near source or `__tests__` — 测试文件放源附近或 `__tests__`。
- Run: `pnpm test`; filter workspace via `--filter` — 可用 `--filter` 选择包。
- Coverage: `pnpm test:api:coverage`, `pnpm test:web:coverage` — 覆盖率命令。
- E2E requires services up (`pnpm dev` or `pnpm stack:up`) — 先启动服务再跑 e2e。

## Commit & Pull Request Guidelines | 提交与合并请求指南
- Conventional Commits with scope (e.g., `feat(api): ...`) — 使用约定式提交并标注作用域。
- PRs: summary, linked issues, UI screenshots, DB/contract notes — PR 需摘要、关联 Issue、UI 截图与数据库/合约变更说明。
- Ensure: `pnpm build|lint|type-check|test` pass — 本地先通过构建/检查/测试。
- PR checklist — PR 自检清单：
  - [ ] `pnpm --filter @qa-app/web build` passes without suppressed errors — 构建不依赖忽略错误。
  - [ ] 100% coverage on changes; Playwright e2e green — 覆盖率与 e2e 通过。
  - [ ] Lint/type-check clean; no new TODO/FIXME — 代码规范与类型检查通过，无新 TODO。
  - [ ] Docs updated when behavior/structure changes — 变更配套更新文档。

## Agent Startup Review (Required) | Agent 启动检查（必需）
- Read `AGENTS.md`, scan repo (`rg --files`, `rg -n "TODO|FIXME"`) — 阅读本指南并扫描代码库。
- Confirm env: Node ≥ 18.17, pnpm ≥ 10, `.env` ready — 确认运行环境与环境变量文件。
- Share a brief plan; confirm risky/broad changes — 先给出计划，破坏性操作需确认。

## Security & Configuration Tips | 安全与配置提示
- Never commit secrets; copy `.env.example` to `.env` — 机密勿入库，按示例复制配置。
- PostgreSQL by default; `pnpm stack:up` for local services — 本地依赖可用 Docker 编排。
- Verbose logs: `LOG_LEVEL=VERBOSE pnpm dev`; PM2 set `LOG_LEVEL` and use `pnpm pm2:logs` — 本地与 PM2 均可启用详细日志。
- Contracts: record networks, addresses, verification — 合约需记录网络、地址与验证步骤。

## Next.js Guidelines & Fixes | Next.js 指南与修复
- Build checks: lint → type-check → build — 构建前先 Lint 与类型检查。
- App Router: default server components; use `"use client"` minimally — 优先服务端组件，谨慎加客户端指令。
- Config: standalone output + custom `dist`; plan to remove error-ignores — 使用独立产物与自定义目录，后续移除忽略错误配置。
- Images: whitelist domains in `images.domains` — 外链图片需加入白名单。
- React 19 compatibility — 确认依赖兼容 React 19，避免过时 API。

## Agent-Specific Instructions | Agent 专用说明
- Minimal, pattern-aligned changes — 变更最小化并遵循既有模式。
- Prefer workspace-scoped commands/Turbo tasks — 优先使用工作区/ Turbo 任务。
- No unrelated refactors; update docs when structure changes — 禁止无关重构，结构变更需更新文档。
