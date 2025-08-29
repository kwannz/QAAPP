import { test, expect, Page } from '@playwright/test';

/**
 * UI/UX 演示测试 - 展示全面的UI测试功能
 * 这个简化版本展示了我们创建的UI/UX测试框架的核心功能
 */

interface UIIssue {
  type: 'accessibility' | 'usability' | 'functionality' | 'performance' | 'design';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element?: string;
  description: string;
  recommendation: string;
  location: string;
}

class UITestingFrameworkDemo {
  private issues: UIIssue[] = [];

  constructor(private page: Page) {}

  /**
   * 测试按钮功能和可访问性
   */
  async testButtonFunctionality(): Promise<UIIssue[]> {
    console.log('🔘 测试按钮功能...');
    
    const buttonIssues: UIIssue[] = [];
    const buttons = this.page.locator('button, [role="button"], input[type="submit"], a[href]');
    const buttonCount = await buttons.count();
    
    console.log(`发现 ${buttonCount} 个可交互元素`);

    // 测试前几个按钮
    const testCount = Math.min(buttonCount, 5);
    for (let i = 0; i < testCount; i++) {
      const button = buttons.nth(i);
      
      if (await button.isVisible()) {
        const buttonText = await button.textContent() || `Button ${i + 1}`;
        const ariaLabel = await button.getAttribute('aria-label') || '';
        
        // 检查可访问性
        if (!buttonText.trim() && !ariaLabel.trim()) {
          buttonIssues.push({
            type: 'accessibility',
            severity: 'high',
            element: `Button ${i + 1}`,
            description: '按钮缺少可访问的文本描述',
            recommendation: '添加 aria-label 或文本内容',
            location: `Position ${i + 1}`
          });
        }

        // 检查是否可点击
        const isEnabled = await button.isEnabled();
        if (!isEnabled) {
          buttonIssues.push({
            type: 'usability',
            severity: 'medium',
            element: buttonText.slice(0, 30),
            description: '按钮处于禁用状态',
            recommendation: '确认按钮状态逻辑是否正确',
            location: `Button: ${buttonText.slice(0, 20)}`
          });
        }

        // 测试悬停效果
        try {
          await button.hover({ timeout: 2000 });
          console.log(`✓ 按钮悬停测试通过: "${buttonText.slice(0, 20)}"`);
        } catch (error) {
          console.log(`⚠ 按钮悬停测试失败: "${buttonText.slice(0, 20)}"`);
        }
      }
    }

    this.issues.push(...buttonIssues);
    return buttonIssues;
  }

  /**
   * 测试页面结构和导航
   */
  async testPageStructure(): Promise<UIIssue[]> {
    console.log('🏗️ 测试页面结构...');
    
    const structureIssues: UIIssue[] = [];

    // 检查页面标题
    const title = await this.page.title();
    if (!title || title.length === 0) {
      structureIssues.push({
        type: 'accessibility',
        severity: 'high',
        description: '页面缺少标题',
        recommendation: '添加描述性的页面标题',
        location: 'Document Title'
      });
    } else {
      console.log(`✓ 页面标题: "${title}"`);
    }

    // 检查主要内容区域
    const mainContent = this.page.locator('main, [role="main"]');
    const hasMainContent = await mainContent.isVisible();
    if (!hasMainContent) {
      structureIssues.push({
        type: 'accessibility',
        severity: 'medium',
        description: '页面缺少主要内容区域标记',
        recommendation: '使用 <main> 或 role="main"',
        location: 'Page Structure'
      });
    } else {
      console.log('✓ 主要内容区域存在');
    }

    // 检查导航
    const navigation = this.page.locator('nav, [role="navigation"]');
    const hasNavigation = await navigation.isVisible();
    if (!hasNavigation) {
      structureIssues.push({
        type: 'usability',
        severity: 'medium',
        description: '页面缺少导航结构',
        recommendation: '添加导航菜单',
        location: 'Navigation'
      });
    } else {
      console.log('✓ 导航结构存在');
    }

    this.issues.push(...structureIssues);
    return structureIssues;
  }

  /**
   * 测试响应式布局
   */
  async testResponsiveLayout(): Promise<UIIssue[]> {
    console.log('📱 测试响应式布局...');
    
    const responsiveIssues: UIIssue[] = [];
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      console.log(`📏 测试 ${viewport.name} 视窗...`);
      
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.waitForTimeout(1000); // 等待布局调整

      // 检查水平滚动
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll && viewport.width < 1200) {
        responsiveIssues.push({
          type: 'design',
          severity: 'medium',
          element: 'Page Layout',
          description: `${viewport.name} 视窗出现水平滚动`,
          recommendation: '优化响应式布局',
          location: `Viewport: ${viewport.name}`
        });
      } else {
        console.log(`✓ ${viewport.name} 布局正常`);
      }

