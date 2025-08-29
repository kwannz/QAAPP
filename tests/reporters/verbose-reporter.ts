/**
 * Playwright详细测试报告器
 * Comprehensive Verbose Reporter for Playwright Tests
 * 创建时间: 2025-08-29
 */

import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult, TestStep } from '@playwright/test/reporter';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface VerboseReportData {
  config: {
    rootDir: string;
    testDir: string;
    timeout: number;
    workers: number;
    reporter: string[];
    use: any;
  };
  summary: {
    startTime: number;
    endTime?: number;
    duration?: number;
    totalTests: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    expectedFailures: number;
    unexpectedPasses: number;
    workerErrors: number;
  };
  suites: VerboseSuiteReport[];
  claudeCodeFeedback: string;
  generatedAt: string;
}

export interface VerboseSuiteReport {
  title: string;
  file: string;
  tests: VerboseTestReport[];
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
}

export interface VerboseTestReport {
  title: string;
  fullTitle: string;
  file: string;
  line: number;
  column: number;
  duration: number;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  error?: {
    message: string;
    stack?: string;
    location?: {
      file: string;
      line: number;
      column: number;
    };
  };
  steps: VerboseStepReport[];
  attachments: VerboseAttachment[];
  retries: VerboseTestReport[];
  annotations: any[];
  projectName?: string;
  workerIndex?: number;
  parallelIndex?: number;
}

export interface VerboseStepReport {
  title: string;
  category: string;
  startTime: number;
  duration: number;
  error?: {
    message: string;
    stack?: string;
  };
  steps: VerboseStepReport[];
  attachments: VerboseAttachment[];
}

export interface VerboseAttachment {
  name: string;
  contentType: string;
  path?: string;
  body?: Buffer;
}

export class VerboseReporter implements Reporter {
  private startTime: number = 0;
  private config: FullConfig | null = null;
  private reportData: VerboseReportData;
  private outputPath: string;
  private claudeCodePath: string;

  constructor(options: { outputDir?: string } = {}) {
    const outputDir = options.outputDir || 'test-results/verbose-report';
    fs.ensureDirSync(outputDir);

    this.outputPath = path.join(outputDir, 'verbose-report.json');
    this.claudeCodePath = path.join(outputDir, 'claude-code-feedback.md');

    this.reportData = {
      config: {} as any,
      summary: {
        startTime: 0,
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        flaky: 0,
        expectedFailures: 0,
        unexpectedPasses: 0,
        workerErrors: 0
      },
      suites: [],
      claudeCodeFeedback: '',
      generatedAt: new Date().toISOString()
    };
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.config = config;
    
    this.reportData.config = {
      rootDir: config.rootDir,
      testDir: config.testDir,
      timeout: config.timeout,
      workers: config.workers,
      reporter: config.reporter.map(r => Array.isArray(r) ? r[0] : r),
      use: config.use
    };
    
    this.reportData.summary.startTime = this.startTime;
    this.reportData.summary.totalTests = suite.allTests().length;

    console.log('\n🚀 开始运行测试...');
    console.log(`📊 总测试数: ${this.reportData.summary.totalTests}`);
    console.log(`👥 工作进程数: ${config.workers}`);
    console.log(`⏰ 超时设置: ${config.timeout}ms`);
    console.log(`📁 测试目录: ${config.testDir}`);
    console.log('=' * 80);
  }

