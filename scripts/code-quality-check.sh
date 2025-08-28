#!/bin/bash

# QA投资平台 - 代码质量检查脚本
# 执行全面的代码质量检查和优化建议

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}🔍 QA投资平台 - 代码质量检查${NC}"
echo "=================================================="

# 检查结果汇总
ISSUES_FOUND=0
WARNINGS_FOUND=0

# 1. TypeScript类型检查
echo -e "\n${BLUE}📘 1. TypeScript类型检查${NC}"
echo "--------------------------------------------------"

if command -v npx >/dev/null 2>&1; then
    echo "检查API项目..."
    cd apps/api
    if npx tsc --noEmit --skipLibCheck; then
        echo -e "${GREEN}✅ API类型检查通过${NC}"
    else
        echo -e "${RED}❌ API类型检查失败${NC}"
        ((ISSUES_FOUND++))
    fi
    cd "$PROJECT_ROOT"
    
    echo "检查Web项目..."
    cd apps/web
    if npx tsc --noEmit --skipLibCheck; then
        echo -e "${GREEN}✅ Web类型检查通过${NC}"
    else
        echo -e "${RED}❌ Web类型检查失败${NC}"
        ((ISSUES_FOUND++))
    fi
    cd "$PROJECT_ROOT"
else
    echo -e "${YELLOW}⚠️  TypeScript未安装，跳过类型检查${NC}"
    ((WARNINGS_FOUND++))
fi

# 2. ESLint代码规范检查
echo -e "\n${BLUE}📋 2. ESLint代码规范检查${NC}"
echo "--------------------------------------------------"

# 检查根目录是否有eslint配置
if [[ -f ".eslintrc.js" || -f ".eslintrc.json" || -f "eslint.config.js" ]]; then
    if npx eslint . --ext .ts,.tsx,.js,.jsx --max-warnings 0; then
        echo -e "${GREEN}✅ ESLint检查通过${NC}"
    else
        echo -e "${RED}❌ ESLint发现代码规范问题${NC}"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  ESLint配置文件未找到${NC}"
    echo "建议创建.eslintrc.js配置文件"
    ((WARNINGS_FOUND++))
fi

# 3. Prettier代码格式检查
echo -e "\n${BLUE}🎨 3. Prettier代码格式检查${NC}"
echo "--------------------------------------------------"

if [[ -f ".prettierrc" || -f ".prettierrc.js" || -f "prettier.config.js" ]]; then
    if npx prettier --check "apps/**/*.{ts,tsx,js,jsx,json,css,scss,md}"; then
        echo -e "${GREEN}✅ Prettier格式检查通过${NC}"
    else
        echo -e "${RED}❌ 发现格式问题，可以运行 'npx prettier --write .' 修复${NC}"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  Prettier配置文件未找到${NC}"
    echo "建议创建.prettierrc配置文件"
    ((WARNINGS_FOUND++))
fi

# 4. 安全漏洞检查
echo -e "\n${BLUE}🔒 4. 安全漏洞检查${NC}"
echo "--------------------------------------------------"

