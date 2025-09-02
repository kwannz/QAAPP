## Sprint Board (QAAPP)

### 目标
- 提供一键 `pnpm install`, `pnpm build`, `pnpm start` 的 VPS 部署流
- 统一数据库配置与 PM2 常驻运行
- 跟踪关键缺陷与改进项

### 快速命令
```bash
# 安装依赖
pnpm run setup:vps

# 构建
pnpm run build

# 启动（PM2）
pnpm run pm2:start

# 查看日志
pnpm run pm2:logs

# 停止
pnpm run pm2:stop
```

### 环境变量建议
- DATABASE_URL: PostgreSQL 连接串（生产）
- API_PORT: 3001（默认）
- WEB_PORT: 3002（默认）
- NODE_ENV: production

### 缺陷与风险 ✅ 已解决
- ~~数据库驱动混用：Prisma schema 使用 `sqlite`，但运行脚本与文档多处使用 `PostgreSQL`；需统一。~~ → **已统一为 PostgreSQL**
- ~~`ecosystem.config.js` 将 `DATABASE_URL` 指向 `file:...dev.db`（SQLite），与生产 PG 不一致。~~ → **已修复环境变量读取**
- ~~`start-system.sh` 依赖 `brew services`，不适用于 Linux VPS；应依赖外部服务管理或文档化替代方案。~~ → **已创建 Linux 兼容脚本**
- ~~API 健康检查路径可能不同环境不一致（/health 与根路径）。~~ → **已验证 `/health` 端点统一性**

### 待办（高优先）✅ 已完成
- [x] 将 Prisma `datasource` 统一为 PostgreSQL，并提供迁移脚本
- [x] 更新 `ecosystem.config.js` 默认 `DATABASE_URL` 为 PG 或读取 `.env`
- [x] 在 `scripts/start-production.js` 改为从 `.env` 读取数据库连接
- [x] 为 Linux VPS 增补 Redis/Postgres 安装与服务启动指引
- [x] 补充 Nginx 反代样例（可选）

### 新增功能（简化版）
- [x] 创建 Linux 兼容的 VPS 部署脚本 (`scripts/setup-vps.sh`)
- [x] 简化 `.env.production` 配置 (15行 vs 200+行)
- [x] 移除 Docker 依赖和过度工程化组件
- [x] 添加数据库迁移脚本 (`pnpm db:migrate:prod`)
- [x] 添加简单备份脚本 (`pnpm db:backup`)

### 备注
本文件用于 Claude Code/Sprint 协作，更新请保持简洁列表化。



### 待办建议（后续工作）
- [ ] 将 Prisma `schema.prisma` 的 `datasource provider` 统一为 `postgresql`，生成迁移并在生产执行 `db:migrate:deploy`
- [ ] 在 `DEPLOYMENT.md` 增补 Linux VPS 下 PostgreSQL/Redis 安装与服务管理指引（apt/yum）
- [ ] 统一健康检查：API 固定 `/health`，脚本/PM2 检查点一致
- [ ] 增补反向代理与 TLS 示例（Nginx/Caddy）
- [ ] 提供 `.env.production` 样例与必填环境变量清单
- [ ] 明确备份/恢复流程：`pg_dump`/`psql` 使用示例与频率建议
- [ ] 配置日志轮转：`pm2-logrotate` 与保留策略（可选）
- [ ] 安全加固：Helmet/CSP、Rate limit 默认值、敏感环境变量不入仓库
