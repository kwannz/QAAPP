/**
 * 测试专用详细日志记录器
 * Test-specific Verbose Logger for Comprehensive Test Feedback
 * 创建时间: 2025-08-29
 */

import { ConsoleMessage, Page, Request, Response } from '@playwright/test';
import * as fs from 'fs-extra';
import * as path from 'path';

export interface TestLogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'SUCCESS';
  category: 'TEST' | 'BROWSER' | 'NETWORK' | 'PERFORMANCE' | 'SYSTEM' | 'DATABASE' | 'API';
  message: string;
  metadata?: any;
  testName?: string;
  stepNumber?: number;
  duration?: number;
}

export interface TestMetrics {
  testName: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'passed' | 'failed' | 'skipped';
  steps: TestStepMetric[];
  networkRequests: NetworkMetric[];
  consoleMessages: ConsoleMetric[];
  screenshots: string[];
  errors: ErrorMetric[];
  performanceMetrics: PerformanceMetric[];
}

export interface TestStepMetric {
  stepName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'passed' | 'failed';
  screenshot?: string;
  error?: string;
}

export interface NetworkMetric {
  url: string;
  method: string;
  status: number;
  timing: number;
  size: number;
  headers: Record<string, string>;
  timestamp: number;
}

export interface ConsoleMetric {
  type: string;
  text: string;
  timestamp: number;
  url?: string;
  lineNumber?: number;
}

export interface ErrorMetric {
  message: string;
  stack?: string;
  timestamp: number;
  source: 'test' | 'page' | 'network';
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  category: 'timing' | 'memory' | 'network';
}

export class TestLogger {
  private logs: TestLogEntry[] = [];
  private testMetrics: Map<string, TestMetrics> = new Map();
  private logFilePath: string;
  private currentTestName: string = '';
  private currentStepNumber: number = 0;
  private verboseMode: boolean = true;

