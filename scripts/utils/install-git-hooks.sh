#!/bin/bash

# QA投资平台 - Git Hooks安装脚本
# 自动安装代码质量检查的Git钩子

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo -e "${BLUE}🪝 安装Git Hooks - QA投资平台${NC}"
echo "=================================================="

# 检查是否在Git仓库中
if [[ ! -d "$PROJECT_ROOT/.git" ]]; then
    echo -e "${RED}❌ 错误: 未检测到Git仓库${NC}"
    exit 1
fi

# 创建hooks目录
mkdir -p "$HOOKS_DIR"

# 1. Pre-commit Hook - 提交前代码质量检查
echo -e "${BLUE}📝 创建pre-commit hook${NC}"
cat > "$HOOKS_DIR/pre-commit" << 'EOF'
#!/bin/bash

# Pre-commit hook for QA Investment Platform
# 提交前自动执行代码质量检查

set -e

echo "🔍 执行pre-commit检查..."

# 获取staged文件
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx)$' || true)

if [[ -z "$STAGED_FILES" ]]; then
    echo "✅ 没有需要检查的文件"
    exit 0
fi

echo "检查文件: $STAGED_FILES"

# 1. TypeScript类型检查
echo "📘 TypeScript类型检查..."
if command -v npx >/dev/null 2>&1; then
    if ! npx tsc --noEmit --skipLibCheck; then
        echo "❌ TypeScript类型检查失败"
        exit 1
    fi
fi

# 2. ESLint检查
echo "📋 ESLint代码规范检查..."
if [[ -f ".eslintrc.js" || -f ".eslintrc.json" ]]; then
    for file in $STAGED_FILES; do
        if ! npx eslint "$file"; then
            echo "❌ ESLint检查失败: $file"
            exit 1
        fi
    done
fi

# 3. Prettier格式检查
echo "🎨 Prettier格式检查..."
if [[ -f ".prettierrc" || -f "prettier.config.js" ]]; then
    for file in $STAGED_FILES; do
        if ! npx prettier --check "$file"; then
            echo "❌ Prettier格式检查失败: $file"
            echo "💡 运行 'npx prettier --write $file' 修复格式问题"
            exit 1
        fi
    done
fi

# 4. 安全检查 - 检查是否包含敏感信息
echo "🔐 安全检查..."
for file in $STAGED_FILES; do
    # 检查是否包含可能的密钥、密码等敏感信息
    if grep -i -E "(password|secret|key|token)\s*=\s*['\"][^'\"]+['\"]" "$file" >/dev/null 2>&1; then
        echo "❌ 安全检查失败: $file 可能包含硬编码的敏感信息"
        echo "💡 请使用环境变量替代硬编码的敏感信息"
        exit 1
    fi
done

# 5. 检查文件大小
echo "📏 文件大小检查..."
for file in $STAGED_FILES; do
    if [[ -f "$file" ]]; then
        file_size=$(wc -l < "$file")
        if [[ $file_size -gt 1000 ]]; then
            echo "⚠️  警告: $file 包含 $file_size 行，建议拆分大文件"
        fi
    fi
done

echo "✅ Pre-commit检查通过"
exit 0
EOF

chmod +x "$HOOKS_DIR/pre-commit"
echo -e "${GREEN}✅ pre-commit hook已安装${NC}"

# 2. Commit-msg Hook - 提交信息格式检查
echo -e "${BLUE}💬 创建commit-msg hook${NC}"
cat > "$HOOKS_DIR/commit-msg" << 'EOF'
#!/bin/bash

# Commit message hook for QA Investment Platform
# 检查提交信息格式

set -e

commit_message_file=$1
commit_message=$(cat "$commit_message_file")

# 提交信息规范:
# - 首行不超过72个字符
# - 格式: type(scope): description
# - type: feat, fix, docs, style, refactor, test, chore
# - scope: api, web, database, etc. (可选)

echo "📝 检查提交信息格式..."

# 检查提交信息是否为空
if [[ -z "${commit_message// }" ]]; then
    echo "❌ 提交信息不能为空"
    exit 1