  onTestBegin(test: TestCase, result: TestResult): void {
    const fullTitle = test.titlePath().join(' > ');
    console.log(`\n🔸 开始测试: ${fullTitle}`);
    console.log(`   📄 文件: ${test.location.file}:${test.location.line}`);
    console.log(`   💼 项目: ${result.parallelIndex !== undefined ? `Worker ${result.parallelIndex}` : 'Default'}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const fullTitle = test.titlePath().join(' > ');
    const duration = result.duration;
    
    let icon: string;
    let status: string;
    
    switch (result.status) {
      case 'passed':
        icon = '✅';
        status = '通过';
        this.reportData.summary.passed++;
        break;
      case 'failed':
        icon = '❌';
        status = '失败';
        this.reportData.summary.failed++;
        break;
      case 'timedOut':
        icon = '⏰';
        status = '超时';
        this.reportData.summary.failed++;
        break;
      case 'skipped':
        icon = '⏭️';
        status = '跳过';
        this.reportData.summary.skipped++;
        break;
      default:
        icon = '❓';
        status = result.status;
    }

    console.log(`${icon} ${status}: ${fullTitle} (${duration}ms)`);
    
    if (result.error) {
      console.log(`   💥 错误: ${result.error.message}`);
      if (result.error.location) {
        console.log(`   📍 位置: ${result.error.location.file}:${result.error.location.line}`);
      }
    }

    if (result.steps.length > 0) {
      console.log('   📋 测试步骤:');
      this.logSteps(result.steps, '     ');
    }

    if (result.attachments.length > 0) {
      console.log('   📎 附件:');
      result.attachments.forEach(attachment => {
        console.log(`     - ${attachment.name} (${attachment.contentType})`);
      });
    }

    // 记录测试详情
    this.recordTest(test, result);
  }

  private logSteps(steps: TestStep[], indent: string): void {
    steps.forEach((step, index) => {
      const stepIcon = step.error ? '❌' : '✅';
      console.log(`${indent}${index + 1}. ${stepIcon} ${step.title} (${step.duration}ms)`);
      
      if (step.error) {
        console.log(`${indent}   💥 ${step.error.message}`);
      }
      
      if (step.steps.length > 0) {
        this.logSteps(step.steps, indent + '  ');
      }
    });
  }

  private recordTest(test: TestCase, result: TestResult): void {
    const suiteTitle = test.parent.title || test.location.file;
    let suite = this.reportData.suites.find(s => s.title === suiteTitle);
    
    if (!suite) {
      suite = {
        title: suiteTitle,
        file: test.location.file,
        tests: [],
        duration: 0,
        status: 'passed'
      };
      this.reportData.suites.push(suite);
    }

    const verboseTest: VerboseTestReport = {
      title: test.title,
      fullTitle: test.titlePath().join(' > '),
      file: test.location.file,
      line: test.location.line,
      column: test.location.column,
      duration: result.duration,
      status: result.status,
      error: result.error ? {
        message: result.error.message,
        stack: result.error.stack,
        location: result.error.location
      } : undefined,
      steps: this.mapSteps(result.steps),
      attachments: this.mapAttachments(result.attachments),
      retries: result.retry > 0 ? [] : [], // TODO: 记录重试信息
      annotations: test.annotations,
      projectName: result.parallelIndex !== undefined ? `Worker ${result.parallelIndex}` : undefined,
      workerIndex: result.workerIndex,
      parallelIndex: result.parallelIndex
    };

    suite.tests.push(verboseTest);
    suite.duration += result.duration;
    
    if (result.status === 'failed' || result.status === 'timedOut') {
      suite.status = 'failed';
    }
  }

  private mapSteps(steps: TestStep[]): VerboseStepReport[] {
    return steps.map(step => ({
      title: step.title,
      category: step.category,
      startTime: step.startTime.getTime(),
      duration: step.duration,
      error: step.error ? {
        message: step.error.message,
        stack: step.error.stack
      } : undefined,
      steps: this.mapSteps(step.steps),
      attachments: this.mapAttachments(step.attachments)
    }));
  }

  private mapAttachments(attachments: any[]): VerboseAttachment[] {
    return attachments.map(attachment => ({
      name: attachment.name,
      contentType: attachment.contentType,
      path: attachment.path,
      body: attachment.body
    }));
  }

  onEnd(result: FullResult): void {
    this.reportData.summary.endTime = Date.now();
    this.reportData.summary.duration = this.reportData.summary.endTime - this.reportData.summary.startTime;

    console.log('\n' + '=' * 80);
    console.log('🏁 测试完成!');
    console.log('=' * 80);
    
    this.printSummary();
    this.generateReports();
  }

  private printSummary(): void {
    const { summary } = this.reportData;
    
    console.log('\n📊 测试结果统计:');
    console.log(`   ✅ 通过: ${summary.passed}`);
    console.log(`   ❌ 失败: ${summary.failed}`);
    console.log(`   ⏭️ 跳过: ${summary.skipped}`);
    console.log(`   ⏱️ 总耗时: ${((summary.duration || 0) / 1000).toFixed(2)}秒`);
    
    const successRate = summary.totalTests > 0 ? 
      ((summary.passed / summary.totalTests) * 100).toFixed(1) : '0';
    console.log(`   📈 成功率: ${successRate}%`);

    if (summary.failed > 0) {
      console.log('\n🚨 失败的测试:');
      this.reportData.suites.forEach(suite => {
        suite.tests.filter(test => test.status === 'failed' || test.status === 'timedOut').forEach(test => {
          console.log(`   ❌ ${test.fullTitle}`);
          if (test.error) {
            console.log(`      💥 ${test.error.message}`);
          }
        });
      });
    }

    if (summary.passed === summary.totalTests && summary.totalTests > 0) {
      console.log('\n🎉 恭喜! 所有测试都通过了!');
    }
  }

  private async generateReports(): Promise<void> {
    try {
      // 生成JSON报告
      await fs.writeJSON(this.outputPath, this.reportData, { spaces: 2 });
      console.log(`\n📄 详细报告已生成: ${this.outputPath}`);
      
      // 生成Claude Code反馈
      await this.generateClaudeCodeFeedback();
      console.log(`📝 Claude Code反馈已生成: ${this.claudeCodePath}`);
      
      // 生成HTML报告 (可选)
      const htmlPath = this.outputPath.replace('.json', '.html');
      await this.generateHTMLReport(htmlPath);
      console.log(`🌐 HTML报告已生成: ${htmlPath}`);

    } catch (error) {
      console.error('生成报告时出错:', error);
    }
  }

  private async generateClaudeCodeFeedback(): Promise<void> {
    const { summary } = this.reportData;
    
    let feedback = `# 🚀 QA应用Playwright测试详细报告\n\n`;
    feedback += `**生成时间**: ${this.reportData.generatedAt}\n`;
    feedback += `**测试配置**: ${this.reportData.config.workers} workers, ${this.reportData.config.timeout}ms timeout\n\n`;
    
    feedback += `## 📊 执行概要\n\n`;
    feedback += `| 指标 | 数值 | 状态 |\n`;
    feedback += `|------|------|------|\n`;
    feedback += `| 总测试数 | ${summary.totalTests} | - |\n`;
    feedback += `| ✅ 通过 | ${summary.passed} | ${summary.passed === summary.totalTests ? '🎉' : '📝'} |\n`;
    feedback += `| ❌ 失败 | ${summary.failed} | ${summary.failed === 0 ? '✨' : '🚨'} |\n`;
    feedback += `| ⏭️ 跳过 | ${summary.skipped} | - |\n`;
    feedback += `| ⏱️ 总耗时 | ${((summary.duration || 0) / 1000).toFixed(2)}秒 | - |\n`;
    
    const successRate = summary.totalTests > 0 ? 
      ((summary.passed / summary.totalTests) * 100).toFixed(1) : '0';
    feedback += `| 📈 成功率 | ${successRate}% | ${parseFloat(successRate) >= 95 ? '🎯' : parseFloat(successRate) >= 80 ? '⚠️' : '🚨'} |\n\n`;

    if (summary.failed > 0) {
      feedback += `## 🚨 失败分析\n\n`;
      
      this.reportData.suites.forEach(suite => {
        const failedTests = suite.tests.filter(test => test.status === 'failed' || test.status === 'timedOut');
        if (failedTests.length > 0) {
          feedback += `### 📄 ${suite.title}\n\n`;
          
          failedTests.forEach(test => {
            feedback += `#### ❌ ${test.title}\n`;
            feedback += `- **耗时**: ${test.duration}ms\n`;
            feedback += `- **文件**: ${test.file}:${test.line}\n`;
            if (test.error) {
              feedback += `- **错误**: ${test.error.message}\n`;
              if (test.error.location) {
                feedback += `- **位置**: ${test.error.location.file}:${test.error.location.line}\n`;
              }
            }
            
            if (test.steps.length > 0) {
              feedback += `- **失败步骤**:\n`;
              this.addStepsToFeedback(test.steps, feedback, '  ');
            }
            
            feedback += `\n`;
          });
        }
      });
    }

    feedback += `## 🔍 性能分析\n\n`;
    const avgTestDuration = summary.totalTests > 0 ? 
      this.reportData.suites.reduce((sum, s) => sum + s.duration, 0) / summary.totalTests : 0;
    feedback += `- **平均测试耗时**: ${avgTestDuration.toFixed(2)}ms\n`;
    
    const slowTests = this.getAllTests().filter(test => test.duration > 10000);
    if (slowTests.length > 0) {
      feedback += `- **慢测试** (>10秒): ${slowTests.length}个\n`;
      slowTests.slice(0, 5).forEach(test => {
        feedback += `  - ${test.fullTitle}: ${(test.duration / 1000).toFixed(2)}秒\n`;
      });
    }

    feedback += `\n## 📋 测试覆盖\n\n`;
    feedback += `- **测试套件数**: ${this.reportData.suites.length}\n`;
    feedback += `- **平均每套件测试数**: ${(summary.totalTests / this.reportData.suites.length).toFixed(1)}\n`;
    
    const suiteStatus = this.reportData.suites.reduce((acc, suite) => {
      acc[suite.status] = (acc[suite.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(suiteStatus).forEach(([status, count]) => {
      const icon = status === 'passed' ? '✅' : '❌';
      feedback += `- **${icon} ${status}套件**: ${count}个\n`;
    });

    feedback += `\n## 💡 建议和改进\n\n`;
    
    if (summary.failed === 0) {
      feedback += `🎉 **系统状态优秀**: 所有${summary.totalTests}个测试都通过了！\n\n`;
      feedback += `✨ **建议**:\n`;
      feedback += `- 继续保持当前的代码质量\n`;
      feedback += `- 考虑添加更多边界情况测试\n`;
      feedback += `- 定期运行回归测试\n`;
    } else {
      feedback += `🔧 **需要修复**: ${summary.failed}个失败的测试需要立即处理\n\n`;
      feedback += `🎯 **优先级建议**:\n`;
      feedback += `1. 修复失败的核心功能测试\n`;
      feedback += `2. 检查超时测试的性能问题\n`;
      feedback += `3. 更新测试数据和环境配置\n`;
    }

    if (slowTests.length > 0) {
      feedback += `- ⚡ **性能优化**: ${slowTests.length}个测试运行较慢，建议优化\n`;
    }

    if (parseFloat(successRate) < 95) {
      feedback += `- 📈 **提高测试稳定性**: 当前成功率${successRate}%，建议提升到95%以上\n`;
    }

    feedback += `\n## 📁 相关文件\n\n`;
    feedback += `- **详细JSON报告**: \`${this.outputPath}\`\n`;
    feedback += `- **HTML报告**: \`${this.outputPath.replace('.json', '.html')}\`\n`;
    feedback += `- **测试日志**: \`test-results/verbose-logs/\`\n`;

    this.reportData.claudeCodeFeedback = feedback;
    await fs.writeFile(this.claudeCodePath, feedback);
  }

  private addStepsToFeedback(steps: VerboseStepReport[], feedback: string, indent: string): void {
    steps.forEach(step => {
      if (step.error) {
        feedback += `${indent}- ❌ ${step.title}: ${step.error.message}\n`;
      } else {
        feedback += `${indent}- ✅ ${step.title} (${step.duration}ms)\n`;
      }
      
      if (step.steps.length > 0) {
        this.addStepsToFeedback(step.steps, feedback, indent + '  ');
      }
    });
  }

  private getAllTests(): VerboseTestReport[] {
    return this.reportData.suites.flatMap(suite => suite.tests);
  }

  private async generateHTMLReport(htmlPath: string): Promise<void> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QA应用测试报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric-value { font-size: 2em; font-weight: bold; color: #333; }
        .metric-label { color: #666; margin-top: 5px; }
        .content { padding: 0 30px 30px; }
        .suite { margin-bottom: 30px; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
        .suite-header { background: #f8f9fa; padding: 15px; border-bottom: 1px solid #e9ecef; }
        .test { padding: 15px; border-bottom: 1px solid #f8f9fa; }
        .test:last-child { border-bottom: none; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-skipped { color: #6c757d; }
        .error-details { background: #f8d7da; color: #721c24; padding: 10px; border-radius: 4px; margin-top: 10px; font-family: monospace; }
        .steps { margin-top: 10px; padding-left: 20px; }
        .step { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 QA应用测试报告</h1>
            <p>生成时间: ${this.reportData.generatedAt}</p>
        </div>
        
        <div class="summary">
            <div class="metric">
                <div class="metric-value">${this.reportData.summary.totalTests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric">
                <div class="metric-value status-passed">${this.reportData.summary.passed}</div>
                <div class="metric-label">✅ 通过</div>
            </div>
            <div class="metric">
                <div class="metric-value status-failed">${this.reportData.summary.failed}</div>
                <div class="metric-label">❌ 失败</div>
            </div>
            <div class="metric">
                <div class="metric-value">${((this.reportData.summary.duration || 0) / 1000).toFixed(2)}s</div>
                <div class="metric-label">⏱️ 总耗时</div>
            </div>
        </div>

        <div class="content">
            ${this.reportData.suites.map(suite => `
                <div class="suite">
                    <div class="suite-header">
                        <h3>${suite.title}</h3>
                        <small>${suite.file}</small>
                    </div>
                    ${suite.tests.map(test => `
                        <div class="test">
                            <div class="status-${test.status}">
                                ${test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️'} 
                                <strong>${test.title}</strong> 
                                <span>(${test.duration}ms)</span>
                            </div>
                            ${test.error ? `
                                <div class="error-details">
                                    <strong>错误:</strong> ${test.error.message}
                                    ${test.error.location ? `<br><strong>位置:</strong> ${test.error.location.file}:${test.error.location.line}` : ''}
                                </div>
                            ` : ''}
                            ${test.steps.length > 0 ? `
                                <div class="steps">
                                    <strong>测试步骤:</strong>
                                    ${test.steps.map(step => `
                                        <div class="step">
                                            ${step.error ? '❌' : '✅'} ${step.title} (${step.duration}ms)
                                        </div>
                                    `).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile(htmlPath, html);
  }

  printsToStdio(): boolean {
    return true;
  }
}

export default VerboseReporter;