#!/usr/bin/env node

/**
 * 验证测试覆盖率是否达到100%
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

// 覆盖率目标
const COVERAGE_TARGET = 100;

// 检查覆盖率报告文件
function checkCoverageReport(reportPath, projectName) {
  if (!fs.existsSync(reportPath)) {
    console.log(chalk.yellow(`⚠️  ${projectName}覆盖率报告不存在: ${reportPath}`));
    console.log(chalk.yellow(`   请先运行: npm run test:cov`));
    return false;
  }

  const coverageData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const total = coverageData.total;

  console.log(chalk.cyan(`\n📊 ${projectName}覆盖率报告:`));
  console.log('─'.repeat(50));

  const metrics = ['statements', 'branches', 'functions', 'lines'];
  let allMet = true;

  metrics.forEach(metric => {
    const coverage = total[metric].pct;
    const covered = total[metric].covered;
    const total_count = total[metric].total;
    const skipped = total[metric].skipped || 0;

    const status = coverage >= COVERAGE_TARGET ? '✅' : '❌';
    const color = coverage >= COVERAGE_TARGET ? chalk.green : chalk.red;

    console.log(
      `${status} ${metric.padEnd(12)}: ${color(coverage.toFixed(2) + '%')} ` +
      `(${covered}/${total_count}${skipped > 0 ? `, ${skipped} skipped` : ''})`
    );

    if (coverage < COVERAGE_TARGET) {
      allMet = false;
    }
  });

  console.log('─'.repeat(50));

  if (allMet) {
    console.log(chalk.green.bold(`✅ ${projectName}已达到100%覆盖率目标！`));
  } else {
    console.log(chalk.red.bold(`❌ ${projectName}未达到100%覆盖率目标`));
  }

  return allMet;
}

// 查找未覆盖的文件
function findUncoveredFiles(coverageDir) {
  const lcovPath = path.join(coverageDir, 'lcov.info');
  
  if (!fs.existsSync(lcovPath)) {
    return [];
  }

  const lcovContent = fs.readFileSync(lcovPath, 'utf8');
  const files = lcovContent.split('SF:');
  const uncoveredFiles = [];

  files.forEach(file => {
    if (!file) return;
    
    const lines = file.split('\n');
    const filename = lines[0];
    
    let totalLines = 0;
    let coveredLines = 0;

    lines.forEach(line => {
      if (line.startsWith('DA:')) {
        const [lineNum, hitCount] = line.substring(3).split(',');
        totalLines++;
        if (parseInt(hitCount) > 0) {
          coveredLines++;
        }
      }
    });

    const coverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 100;
    
    if (coverage < 100) {
      uncoveredFiles.push({
        file: filename,
        coverage: coverage.toFixed(2)
      });
    }
  });

  return uncoveredFiles;
}

// 主函数
async function main() {
  console.log(chalk.blue.bold('\n🔍 验证测试覆盖率\n'));
  console.log('='.repeat(50));

  const results = [];

  // 检查API层覆盖率
  const apiCoveragePath = path.join(__dirname, '../apps/api/coverage/coverage-summary.json');
  const apiResult = checkCoverageReport(apiCoveragePath, 'API层');
  results.push(apiResult);

  // 检查Web层覆盖率
  const webCoveragePath = path.join(__dirname, '../apps/web/coverage/coverage-summary.json');
  const webResult = checkCoverageReport(webCoveragePath, 'Web层');
  results.push(webResult);

  // 查找未完全覆盖的文件
  console.log(chalk.cyan('\n📝 未完全覆盖的文件:'));
  console.log('─'.repeat(50));

  const apiUncovered = findUncoveredFiles(path.join(__dirname, '../apps/api/coverage'));
  const webUncovered = findUncoveredFiles(path.join(__dirname, '../apps/web/coverage'));

  if (apiUncovered.length > 0) {
    console.log(chalk.yellow('\nAPI层:'));
    apiUncovered.forEach(({ file, coverage }) => {
      console.log(`  ${chalk.red('•')} ${file} (${coverage}%)`);
    });
  }

  if (webUncovered.length > 0) {
    console.log(chalk.yellow('\nWeb层:'));
    webUncovered.forEach(({ file, coverage }) => {
      console.log(`  ${chalk.red('•')} ${file} (${coverage}%)`);
    });
  }

  if (apiUncovered.length === 0 && webUncovered.length === 0) {
    console.log(chalk.green('所有文件都已达到100%覆盖率！'));
  }

  // 总结
  console.log('\n' + '='.repeat(50));
  
  const allPassed = results.every(r => r !== false);
  
  if (allPassed) {
    console.log(chalk.green.bold('\n🎉 恭喜！所有项目都已达到100%测试覆盖率！\n'));
    
    // 生成徽章
    console.log(chalk.blue('📛 覆盖率徽章:'));
    console.log('[![Coverage Status](https://img.shields.io/badge/coverage-100%25-brightgreen.svg)](./coverage/index.html)');
    
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n⚠️  部分项目未达到100%覆盖率目标\n'));
    console.log(chalk.yellow('建议:'));
    console.log('1. 运行 npm run test:cov 查看详细覆盖率报告');
    console.log('2. 为未覆盖的代码编写测试');
    console.log('3. 检查是否有不必要的代码可以删除');
    
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error(chalk.red('错误:'), error);
  process.exit(1);
});
