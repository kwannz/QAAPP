#!/bin/bash
# QAapp 应用更新脚本
# 零停机更新到 VPS 服务器: 45.76.207.177

set -e  # 遇到错误时退出

# 配置变量
SERVER_IP="45.76.207.177"
APP_DIR="/var/www/qaapp"
BACKUP_DIR="/var/www/qaapp-backup-$(date +%Y%m%d-%H%M%S)"
APP_NAME="qaapp"

echo "🔄 开始更新 QAapp 应用..."
echo "服务器: $SERVER_IP"
echo "应用目录: $APP_DIR"
echo "备份目录: $BACKUP_DIR"
echo "时间: $(date)"

# 颜色输出函数
print_status() {
    echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

print_success() {
    echo -e "\033[1;32m✅ $1\033[0m"
}

print_error() {
    echo -e "\033[1;31m❌ $1\033[0m"
}

print_warning() {
    echo -e "\033[1;33m⚠️ $1\033[0m"
}

# 错误处理函数
rollback() {
    print_error "更新失败，开始回滚..."
    if [ -d "$BACKUP_DIR" ]; then
        print_status "停止当前应用"
        pm2 delete all 2>/dev/null || true
        
        print_status "恢复备份"
        rm -rf $APP_DIR
        mv $BACKUP_DIR $APP_DIR
        
        print_status "重启应用"
        cd $APP_DIR
        pm2 start ecosystem.production.js --env production
        
        print_success "回滚完成，应用已恢复到更新前状态"
    else
        print_error "备份目录不存在，无法自动回滚"
    fi
    exit 1
}

# 设置错误陷阱
trap rollback ERR

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    print_error "请以 root 用户身份运行此脚本"
    exit 1
fi

# 检查应用是否存在
if [ ! -d "$APP_DIR" ]; then
    print_error "应用目录不存在: $APP_DIR"
    print_error "请先运行 deploy.sh 进行首次部署"
    exit 1
fi

# 检查 PM2 进程
print_status "检查当前应用状态"
if ! pm2 list | grep -q "qa-"; then
    print_error "未找到运行中的应用进程"
    print_error "请先运行 deploy.sh 进行首次部署"
    exit 1
fi

pm2 status
print_success "当前应用状态检查完成"

# 创建备份
print_status "创建应用备份"
cp -r $APP_DIR $BACKUP_DIR
print_success "备份创建完成: $BACKUP_DIR"

# 更新代码
print_status "更新应用代码"
cd $APP_DIR

# 如果是本地更新，复制新文件
if [ -d "/Users/zhaoleon/Desktop/QAapp" ]; then
    print_status "从本地同步最新代码"
    
    # 保存重要配置文件
    cp .env.production /tmp/env.production.bak
    cp ecosystem.production.js /tmp/ecosystem.production.bak
    
    # 同步新代码（排除配置文件）
    rsync -av --exclude='.env*' --exclude='ecosystem.*.js' --exclude='node_modules' --exclude='dist' --exclude='.git' /Users/zhaoleon/Desktop/QAapp/ $APP_DIR/
    
    # 恢复配置文件
    mv /tmp/env.production.bak .env.production
    mv /tmp/ecosystem.production.bak ecosystem.production.js
    
    print_success "本地代码同步完成"
else
    # 从 Git 拉取更新
    git fetch origin
    git pull origin main
    print_success "Git 代码更新完成"
fi

# 检查是否有依赖更新
print_status "检查依赖更新"
if [ -f "pnpm-lock.yaml" ]; then
    # 比较 package.json 是否有变化
    if ! diff -q $BACKUP_DIR/package.json $APP_DIR/package.json > /dev/null 2>&1; then
        print_status "检测到依赖变化，更新依赖包"
        pnpm install --frozen-lockfile
        print_success "依赖更新完成"
    else
        print_success "依赖无变化，跳过安装"
    fi
fi

# 检查是否需要数据库迁移
print_status "检查数据库迁移"
export DATABASE_URL="postgresql://qa_user:qa_password@localhost:5432/qa_database?schema=public"

# 生成新的 Prisma 客户端（如果 schema 有变化）
if ! diff -q $BACKUP_DIR/packages/database/prisma/schema.prisma $APP_DIR/packages/database/prisma/schema.prisma > /dev/null 2>&1; then
    print_status "检测到数据库 Schema 变化，更新数据库"
    pnpm run db:generate
    pnpm run db:push
    print_success "数据库更新完成"
else
    print_success "数据库 Schema 无变化，跳过迁移"
fi

# 重新构建应用
print_status "重新构建应用"
NODE_ENV=production pnpm run build
print_success "应用构建完成"

# 执行零停机重启
print_status "执行零停机重启"

# 重启 API 服务
print_status "重启 API 服务"
pm2 reload qa-api --update-env
sleep 5

# 检查 API 是否正常
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    print_success "API 服务重启成功"
else
    print_error "API 服务重启失败"
    rollback
fi

# 重启 Web 服务
print_status "重启 Web 服务"
pm2 reload qa-web --update-env
sleep 5

# 检查 Web 是否正常
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_success "Web 服务重启成功"
else
    print_error "Web 服务重启失败"
    rollback
fi

# 保存 PM2 配置
pm2 save
print_success "PM2 配置保存完成"

# 更新后健康检查
print_status "执行健康检查"

# 等待服务完全启动
sleep 10

# 检查 PM2 进程状态
pm2_api_status=$(pm2 jlist | jq -r '.[] | select(.name=="qa-api") | .pm2_env.status' 2>/dev/null || echo "error")
pm2_web_status=$(pm2 jlist | jq -r '.[] | select(.name=="qa-web") | .pm2_env.status' 2>/dev/null || echo "error")

if [ "$pm2_api_status" = "online" ] && [ "$pm2_web_status" = "online" ]; then
    print_success "所有服务状态正常"
else
    print_error "服务状态异常"
    pm2 status
    rollback
fi

# 检查端口监听
ports=(3000 3001)
for port in "${ports[@]}"; do
    if netstat -tuln | grep ":$port " > /dev/null; then
        print_success "端口 $port 正在监听"
    else
        print_error "端口 $port 未监听"
        rollback
    fi
done

# HTTP 响应检查
print_status "检查 HTTP 响应"

# 检查前端
if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    print_success "前端应用响应正常 (200)"
else
    response_code=$(curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "无响应")
    print_error "前端应用响应异常 ($response_code)"
    rollback
fi

# 检查 API
if curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3001/health | grep -q "200"; then
    print_success "API 应用响应正常 (200)"
else
    response_code=$(curl -f -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "无响应")
    print_error "API 应用响应异常 ($response_code)"
    rollback
fi

# 清理旧备份（保留最近5个）
print_status "清理旧备份"
cd /var/www
ls -t qaapp-backup-* 2>/dev/null | tail -n +6 | xargs rm -rf 2>/dev/null || true
print_success "备份清理完成"

# 重新加载 Nginx（以防配置有更新）
nginx -t && systemctl reload nginx
print_success "Nginx 配置重新加载完成"

# 更新完成信息
print_status "更新完成信息"
echo "🎉 QAapp 更新完成！"
echo ""
echo "📊 当前状态:"
pm2 status
echo ""
echo "🌐 访问地址:"
echo "  - 前端: http://$SERVER_IP"
echo "  - API: http://$SERVER_IP/api"
echo ""
echo "💾 备份信息:"
echo "  - 备份位置: $BACKUP_DIR"
echo "  - 备份时间: $(date)"
echo ""
echo "📝 操作建议:"
echo "  1. 验证应用功能是否正常"
echo "  2. 检查日志是否有异常: pm2 logs"
echo "  3. 确认无误后可删除备份: rm -rf $BACKUP_DIR"
echo ""
echo "🔧 如果发现问题:"
echo "  1. 查看详细日志: pm2 logs --lines 50"
echo "  2. 手动回滚: 停止服务 → 恢复备份 → 重启服务"
echo "  3. 或者重新运行更新脚本"
echo ""
print_success "更新成功完成！"

# 显示版本信息（如果有 package.json）
if [ -f "$APP_DIR/package.json" ]; then
    app_version=$(grep '"version"' $APP_DIR/package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g' | tr -d ' ')
    echo "📦 应用版本: $app_version"
fi

echo "⏰ 更新完成时间: $(date)"