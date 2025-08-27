# 多阶段构建 - Web应用
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat git
RUN corepack enable

# 设置工作目录
WORKDIR /app

# 复制package管理文件
COPY package.json pnpm-lock.yaml* turbo.json ./
COPY apps/web/package.json ./apps/web/
COPY packages/ui/package.json ./packages/ui/
COPY packages/shared/package.json ./packages/shared/

# ===== 开发阶段 =====
FROM base AS development

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 暴露端口
EXPOSE 3000

# 启动开发服务器
CMD ["pnpm", "--filter", "@qa-app/web", "run", "dev"]

# ===== 依赖安装阶段 =====
FROM base AS deps

# 安装生产依赖
RUN pnpm install --prod --frozen-lockfile

# ===== 构建阶段 =====
FROM base AS builder

# 安装所有依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置构建环境变量
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ARG NEXT_PUBLIC_CHAIN_ID
ARG NEXT_PUBLIC_RPC_URL
ARG NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ARG NEXT_PUBLIC_GA_MEASUREMENT_ID
ARG NEXT_PUBLIC_SENTRY_DSN

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WS_URL=$NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_CHAIN_ID=$NEXT_PUBLIC_CHAIN_ID
ENV NEXT_PUBLIC_RPC_URL=$NEXT_PUBLIC_RPC_URL
ENV NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=$NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
ENV NEXT_PUBLIC_GA_MEASUREMENT_ID=$NEXT_PUBLIC_GA_MEASUREMENT_ID
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# 禁用Next.js遥测
ENV NEXT_TELEMETRY_DISABLED=1

# 构建应用
RUN pnpm --filter @qa-app/web run build

# ===== 生产阶段 =====
FROM node:20-alpine AS production

# 创建应用用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置工作目录
WORKDIR /app

# 安装运行时依赖
RUN apk add --no-cache dumb-init curl

# 禁用Next.js遥测
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# 复制公共文件
COPY --from=builder /app/apps/web/public ./apps/web/public

# 设置正确的权限
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 复制构建产物
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

# 切换到非root用户
USER nextjs

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 暴露端口
EXPOSE 3000

# 设置环境变量
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 启动应用
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "apps/web/server.js"]

# 添加构建信息标签
ARG BUILD_VERSION=unknown
ARG BUILD_TIME=unknown
ARG COMMIT_SHA=unknown

LABEL org.opencontainers.image.title="QA App Web"
LABEL org.opencontainers.image.description="Web3固定收益平台前端应用"
LABEL org.opencontainers.image.version=${BUILD_VERSION}
LABEL org.opencontainers.image.created=${BUILD_TIME}
LABEL org.opencontainers.image.revision=${COMMIT_SHA}
LABEL org.opencontainers.image.source="https://github.com/qa-app/qa-app"