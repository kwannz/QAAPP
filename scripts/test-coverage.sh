#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  运行测试覆盖率报告 - 目标 100%${NC}"
echo -e "${GREEN}========================================${NC}"

# 安装依赖
echo -e "\n${YELLOW}📦 安装依赖...${NC}"
pnpm install

# 清理旧的覆盖率报告
echo -e "\n${YELLOW}🧹 清理旧的覆盖率报告...${NC}"
rm -rf apps/api/coverage
rm -rf apps/web/coverage
rm -rf coverage

# 运行API层测试
echo -e "\n${YELLOW}🔬 运行API层单元测试...${NC}"
cd apps/api
npx jest --coverage --coverageReporters=text --coverageReporters=lcov --coverageReporters=html --coverageReporters=json-summary --silent=false

# 检查API覆盖率
API_COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"pct":[0-9.]*' | head -1 | cut -d: -f2)
echo -e "\n${GREEN}API层覆盖率: ${API_COVERAGE}%${NC}"

# 运行Web层测试
echo -e "\n${YELLOW}🔬 运行Web层单元测试...${NC}"
cd ../web
npm test -- --coverage --watchAll=false

# 检查Web覆盖率
if [ -f "coverage/coverage-summary.json" ]; then
  WEB_COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"pct":[0-9.]*' | head -1 | cut -d: -f2)
  echo -e "\n${GREEN}Web层覆盖率: ${WEB_COVERAGE}%${NC}"
fi

# 运行集成测试
echo -e "\n${YELLOW}🔗 运行集成测试...${NC}"
cd ../api
npm run test:e2e

# 生成合并的覆盖率报告
echo -e "\n${YELLOW}📊 生成合并的覆盖率报告...${NC}"
cd ../..
mkdir -p coverage

# 合并覆盖率报告
npx nyc merge apps/api/coverage coverage/merged.json
npx nyc report --reporter=html --reporter=text --reporter=json-summary --report-dir=coverage

# 显示总体覆盖率
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  测试覆盖率总结${NC}"
echo -e "${GREEN}========================================${NC}"

if [ -f "coverage/coverage-summary.json" ]; then
  TOTAL_COVERAGE=$(cat coverage/coverage-summary.json | grep -o '"pct":[0-9.]*' | head -1 | cut -d: -f2)
  
  if (( $(echo "$TOTAL_COVERAGE >= 100" | bc -l) )); then
    echo -e "${GREEN}✅ 总体覆盖率: ${TOTAL_COVERAGE}% - 已达到100%目标！${NC}"
  else
    echo -e "${YELLOW}⚠️  总体覆盖率: ${TOTAL_COVERAGE}% - 未达到100%目标${NC}"
  fi
fi

# 打开HTML报告
echo -e "\n${YELLOW}📂 打开HTML覆盖率报告...${NC}"
if command -v open &> /dev/null; then
  open coverage/index.html
elif command -v xdg-open &> /dev/null; then
  xdg-open coverage/index.html
else
  echo -e "${YELLOW}请手动打开 coverage/index.html 查看详细报告${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  测试完成！${NC}"
echo -e "${GREEN}========================================${NC}"