fi

# 获取第一行
first_line=$(echo "$commit_message" | head -n1)

# 检查第一行长度
if [[ ${#first_line} -gt 72 ]]; then
    echo "❌ 提交信息首行不能超过72个字符 (当前: ${#first_line})"
    echo "当前: $first_line"
    exit 1
fi

# 检查格式 (可选，不强制)
if ! echo "$first_line" | grep -qE '^(feat|fix|docs|style|refactor|test|chore|ci|build|perf)(\([a-z]+\))?: .+'; then
    echo "⚠️  建议使用规范的提交信息格式:"
    echo "   type(scope): description"
    echo "   类型: feat, fix, docs, style, refactor, test, chore, ci, build, perf"
    echo "   示例: feat(api): add user authentication"
    echo "   示例: fix(web): resolve login form validation issue"
    echo ""
    echo "当前提交信息: $first_line"
    echo ""
    echo "是否继续提交? (建议按规范格式修改) [y/N]"
    
    # 在非交互环境中默认接受
    if [[ ! -t 0 ]]; then
        echo "⚠️  非交互环境，跳过格式检查"
        exit 0
    fi
    
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ 提交已取消"
        exit 1
    fi
fi

echo "✅ 提交信息检查通过"
exit 0
EOF

chmod +x "$HOOKS_DIR/commit-msg"
echo -e "${GREEN}✅ commit-msg hook已安装${NC}"

# 3. Pre-push Hook - 推送前最终检查
echo -e "${BLUE}🚀 创建pre-push hook${NC}"
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

# Pre-push hook for QA Investment Platform
# 推送前执行全面测试

set -e

echo "🚀 执行pre-push检查..."

# 获取当前分支
current_branch=$(git rev-parse --abbrev-ref HEAD)
echo "当前分支: $current_branch"

# 检查是否在主分支上
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    echo "⚠️  警告: 正在向主分支推送代码"
    echo "确认推送到主分支? [y/N]"
    
    # 在非交互环境中阻止向主分支推送
    if [[ ! -t 0 ]]; then
        echo "❌ 非交互环境禁止向主分支推送"
        exit 1
    fi
    
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "❌ 推送已取消"
        exit 1
    fi
fi

# 运行测试 (如果存在)
if [[ -f "package.json" ]] && grep -q '"test"' package.json; then
    echo "🧪 运行测试..."
    if ! npm test; then
        echo "❌ 测试失败"
        exit 1
    fi
fi

# 构建检查
if [[ -f "package.json" ]] && grep -q '"build"' package.json; then
    echo "🏗️  构建检查..."
    if ! npm run build; then
        echo "❌ 构建失败"
        exit 1
    fi
fi

# 最后一次代码质量检查
echo "🔍 最终代码质量检查..."
if [[ -x "./scripts/code-quality-check.sh" ]]; then
    if ! ./scripts/code-quality-check.sh; then
        echo "❌ 代码质量检查失败"
        exit 1
    fi
fi

echo "✅ Pre-push检查通过，可以推送"
exit 0
EOF

chmod +x "$HOOKS_DIR/pre-push"
echo -e "${GREEN}✅ pre-push hook已安装${NC}"

# 4. Post-commit Hook - 提交后通知
echo -e "${BLUE}📢 创建post-commit hook${NC}"
cat > "$HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash

# Post-commit hook for QA Investment Platform
# 提交后执行清理和通知

set -e

# 获取最新提交信息
commit_hash=$(git rev-parse --short HEAD)
commit_message=$(git log -1 --pretty=%B)

echo "✅ 提交成功: $commit_hash"
echo "📝 提交信息: $commit_message"

# 可选: 发送通知到Slack/Teams等
# if [[ -n "$WEBHOOK_URL" ]]; then
#     curl -X POST -H 'Content-type: application/json' \
#         --data "{\"text\":\"新提交: $commit_hash - $commit_message\"}" \
#         "$WEBHOOK_URL"
# fi

# 清理临时文件
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

exit 0
EOF

chmod +x "$HOOKS_DIR/post-commit"
echo -e "${GREEN}✅ post-commit hook已安装${NC}"

# 5. 创建hooks配置文件
echo -e "${BLUE}⚙️  创建hooks配置文件${NC}"
cat > "$PROJECT_ROOT/.githooks.config" << 'EOF'
# Git Hooks Configuration for QA Investment Platform
# Git钩子配置文件

# Pre-commit检查开关
ENABLE_TYPE_CHECK=true
ENABLE_ESLINT=true
ENABLE_PRETTIER=true
ENABLE_SECURITY_CHECK=true
ENABLE_FILE_SIZE_CHECK=true

# Commit message检查开关
ENFORCE_COMMIT_FORMAT=false  # 设为true强制执行提交信息格式
MAX_COMMIT_LINE_LENGTH=72

# Pre-push检查开关
ENABLE_TESTS=true
ENABLE_BUILD_CHECK=true
ENABLE_QUALITY_CHECK=true
ALLOW_MAIN_BRANCH_PUSH=false  # 设为true允许直接推送到主分支

# 通知配置
WEBHOOK_URL=""  # Slack/Teams webhook URL
ENABLE_NOTIFICATIONS=false
EOF

echo -e "${GREEN}✅ hooks配置文件已创建${NC}"

# 6. 创建hooks管理脚本
echo -e "${BLUE}🔧 创建hooks管理脚本${NC}"
cat > "$PROJECT_ROOT/scripts/manage-hooks.sh" << 'EOF'
#!/bin/bash

# Git Hooks管理脚本

HOOKS_DIR=".git/hooks"
CONFIG_FILE=".githooks.config"

case "$1" in
    enable)
        echo "启用Git Hooks..."
        chmod +x "$HOOKS_DIR"/*
        echo "✅ Git Hooks已启用"
        ;;
    disable)
        echo "禁用Git Hooks..."
        chmod -x "$HOOKS_DIR"/* 2>/dev/null || true
        echo "✅ Git Hooks已禁用"
        ;;
    status)
        echo "Git Hooks状态:"
        for hook in "$HOOKS_DIR"/*; do
            if [[ -f "$hook" && -x "$hook" ]]; then
                echo "  ✅ $(basename "$hook") - 已启用"
            elif [[ -f "$hook" ]]; then
                echo "  ❌ $(basename "$hook") - 已禁用"
            fi
        done
        ;;
    test)
        echo "测试Git Hooks..."
        if [[ -x "$HOOKS_DIR/pre-commit" ]]; then
            echo "测试pre-commit hook..."
            "$HOOKS_DIR/pre-commit"
        fi
        ;;
    *)
        echo "用法: $0 {enable|disable|status|test}"
        echo "  enable  - 启用所有hooks"
        echo "  disable - 禁用所有hooks"
        echo "  status  - 显示hooks状态"
        echo "  test    - 测试hooks"
        exit 1
        ;;
esac
EOF

chmod +x "$PROJECT_ROOT/scripts/manage-hooks.sh"
echo -e "${GREEN}✅ hooks管理脚本已创建${NC}"

echo ""
echo -e "${BLUE}📋 安装完成总结${NC}"
echo "=================================================="
echo -e "${GREEN}✅ 已安装的Git Hooks:${NC}"
echo "  • pre-commit  - 提交前代码质量检查"
echo "  • commit-msg  - 提交信息格式检查"
echo "  • pre-push    - 推送前最终检查"
echo "  • post-commit - 提交后清理和通知"
echo ""
echo -e "${BLUE}💡 使用方法:${NC}"
echo "  • 修改配置: 编辑 .githooks.config"
echo "  • 管理hooks: ./scripts/manage-hooks.sh {enable|disable|status|test}"
echo "  • 跳过检查: git commit --no-verify (不推荐)"
echo ""
echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo "  • 首次运行可能需要安装依赖: npm install"
echo "  • 确保项目根目录有 .eslintrc.js 和 .prettierrc"
echo "  • hooks会自动运行，无需手动执行"
echo ""
echo -e "${GREEN}🎉 Git Hooks安装成功！${NC}"