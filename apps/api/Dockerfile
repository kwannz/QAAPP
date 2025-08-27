# 多阶段构建 - API服务
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat git python3 make g++
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制package管理文件
COPY package.json pnpm-lock.yaml* turbo.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# ===== 开发阶段 =====
FROM base AS development

# 安装所有依赖(包括devDependencies)
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成Prisma Client
RUN pnpm --filter @qa-app/database run db:generate

# 暴露端口
EXPOSE 3001

# 启动开发服务器
CMD ["pnpm", "--filter", "@qa-app/api", "run", "dev"]

# ===== 构建阶段 =====
FROM base AS builder

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 生成Prisma Client
RUN pnpm --filter @qa-app/database run db:generate

# 构建应用
RUN pnpm --filter @qa-app/api run build

# 清理开发依赖
RUN pnpm install --prod --frozen-lockfile

# ===== 生产阶段 =====
FROM node:20-alpine AS production

# 创建应用用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache dumb-init curl

# 复制构建产物和依赖
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages ./packages
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/

# 创建日志目录
RUN mkdir -p /app/logs && chown -R nestjs:nodejs /app/logs

# 切换到非root用户
USER nestjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# 暴露端口
EXPOSE 3001

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/api/dist/main.js"]

# 添加构建信息标签
ARG BUILD_VERSION=unknown
ARG BUILD_TIME=unknown
ARG COMMIT_SHA=unknown

LABEL org.opencontainers.image.title="QA App API"
LABEL org.opencontainers.image.description="Web3固定收益平台后端API服务"
LABEL org.opencontainers.image.version=${BUILD_VERSION}
LABEL org.opencontainers.image.created=${BUILD_TIME}
LABEL org.opencontainers.image.revision=${COMMIT_SHA}
LABEL org.opencontainers.image.source="https://github.com/qa-app/qa-app"