  constructor(options: {
    outputDir?: string;
    verboseMode?: boolean;
    logLevel?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
  } = {}) {
    const outputDir = options.outputDir || 'test-results/verbose-logs';
    this.verboseMode = options.verboseMode ?? true;
    
    // 确保输出目录存在
    fs.ensureDirSync(outputDir);
    
    // 创建日志文件路径
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.logFilePath = path.join(outputDir, `test-execution-${timestamp}.log`);
    
    this.log('INFO', 'SYSTEM', '🚀 Test Logger initialized', {
      logFile: this.logFilePath,
      verboseMode: this.verboseMode,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 开始测试记录
   */
  startTest(testName: string): void {
    this.currentTestName = testName;
    this.currentStepNumber = 0;
    
    const metrics: TestMetrics = {
      testName,
      startTime: Date.now(),
      status: 'running',
      steps: [],
      networkRequests: [],
      consoleMessages: [],
      screenshots: [],
      errors: [],
      performanceMetrics: []
    };
    
    this.testMetrics.set(testName, metrics);
    
    this.log('INFO', 'TEST', `📋 Starting test: ${testName}`, {
      testName,
      startTime: new Date().toISOString()
    });
  }

  /**
   * 结束测试记录
   */
  endTest(testName: string, status: 'passed' | 'failed' | 'skipped', error?: Error): void {
    const metrics = this.testMetrics.get(testName);
    if (metrics) {
      metrics.endTime = Date.now();
      metrics.duration = metrics.endTime - metrics.startTime;
      metrics.status = status;
      
      if (error) {
        metrics.errors.push({
          message: error.message,
          stack: error.stack,
          timestamp: Date.now(),
          source: 'test'
        });
      }
    }

    const icon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
    this.log(status === 'passed' ? 'SUCCESS' : 'ERROR', 'TEST', 
      `${icon} Test ${status}: ${testName}`, {
        testName,
        status,
        duration: metrics?.duration,
        endTime: new Date().toISOString(),
        error: error?.message
      });
  }

  /**
   * 记录测试步骤
   */
  step(stepName: string): TestStepRecorder {
    this.currentStepNumber++;
    const stepNumber = this.currentStepNumber;
    
    this.log('DEBUG', 'TEST', `🔸 Step ${stepNumber}: ${stepName}`, {
      testName: this.currentTestName,
      stepNumber,
      stepName
    });

    return new TestStepRecorder(this, stepName, stepNumber);
  }

  /**
   * 记录页面控制台消息
   */
  setupPageLogging(page: Page): void {
    page.on('console', (msg: ConsoleMessage) => {
      this.recordConsoleMessage(msg);
    });

    page.on('pageerror', (error) => {
      this.recordError(error.message, error.stack, 'page');
    });

    page.on('request', (request: Request) => {
      this.recordNetworkRequest(request);
    });

    page.on('response', (response: Response) => {
      this.recordNetworkResponse(response);
    });

    this.log('DEBUG', 'BROWSER', '🔧 Page logging configured', {
      testName: this.currentTestName,
      url: page.url()
    });
  }

  /**
   * 记录控制台消息
   */
  private recordConsoleMessage(msg: ConsoleMessage): void {
    const metrics = this.testMetrics.get(this.currentTestName);
    if (metrics) {
      metrics.consoleMessages.push({
        type: msg.type(),
        text: msg.text(),
        timestamp: Date.now(),
        url: msg.location()?.url,
        lineNumber: msg.location()?.lineNumber
      });
    }

    if (this.verboseMode) {
      const level = msg.type() === 'error' ? 'ERROR' : 
                   msg.type() === 'warning' ? 'WARN' : 'DEBUG';
      
      this.log(level, 'BROWSER', `Console ${msg.type()}: ${msg.text()}`, {
        type: msg.type(),
        location: msg.location(),
        testName: this.currentTestName
      });
    }
  }

  /**
   * 记录网络请求
   */
  private recordNetworkRequest(request: Request): void {
    if (this.verboseMode && !request.url().includes('data:') && !request.url().includes('favicon')) {
      this.log('DEBUG', 'NETWORK', `🌐 Request: ${request.method()} ${request.url()}`, {
        method: request.method(),
        url: request.url(),
        headers: request.headers(),
        testName: this.currentTestName
      });
    }
  }

  /**
   * 记录网络响应
   */
  private recordNetworkResponse(response: Response): void {
    const metrics = this.testMetrics.get(this.currentTestName);
    if (metrics) {
      metrics.networkRequests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
        timing: 0, // TODO: 计算实际时间
        size: 0,   // TODO: 获取响应大小
        headers: response.headers(),
        timestamp: Date.now()
      });
    }

    if (this.verboseMode && !response.url().includes('data:') && !response.url().includes('favicon')) {
      const level = response.status() >= 400 ? 'ERROR' : 
                   response.status() >= 300 ? 'WARN' : 'DEBUG';
      
      this.log(level, 'NETWORK', `📡 Response: ${response.status()} ${response.url()}`, {
        status: response.status(),
        statusText: response.statusText(),
        url: response.url(),
        headers: response.headers(),
        testName: this.currentTestName
      });
    }
  }

  /**
   * 记录错误
   */
  recordError(message: string, stack?: string, source: 'test' | 'page' | 'network' = 'test'): void {
    const metrics = this.testMetrics.get(this.currentTestName);
    if (metrics) {
      metrics.errors.push({
        message,
        stack,
        timestamp: Date.now(),
        source
      });
    }

    this.log('ERROR', 'TEST', `💥 Error: ${message}`, {
      message,
      stack,
      source,
      testName: this.currentTestName
    });
  }

  /**
   * 记录性能指标
   */
  recordPerformance(name: string, value: number, unit: 'ms' | 'bytes' | 'count', category: 'timing' | 'memory' | 'network'): void {
    const metrics = this.testMetrics.get(this.currentTestName);
    if (metrics) {
      metrics.performanceMetrics.push({
        name,
        value,
        unit,
        timestamp: Date.now(),
        category
      });
    }

    this.log('INFO', 'PERFORMANCE', `⚡ Performance: ${name} = ${value}${unit}`, {
      name,
      value,
      unit,
      category,
      testName: this.currentTestName
    });
  }

  /**
   * 记录截图
   */
  recordScreenshot(screenshotPath: string): void {
    const metrics = this.testMetrics.get(this.currentTestName);
    if (metrics) {
      metrics.screenshots.push(screenshotPath);
    }

    this.log('DEBUG', 'BROWSER', `📸 Screenshot captured: ${screenshotPath}`, {
      screenshotPath,
      testName: this.currentTestName
    });
  }

  /**
   * 基础日志记录方法
   */
  log(level: TestLogEntry['level'], category: TestLogEntry['category'], message: string, metadata?: any): void {
    const entry: TestLogEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata,
      testName: this.currentTestName,
      stepNumber: this.currentStepNumber || undefined
    };

    this.logs.push(entry);

    // 实时写入文件
    const logLine = this.formatLogEntry(entry);
    fs.appendFileSync(this.logFilePath, logLine + '\n');

    // 控制台输出
    if (this.verboseMode) {
      console.log(logLine);
    }
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(entry: TestLogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const testInfo = entry.testName ? `[${entry.testName}]` : '';
    const stepInfo = entry.stepNumber ? `[Step ${entry.stepNumber}]` : '';
    const metadata = entry.metadata ? ` | ${JSON.stringify(entry.metadata)}` : '';
    
    return `[${timestamp}] ${entry.level} [${entry.category}] ${testInfo}${stepInfo} ${entry.message}${metadata}`;
  }

  /**
   * 获取测试指标
   */
  getTestMetrics(testName?: string): TestMetrics | TestMetrics[] {
    if (testName) {
      return this.testMetrics.get(testName)!;
    }
    return Array.from(this.testMetrics.values());
  }

  /**
   * 生成详细报告
   */
  async generateReport(): Promise<string> {
    const reportPath = path.join(path.dirname(this.logFilePath), 'verbose-test-report.json');
    
    const report = {
      summary: {
        totalTests: this.testMetrics.size,
        passed: Array.from(this.testMetrics.values()).filter(t => t.status === 'passed').length,
        failed: Array.from(this.testMetrics.values()).filter(t => t.status === 'failed').length,
        skipped: Array.from(this.testMetrics.values()).filter(t => t.status === 'skipped').length,
        totalDuration: Array.from(this.testMetrics.values()).reduce((sum, t) => sum + (t.duration || 0), 0),
        totalErrors: Array.from(this.testMetrics.values()).reduce((sum, t) => sum + t.errors.length, 0),
        totalNetworkRequests: Array.from(this.testMetrics.values()).reduce((sum, t) => sum + t.networkRequests.length, 0),
        reportGeneratedAt: new Date().toISOString()
      },
      tests: Array.from(this.testMetrics.values()),
      logs: this.logs
    };

    await fs.writeJSON(reportPath, report, { spaces: 2 });
    
    this.log('INFO', 'SYSTEM', `📊 Report generated: ${reportPath}`, {
      reportPath,
      summary: report.summary
    });

    return reportPath;
  }

  /**
   * 生成Claude Code友好的报告
   */
  async generateClaudeCodeFeedback(): Promise<string> {
    const feedbackPath = path.join(path.dirname(this.logFilePath), 'claude-code-feedback.md');
    
    const metrics = Array.from(this.testMetrics.values());
    const summary = {
      total: metrics.length,
      passed: metrics.filter(t => t.status === 'passed').length,
      failed: metrics.filter(t => t.status === 'failed').length,
      totalDuration: metrics.reduce((sum, t) => sum + (t.duration || 0), 0)
    };

    let feedback = `# 🚀 QA应用系统测试详细报告\n\n`;
    feedback += `**生成时间**: ${new Date().toISOString()}\n\n`;
    
    feedback += `## 📊 测试总览\n\n`;
    feedback += `| 指标 | 数值 |\n`;
    feedback += `|------|------|\n`;
    feedback += `| 总测试数 | ${summary.total} |\n`;
    feedback += `| ✅ 通过 | ${summary.passed} |\n`;
    feedback += `| ❌ 失败 | ${summary.failed} |\n`;
    feedback += `| ⏱️ 总耗时 | ${(summary.totalDuration / 1000).toFixed(2)}秒 |\n`;
    feedback += `| 📈 成功率 | ${summary.total > 0 ? ((summary.passed / summary.total) * 100).toFixed(1) : 0}% |\n\n`;

    if (summary.failed > 0) {
      feedback += `## 🚨 失败测试详情\n\n`;
      metrics.filter(t => t.status === 'failed').forEach(test => {
        feedback += `### ❌ ${test.testName}\n`;
        feedback += `- **耗时**: ${test.duration ? (test.duration / 1000).toFixed(2) : '未知'}秒\n`;
        feedback += `- **错误数**: ${test.errors.length}\n`;
        if (test.errors.length > 0) {
          feedback += `- **主要错误**: ${test.errors[0].message}\n`;
        }
        feedback += `\n`;
      });
    }

    feedback += `## 🔍 系统健康状况\n\n`;
    const totalErrors = metrics.reduce((sum, t) => sum + t.errors.length, 0);
    const totalNetworkRequests = metrics.reduce((sum, t) => sum + t.networkRequests.length, 0);
    const avgResponseTime = totalNetworkRequests > 0 ? 
      metrics.reduce((sum, t) => sum + t.networkRequests.reduce((s, r) => s + r.timing, 0), 0) / totalNetworkRequests : 0;

    feedback += `- **系统错误**: ${totalErrors}个\n`;
    feedback += `- **网络请求**: ${totalNetworkRequests}次\n`;
    feedback += `- **平均响应时间**: ${avgResponseTime.toFixed(2)}ms\n\n`;

    feedback += `## 💡 建议和下一步\n\n`;
    if (summary.failed > 0) {
      feedback += `- 🔧 **优先修复**: ${summary.failed}个失败测试需要立即处理\n`;
    }
    if (totalErrors > 10) {
      feedback += `- ⚠️ **系统稳定性**: 发现${totalErrors}个错误，建议进行系统检查\n`;
    }
    if (avgResponseTime > 1000) {
      feedback += `- 🚀 **性能优化**: 平均响应时间${avgResponseTime.toFixed(2)}ms，建议优化API性能\n`;
    }
    if (summary.passed === summary.total) {
      feedback += `- ✨ **系统状态良好**: 所有测试通过，系统运行正常\n`;
    }

    feedback += `\n## 📋 详细日志\n\n`;
    feedback += `完整的测试日志已保存到: \`${this.logFilePath}\`\n`;
    feedback += `详细JSON报告: \`${path.join(path.dirname(this.logFilePath), 'verbose-test-report.json')}\`\n`;

    await fs.writeFile(feedbackPath, feedback);
    
    this.log('INFO', 'SYSTEM', `📝 Claude Code feedback generated: ${feedbackPath}`, {
      feedbackPath,
      summary
    });

    return feedbackPath;
  }
}

/**
 * 测试步骤记录器
 */
export class TestStepRecorder {
  private startTime: number;
  
