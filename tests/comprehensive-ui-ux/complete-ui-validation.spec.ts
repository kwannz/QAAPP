import { test, expect, Browser, Page } from '@playwright/test';
import { HomePage } from '../page-objects/HomePage';

/**
 * 完整UI/UX验证测试套件
 * 集成所有UI/UX测试功能，提供全面的网页质量检查
 */

interface TestReport {
  testName: string;
  passed: boolean;
  issues: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
}

interface ComprehensiveReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    score: number;
  };
  categories: {
    functionality: TestReport[];
    usability: TestReport[];
    accessibility: TestReport[];
    performance: TestReport[];
    seo: TestReport[];
  };
  criticalIssues: string[];
  priorityRecommendations: string[];
  overallAssessment: string;
}

class UIValidationReporter {
  private reports: TestReport[] = [];

  addReport(report: TestReport): void {
    this.reports.push(report);
  }

  generateComprehensiveReport(): ComprehensiveReport {
    const passed = this.reports.filter(r => r.passed).length;
    const total = this.reports.length;
    const score = total > 0 ? Math.round((passed / total) * 100) : 0;

    // 分类报告
    const categories = {
      functionality: this.reports.filter(r => 
        r.testName.includes('功能') || r.testName.includes('导航') || r.testName.includes('交互')
      ),
      usability: this.reports.filter(r => 
        r.testName.includes('可用性') || r.testName.includes('用户') || r.testName.includes('界面')
      ),
      accessibility: this.reports.filter(r => 
        r.testName.includes('可访问性') || r.testName.includes('无障碍')
      ),
      performance: this.reports.filter(r => 
        r.testName.includes('性能') || r.testName.includes('加载')
      ),
      seo: this.reports.filter(r => 
        r.testName.includes('SEO') || r.testName.includes('搜索')
      )
    };

    // 收集关键问题
    const criticalIssues: string[] = [];
    const priorityRecommendations: string[] = [];

    this.reports.forEach(report => {
      if (!report.passed) {
        criticalIssues.push(...report.issues);
        priorityRecommendations.push(...report.recommendations);
      }
    });

    // 生成整体评估
    let overallAssessment = '';
    if (score >= 90) {
      overallAssessment = '优秀：网站UI/UX质量很高，只需要微调';
    } else if (score >= 75) {
      overallAssessment = '良好：网站整体质量不错，有一些需要改进的地方';
    } else if (score >= 60) {
      overallAssessment = '中等：网站有明显的UI/UX问题，需要重点优化';
    } else {
      overallAssessment = '需要改进：网站存在严重的用户体验问题，需要全面优化';
    }

    return {
      summary: {
        total,
        passed,
        failed: total - passed,
        score
      },
      categories,
      criticalIssues: [...new Set(criticalIssues)].slice(0, 10),
      priorityRecommendations: [...new Set(priorityRecommendations)].slice(0, 10),
      overallAssessment
    };
  }

  printDetailedReport(report: ComprehensiveReport): void {
    console.log('\n' + '='.repeat(80));
    console.log('🎯 完整UI/UX验证报告');
    console.log('='.repeat(80));
    
    console.log('\n📊 总体得分');
    console.log(`得分: ${report.summary.score}/100`);
    console.log(`通过: ${report.summary.passed}/${report.summary.total} 测试`);
    console.log(`失败: ${report.summary.failed} 测试`);
    
    console.log('\n🎯 整体评估');
    console.log(report.overallAssessment);
    
    console.log('\n📋 分类测试结果');
    Object.entries(report.categories).forEach(([category, tests]) => {
      if (tests.length > 0) {
        const categoryPassed = tests.filter(t => t.passed).length;
        const categoryScore = Math.round((categoryPassed / tests.length) * 100);
        console.log(`\n${this.getCategoryEmoji(category)} ${this.getCategoryName(category)}: ${categoryScore}% (${categoryPassed}/${tests.length})`);
        
        tests.forEach(test => {
          const status = test.passed ? '✅' : '❌';
          console.log(`  ${status} ${test.testName}`);
          if (!test.passed && test.issues.length > 0) {
            test.issues.slice(0, 3).forEach(issue => {
              console.log(`    ⚠️  ${issue}`);
            });
          }
        });
      }
    });
    
    if (report.criticalIssues.length > 0) {
      console.log('\n🚨 关键问题');
      report.criticalIssues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
      });
    }
    
    if (report.priorityRecommendations.length > 0) {
      console.log('\n💡 优先改进建议');
      report.priorityRecommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }

  private getCategoryEmoji(category: string): string {
    const emojis: Record<string, string> = {
      functionality: '🔧',
      usability: '👤',
      accessibility: '♿',
      performance: '⚡',
      seo: '🔍'
    };
    return emojis[category] || '📝';
  }

  private getCategoryName(category: string): string {
    const names: Record<string, string> = {
      functionality: '功能性',
      usability: '可用性',
      accessibility: '可访问性',
      performance: '性能',
      seo: 'SEO优化'
    };
    return names[category] || category;
  }
}