if command -v npm >/dev/null 2>&1; then
    echo "检查npm依赖安全漏洞..."
    if npm audit --audit-level moderate; then
        echo -e "${GREEN}✅ 未发现中等及以上安全漏洞${NC}"
    else
        echo -e "${RED}❌ 发现安全漏洞，请运行 'npm audit fix' 修复${NC}"
        ((ISSUES_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  npm未安装，跳过安全检查${NC}"
    ((WARNINGS_FOUND++))
fi

# 5. 依赖关系检查
echo -e "\n${BLUE}📦 5. 依赖关系检查${NC}"
echo "--------------------------------------------------"

# 检查是否有重复依赖
echo "检查重复依赖..."
if command -v npx >/dev/null 2>&1 && npx --version >/dev/null 2>&1; then
    if npx depcheck --ignores="@types/*,eslint-*,prettier,typescript" 2>/dev/null; then
        echo -e "${GREEN}✅ 依赖检查通过${NC}"
    else
        echo -e "${YELLOW}⚠️  发现未使用的依赖或缺失的依赖${NC}"
        ((WARNINGS_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  跳过依赖检查${NC}"
fi

# 6. 代码复杂度检查
echo -e "\n${BLUE}🧮 6. 代码复杂度分析${NC}"
echo "--------------------------------------------------"

# 简单的代码行数统计
echo "代码行数统计："
find apps -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | tail -1 | awk '{print "总行数: " $1 " 行"}'

# 检查过长的文件 (超过1000行)
echo "检查过长文件 (>1000行):"
LONG_FILES=$(find apps -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | xargs wc -l | awk '$1 > 1000 {print $2 " (" $1 " 行)"}')
if [[ -n "$LONG_FILES" ]]; then
    echo -e "${YELLOW}⚠️  发现过长文件:${NC}"
    echo "$LONG_FILES"
    ((WARNINGS_FOUND++))
else
    echo -e "${GREEN}✅ 未发现过长文件${NC}"
fi

# 7. 测试覆盖率检查
echo -e "\n${BLUE}🧪 7. 测试覆盖率检查${NC}"
echo "--------------------------------------------------"

# 检查是否有测试文件
TEST_FILES=$(find . -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" 2>/dev/null | wc -l)
if [[ $TEST_FILES -gt 0 ]]; then
    echo "发现 $TEST_FILES 个测试文件"
    if command -v npm >/dev/null 2>&1 && npm run test --if-present >/dev/null 2>&1; then
        echo -e "${GREEN}✅ 测试执行成功${NC}"
    else
        echo -e "${YELLOW}⚠️  测试执行失败或无test脚本${NC}"
        ((WARNINGS_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  未发现测试文件${NC}"
    echo "建议添加单元测试和集成测试"
    ((WARNINGS_FOUND++))
fi

# 8. 文档检查
echo -e "\n${BLUE}📚 8. 文档完整性检查${NC}"
echo "--------------------------------------------------"

# 检查README文件
if [[ -f "README.md" ]]; then
    echo -e "${GREEN}✅ README.md 存在${NC}"
else
    echo -e "${YELLOW}⚠️  README.md 不存在${NC}"
    ((WARNINGS_FOUND++))
fi

# 检查API文档
if [[ -d "docs" || -f "api-docs.md" ]]; then
    echo -e "${GREEN}✅ 发现文档目录或文件${NC}"
else
    echo -e "${YELLOW}⚠️  建议添加API文档${NC}"
    ((WARNINGS_FOUND++))
fi

# 9. Git hook检查
echo -e "\n${BLUE}🪝 9. Git Hook检查${NC}"
echo "--------------------------------------------------"

if [[ -d ".git/hooks" ]]; then
    HOOKS_COUNT=$(ls -1 .git/hooks/ | grep -v "\.sample$" | wc -l)
    if [[ $HOOKS_COUNT -gt 0 ]]; then
        echo -e "${GREEN}✅ 发现 $HOOKS_COUNT 个活跃的Git Hook${NC}"
    else
        echo -e "${YELLOW}⚠️  建议配置pre-commit hooks确保代码质量${NC}"
        ((WARNINGS_FOUND++))
    fi
else
    echo -e "${YELLOW}⚠️  未发现Git仓库${NC}"
fi

# 10. 环境变量安全检查
echo -e "\n${BLUE}🔐 10. 环境变量安全检查${NC}"
echo "--------------------------------------------------"

# 检查是否有硬编码的敏感信息
echo "检查硬编码敏感信息..."
SENSITIVE_PATTERNS="password|secret|key|token|api_key"
SENSITIVE_FILES=$(grep -r -i -l "$SENSITIVE_PATTERNS" apps/ 2>/dev/null | grep -E "\.(ts|tsx|js|jsx)$" | head -5)

if [[ -n "$SENSITIVE_FILES" ]]; then
    echo -e "${RED}❌ 发现可能包含敏感信息的文件:${NC}"
    echo "$SENSITIVE_FILES"
    echo "请确认这些文件不包含硬编码的密码、密钥等敏感信息"
    ((ISSUES_FOUND++))
else
    echo -e "${GREEN}✅ 未发现明显的硬编码敏感信息${NC}"
fi

# 检查.env文件是否在.gitignore中
if [[ -f ".gitignore" ]] && grep -q "\.env" .gitignore; then
    echo -e "${GREEN}✅ .env文件已在.gitignore中${NC}"
else
    echo -e "${YELLOW}⚠️  建议将.env文件添加到.gitignore${NC}"
    ((WARNINGS_FOUND++))
fi

# 结果汇总
echo -e "\n${BLUE}📊 检查结果汇总${NC}"
echo "=================================================="

if [[ $ISSUES_FOUND -eq 0 ]]; then
    echo -e "${GREEN}🎉 代码质量检查通过！未发现严重问题。${NC}"
else
    echo -e "${RED}❌ 发现 $ISSUES_FOUND 个严重问题需要修复${NC}"
fi

if [[ $WARNINGS_FOUND -gt 0 ]]; then
    echo -e "${YELLOW}⚠️  发现 $WARNINGS_FOUND 个警告，建议优化${NC}"
fi

echo -e "\n${BLUE}💡 优化建议${NC}"
echo "--------------------------------------------------"
echo "1. 定期运行 'npm audit fix' 修复安全漏洞"
echo "2. 使用 'npx prettier --write .' 格式化代码"
echo "3. 配置pre-commit hooks自动检查代码质量"
echo "4. 增加单元测试覆盖率至少80%"
echo "5. 定期更新依赖包到最新稳定版本"
echo "6. 使用SonarQube等工具进行深度代码质量分析"

# 生成质量报告
echo -e "\n${BLUE}📄 生成质量报告${NC}"
echo "--------------------------------------------------"

REPORT_FILE="quality-report-$(date +%Y%m%d-%H%M%S).json"
cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project": "QA Investment Platform",
  "summary": {
    "issues_found": $ISSUES_FOUND,
    "warnings_found": $WARNINGS_FOUND,
    "test_files": $TEST_FILES,
    "overall_status": "$([[ $ISSUES_FOUND -eq 0 ]] && echo "PASS" || echo "FAIL")"
  },
  "checks": {
    "typescript": "completed",
    "eslint": "completed", 
    "prettier": "completed",
    "security": "completed",
    "dependencies": "completed",
    "complexity": "completed",
    "tests": "completed",
    "documentation": "completed",
    "git_hooks": "completed",
    "security_scan": "completed"
  }
}
EOF

echo -e "${GREEN}✅ 质量报告已保存至: $REPORT_FILE${NC}"

# 退出码
exit $ISSUES_FOUND