  constructor(
    private logger: TestLogger,
    private stepName: string,
    private stepNumber: number
  ) {
    this.startTime = Date.now();
  }

  /**
   * 成功完成步骤
   */
  success(message?: string): void {
    const duration = Date.now() - this.startTime;
    this.logger.recordPerformance(`Step ${this.stepNumber}`, duration, 'ms', 'timing');
    this.logger.log('SUCCESS', 'TEST', 
      `✅ Step ${this.stepNumber} completed: ${this.stepName}${message ? ` - ${message}` : ''}`, {
        stepNumber: this.stepNumber,
        stepName: this.stepName,
        duration,
        status: 'passed'
      });
  }

  /**
   * 步骤失败
   */
  failure(error: string | Error): void {
    const duration = Date.now() - this.startTime;
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'string' ? undefined : error.stack;
    
    this.logger.recordError(errorMessage, errorStack, 'test');
    this.logger.log('ERROR', 'TEST', 
      `❌ Step ${this.stepNumber} failed: ${this.stepName} - ${errorMessage}`, {
        stepNumber: this.stepNumber,
        stepName: this.stepName,
        duration,
        status: 'failed',
        error: errorMessage
      });
  }

  /**
   * 记录步骤信息
   */
  info(message: string, metadata?: any): void {
    this.logger.log('INFO', 'TEST', `ℹ️ Step ${this.stepNumber}: ${message}`, {
      stepNumber: this.stepNumber,
      stepName: this.stepName,
      ...metadata
    });
  }
}

// 全局测试日志实例
export const testLogger = new TestLogger({
  outputDir: 'test-results/verbose-logs',
  verboseMode: process.env.VERBOSE_TESTS === 'true' || process.env.NODE_ENV !== 'production'
});

// 导出便捷方法
export const startTest = (testName: string) => testLogger.startTest(testName);
export const endTest = (testName: string, status: 'passed' | 'failed' | 'skipped', error?: Error) => 
  testLogger.endTest(testName, status, error);
export const step = (stepName: string) => testLogger.step(stepName);
export const setupPageLogging = (page: Page) => testLogger.setupPageLogging(page);
export const recordError = (message: string, stack?: string, source?: 'test' | 'page' | 'network') => 
  testLogger.recordError(message, stack, source);
export const recordPerformance = (name: string, value: number, unit: 'ms' | 'bytes' | 'count', category: 'timing' | 'memory' | 'network') => 
  testLogger.recordPerformance(name, value, unit, category);
export const generateReport = () => testLogger.generateReport();
export const generateClaudeCodeFeedback = () => testLogger.generateClaudeCodeFeedback();