test.describe('🎯 完整UI/UX验证测试套件', () => {
  let homePage: HomePage;
  let reporter: UIValidationReporter;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    reporter = new UIValidationReporter();
  });

  test('🏠 首页完整验证流程', async ({ page }) => {
    console.log('🚀 开始首页完整UI/UX验证...');

    // 导航到首页
    await homePage.navigateToHome();

    // 1. 基础页面元素验证
    console.log('📋 验证页面基础元素...');
    const elementValidation = await homePage.validateHomePageElements();
    reporter.addReport({
      testName: '页面基础元素验证',
      passed: elementValidation.success,
      issues: elementValidation.issues,
      recommendations: elementValidation.success ? [] : [
        '确保所有关键UI元素正确显示',
        '检查导航结构和页面布局'
      ]
    });

    // 2. 导航功能测试
    console.log('🧭 测试导航功能...');
    const navigationTest = await homePage.testNavigation();
    const navigationIssues = navigationTest.results
      .filter(r => !r.success)
      .map(r => `导航失败: ${r.item} - ${r.error}`);
    
    reporter.addReport({
      testName: '导航功能测试',
      passed: navigationTest.success,
      issues: navigationIssues,
      recommendations: navigationTest.success ? [] : [
        '修复导航链接和路由',
        '确保导航项正确跳转到目标页面'
      ]
    });

    // 3. 交互元素测试
    console.log('🖱️ 测试交互元素...');
    const interactionTest = await homePage.testInteractiveElements();
    const interactionIssues = interactionTest.elementTests
      .filter(t => !t.passed)
      .flatMap(t => t.issues.map(issue => `${t.element}: ${issue}`));

    reporter.addReport({
      testName: '交互元素测试',
      passed: interactionTest.success,
      issues: interactionIssues,
      recommendations: interactionTest.success ? [] : [
        '改善按钮和链接的视觉反馈',
        '确保所有交互元素正常工作'
      ]
    });

    // 4. 加载性能测试
    console.log('⚡ 测试加载性能...');
    const performanceTest = await homePage.testLoadingPerformance();
    reporter.addReport({
      testName: '页面加载性能',
      passed: performanceTest.metricsWithinThreshold,
      issues: performanceTest.performanceIssues,
      recommendations: performanceTest.recommendations,
      metrics: {
        loadTime: performanceTest.loadTime,
        threshold: '3000ms'
      }
    });

    // 5. SEO优化验证
    console.log('🔍 验证SEO元素...');
    const seoTest = await homePage.validateSEOElements();
    reporter.addReport({
      testName: 'SEO优化验证',
      passed: seoTest.success,
      issues: seoTest.seoIssues,
      recommendations: seoTest.recommendations
    });

    // 6. 响应式设计测试
    console.log('📱 测试响应式设计...');
    const responsiveBreakpoints = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    const responsiveTest = await homePage.validateResponsiveLayout(responsiveBreakpoints);
    const responsiveIssues = responsiveTest.flatMap(result => 
      result.issues.map(issue => `${result.breakpoint}: ${issue}`)
    );

    reporter.addReport({
      testName: '响应式设计验证',
      passed: responsiveIssues.length === 0,
      issues: responsiveIssues,
      recommendations: responsiveIssues.length > 0 ? [
        '优化响应式布局',
        '确保所有屏幕尺寸下的正确显示'
      ] : []
    });

    // 7. 表单功能验证（如果存在）
    console.log('📝 验证表单功能...');
    const formTest = await homePage.validateFormFunctionality();
    if (formTest.fields.length > 0) {
      const formIssues = formTest.issues;
      reporter.addReport({
        testName: '表单功能验证',
        passed: formTest.valid,
        issues: formIssues,
        recommendations: formTest.valid ? [] : [
          '修复表单验证逻辑',
          '改善表单用户体验'
        ]
      });
    }

    // 8. 用户交互流程测试
    console.log('🎭 测试用户交互流程...');
    const userFlowTest = await homePage.simulateUserInteraction([
      { type: 'scroll', target: 'body' },
      { type: 'hover', target: '按钮' },
      { type: 'wait', duration: 1000 }
    ]);

    reporter.addReport({
      testName: '用户交互流程',
      passed: userFlowTest.success,
      issues: userFlowTest.error ? [userFlowTest.error] : [],
      recommendations: userFlowTest.success ? [] : [
        '优化用户交互流程',
        '确保交互反馈及时准确'
      ]
    });

    // 生成并显示完整报告
    const comprehensiveReport = reporter.generateComprehensiveReport();
    reporter.printDetailedReport(comprehensiveReport);

    // 保存截图作为证据
    await homePage.captureScreenshot('complete-validation', { fullPage: true });

    // 断言：确保整体质量达到最低标准
    expect(comprehensiveReport.summary.score).toBeGreaterThanOrEqual(70);
    
    // 断言：确保没有关键功能性问题
    const functionalityIssues = comprehensiveReport.categories.functionality
      .filter(test => !test.passed).length;
    expect(functionalityIssues).toBeLessThanOrEqual(1);

    console.log(`\n✅ UI/UX验证完成！综合得分: ${comprehensiveReport.summary.score}/100`);
  });

  test('🔧 快速UI健康检查', async ({ page }) => {
    console.log('🩺 执行快速UI健康检查...');

    await homePage.navigateToHome();

    // 快速检查列表
    const quickChecks = [
      {
        name: '页面加载',
        check: async () => {
          const errors = await homePage.checkForErrors();
          return !errors.hasErrors;
        }
      },
      {
        name: '主要元素存在',
        check: async () => {
          const validation = await homePage.validatePage(['导航', '主要内容', '页脚']);
          return validation.success;
        }
      },
      {
        name: '基本交互',
        check: async () => {
          const buttons = page.locator('button').first();
          return await buttons.isVisible();
        }
      }
    ];

    const results: {name: string, passed: boolean}[] = [];

    for (const check of quickChecks) {
      try {
        const passed = await check.check();
        results.push({ name: check.name, passed });
        console.log(`${passed ? '✅' : '❌'} ${check.name}`);
      } catch (error) {
        results.push({ name: check.name, passed: false });
        console.log(`❌ ${check.name}: ${error}`);
      }
    }

    const passedCount = results.filter(r => r.passed).length;
    const healthScore = Math.round((passedCount / results.length) * 100);

    console.log(`\n🏥 UI健康得分: ${healthScore}%`);

    // 健康检查应该全部通过
    expect(healthScore).toBeGreaterThanOrEqual(80);
  });

  test('📊 UI/UX基准测试', async ({ page }) => {
    console.log('📏 执行UI/UX基准测试...');

    await homePage.navigateToHome();

    // 基准测试指标
    const benchmarks = {
      maxLoadTime: 3000,
      maxFirstContentfulPaint: 2000,
      minButtonSize: 44, // 移动端最小点击目标
      maxImageSize: 500000, // 最大图片大小 500KB
    };

    const results: Record<string, {value: number, threshold: number, passed: boolean}> = {};

    // 1. 加载时间基准
    const startTime = Date.now();
    await page.reload();
    await homePage.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    results.loadTime = {
      value: loadTime,
      threshold: benchmarks.maxLoadTime,
      passed: loadTime <= benchmarks.maxLoadTime
    };

    // 2. 性能指标基准
    const metrics = await homePage.getPerformanceMetrics();
    results.firstContentfulPaint = {
      value: metrics.firstContentfulPaint,
      threshold: benchmarks.maxFirstContentfulPaint,
      passed: metrics.firstContentfulPaint <= benchmarks.maxFirstContentfulPaint
    };

    // 3. 移动端可用性基准（按钮大小）
    await page.setViewportSize({ width: 375, height: 667 });
    const smallButtons = await page.evaluate((minSize) => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      return buttons.filter(btn => {
        const rect = btn.getBoundingClientRect();
        return Math.min(rect.width, rect.height) < minSize;
      }).length;
    }, benchmarks.minButtonSize);

    results.buttonSizeCompliance = {
      value: smallButtons,
      threshold: 0,
      passed: smallButtons === 0
    };

    // 打印基准测试结果
    console.log('\n📊 基准测试结果:');
    Object.entries(results).forEach(([metric, result]) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${status} ${metric}: ${result.value} (阈值: ${result.threshold})`);
    });

    const passedBenchmarks = Object.values(results).filter(r => r.passed).length;
    const benchmarkScore = Math.round((passedBenchmarks / Object.keys(results).length) * 100);

    console.log(`\n📈 基准得分: ${benchmarkScore}%`);

    // 基准测试应该达到合理标准
    expect(benchmarkScore).toBeGreaterThanOrEqual(75);
  });
});