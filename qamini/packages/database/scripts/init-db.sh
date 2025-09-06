#!/bin/bash

# 数据库初始化脚本
# 用于开发环境快速设置数据库

set -e

echo "🚀 开始数据库初始化..."

# 检查环境变量
if [ -z "$DATABASE_URL" ]; then
  echo "❌ 错误: DATABASE_URL 环境变量未设置"
  echo "请在 .env 文件中设置 DATABASE_URL"
  exit 1
fi

echo "📋 检查数据库连接..."

# 检查数据库连接
npx prisma db pull --force-reset --preview-feature 2>/dev/null || {
  echo "⚠️  数据库连接失败，尝试创建数据库..."
  
  # 尝试创建数据库（如果不存在）
  DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
  echo "数据库名称: $DB_NAME"
}

echo "🔄 重置数据库..."
npx prisma db push --force-reset --accept-data-loss

echo "📦 执行数据库迁移..."
npx prisma migrate deploy

echo "🌱 运行种子数据..."
npx prisma db seed

echo "🔧 生成Prisma客户端..."
npx prisma generate

echo "✅ 数据库初始化完成！"
echo ""
echo "📊 数据库状态检查:"
npx prisma db status

echo ""
echo "🎯 可用的管理命令:"
echo "  npm run db:studio    # 打开Prisma Studio"
echo "  npm run db:reset     # 重置数据库"
echo "  npm run db:seed      # 重新运行种子数据"
echo "  npm run db:migrate   # 运行新迁移"