      // 截图记录
      await this.page.screenshot({ 
        path: `test-results/screenshots/responsive-${viewport.name.toLowerCase()}.png`,
        fullPage: false
      });
    }

    this.issues.push(...responsiveIssues);
    return responsiveIssues;
  }

  /**
   * 测试加载性能
   */
  async testPerformance(): Promise<UIIssue[]> {
    console.log('⚡ 测试页面性能...');
    
    const performanceIssues: UIIssue[] = [];

    // 测量加载时间
    const startTime = Date.now();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    console.log(`📊 页面加载时间: ${loadTime}ms`);

    if (loadTime > 3000) {
      performanceIssues.push({
        type: 'performance',
        severity: 'high',
        description: `页面加载时间过长: ${loadTime}ms`,
        recommendation: '优化页面加载性能，目标<3秒',
        location: 'Page Load'
      });
    } else {
      console.log('✓ 页面加载性能良好');
    }

    // 检查图片数量
    const images = this.page.locator('img');
    const imageCount = await images.count();
    console.log(`📷 页面图片数量: ${imageCount}`);

    if (imageCount > 20) {
      performanceIssues.push({
        type: 'performance',
        severity: 'medium',
        description: `页面图片数量较多: ${imageCount}`,
        recommendation: '考虑图片懒加载或压缩',
        location: 'Image Count'
      });
    }

    this.issues.push(...performanceIssues);
    return performanceIssues;
  }

  /**
   * 生成测试报告
   */
  generateReport(): {
    summary: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
      score: number;
    };
    recommendations: string[];
  } {
    const summary = {
      total: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
      score: 0
    };

    // 计算得分 (100 - 问题权重分)
    const weights = { critical: 25, high: 10, medium: 5, low: 2 };
    const penalty = summary.critical * weights.critical + 
                   summary.high * weights.high + 
                   summary.medium * weights.medium + 
                   summary.low * weights.low;
    
    summary.score = Math.max(0, 100 - penalty);

    const recommendations = [...new Set(this.issues.map(i => i.recommendation))];

    return { summary, recommendations };
  }
}

test.describe('🎯 UI/UX 演示测试', () => {
  let uiFramework: UITestingFrameworkDemo;

  test.beforeEach(async ({ page }) => {
    uiFramework = new UITestingFrameworkDemo(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🚀 完整UI/UX检查演示', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 开始全面UI/UX测试演示');
    console.log('='.repeat(60));

    // 1. 按钮功能测试
    const buttonIssues = await uiFramework.testButtonFunctionality();
    console.log(`\n🔘 按钮测试完成，发现 ${buttonIssues.length} 个问题`);

    // 2. 页面结构测试
    const structureIssues = await uiFramework.testPageStructure();
    console.log(`\n🏗️ 页面结构测试完成，发现 ${structureIssues.length} 个问题`);

    // 3. 响应式测试
    const responsiveIssues = await uiFramework.testResponsiveLayout();
    console.log(`\n📱 响应式测试完成，发现 ${responsiveIssues.length} 个问题`);

    // 4. 性能测试
    const performanceIssues = await uiFramework.testPerformance();
    console.log(`\n⚡ 性能测试完成，发现 ${performanceIssues.length} 个问题`);

    // 生成报告
    const report = uiFramework.generateReport();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 UI/UX 测试报告总结');
    console.log('='.repeat(60));
    console.log(`总得分: ${report.summary.score}/100`);
    console.log(`总问题: ${report.summary.total} 个`);
    console.log(`  关键: ${report.summary.critical} | 高: ${report.summary.high} | 中: ${report.summary.medium} | 低: ${report.summary.low}`);
    
    if (report.recommendations.length > 0) {
      console.log('\n💡 主要改进建议:');
      report.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    // 整体截图
    await page.screenshot({ 
      path: 'test-results/screenshots/complete-test-demo.png',
      fullPage: true 
    });

    // 验证基本质量标准
    expect(report.summary.critical).toBe(0); // 不应有关键问题
    expect(report.summary.score).toBeGreaterThan(60); // 基础分数应超过60
    
    console.log('✅ UI/UX演示测试完成！');
  });

  test('🔍 快速页面检查', async ({ page }) => {
    console.log('🩺 执行快速页面健康检查...');

    // 检查页面是否正常加载
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✓ 页面标题: "${title}"`);

    // 检查是否有JavaScript错误
    const errors: string[] = [];
    page.on('pageerror', (error) => {
      errors.push(error.message);
    });

    // 等待一段时间看是否有错误
    await page.waitForTimeout(2000);
    
    if (errors.length > 0) {
      console.log(`⚠ 发现 ${errors.length} 个JavaScript错误:`);
      errors.forEach(error => console.log(`  - ${error}`));
    } else {
      console.log('✓ 无JavaScript错误');
    }

    // 检查基本元素
    const hasButtons = await page.locator('button, [role="button"]').count() > 0;
    const hasLinks = await page.locator('a[href]').count() > 0;
    
    console.log(`✓ 发现按钮: ${hasButtons ? '是' : '否'}`);
    console.log(`✓ 发现链接: ${hasLinks ? '是' : '否'}`);

    // 基本断言
    expect(errors.length).toBeLessThan(5); // 允许少量非关键错误
    expect(hasButtons || hasLinks).toBe(true); // 页面应有交互元素
    
    console.log('✅ 快速检查完成');
  });
});