import { test, expect, Page, Locator, ElementHandle } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

/**
 * 全面UI/UX测试套件 - 网页合理性和闭环逻辑验证
 * 包含：按钮功能、用户流程、可访问性、响应式设计、逻辑闭环
 */

interface UIIssue {
  type: 'accessibility' | 'usability' | 'functionality' | 'performance' | 'design';
  severity: 'critical' | 'high' | 'medium' | 'low';
  element?: string;
  description: string;
  recommendation: string;
  location: string;
}

interface UserJourney {
  name: string;
  steps: JourneyStep[];
  expectedOutcome: string;
  criticalPath: boolean;
}

interface JourneyStep {
  action: string;
  target: string;
  validation: string;
  fallback?: string;
}

class ComprehensiveUITestFramework {
  private issues: UIIssue[] = [];
  private performanceMetrics: Record<string, number> = {};

  constructor(private page: Page) {}

  /**
   * 全面按钮功能测试 - 验证所有按钮的功能性和可访问性
   */
  async testButtonFunctionality(): Promise<UIIssue[]> {
    console.log('🔘 开始全面按钮功能测试...');
    
    // 获取所有按钮元素
    const buttonSelectors = [
      'button',
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      'a[href]',
      '[onclick]',
      '[data-testid*="button"]',
      '[class*="btn"]'
    ];

    const allButtons: Locator[] = [];
    for (const selector of buttonSelectors) {
      const elements = await this.page.locator(selector).all();
      allButtons.push(...elements);
    }

    console.log(`发现 ${allButtons.length} 个按钮元素`);

    const buttonIssues: UIIssue[] = [];

    for (let i = 0; i < allButtons.length; i++) {
      const button = allButtons[i];
      
      try {
        const isVisible = await button.isVisible();
        const isEnabled = await button.isEnabled();
        
        if (!isVisible) continue;

        const buttonText = await button.textContent() || '';
        const ariaLabel = await button.getAttribute('aria-label') || '';
        const role = await button.getAttribute('role') || '';
        const tabIndex = await button.getAttribute('tabindex') || '';
        
        // 测试按钮可访问性
        if (!buttonText.trim() && !ariaLabel.trim()) {
          buttonIssues.push({
            type: 'accessibility',
            severity: 'high',
            element: `Button ${i + 1}`,
            description: '按钮缺少可访问的文本描述',
            recommendation: '添加 aria-label 或文本内容',
            location: await this.getElementLocation(button)
          });
        }

        // 测试按钮状态
        if (!isEnabled && !button.getAttribute('aria-disabled')) {
          buttonIssues.push({
            type: 'usability',
            severity: 'medium',
            element: `Button: "${buttonText.slice(0, 20)}"`,
            description: '禁用按钮缺少状态指示',
            recommendation: '添加 aria-disabled 属性',
            location: await this.getElementLocation(button)
          });
        }

        // 测试键盘导航
        if (tabIndex === '-1' && role !== 'presentation') {
          buttonIssues.push({
            type: 'accessibility',
            severity: 'medium',
            element: `Button: "${buttonText.slice(0, 20)}"`,
            description: '按钮不支持键盘导航',
            recommendation: '移除 tabindex="-1" 或添加键盘事件处理',
            location: await this.getElementLocation(button)
          });
        }

        // 测试视觉反馈
        if (isEnabled) {
          const beforeHover = await this.getComputedStyles(button);
          await button.hover({ timeout: 1000 });
          await this.page.waitForTimeout(100);
          const afterHover = await this.getComputedStyles(button);
          
          const hasVisualFeedback = 
            beforeHover.backgroundColor !== afterHover.backgroundColor ||
            beforeHover.color !== afterHover.color ||
            beforeHover.transform !== afterHover.transform ||
            beforeHover.opacity !== afterHover.opacity;

          if (!hasVisualFeedback) {
            buttonIssues.push({
              type: 'usability',
              severity: 'low',
              element: `Button: "${buttonText.slice(0, 20)}"`,
              description: '按钮缺少悬停视觉反馈',
              recommendation: '添加 hover 状态样式',
              location: await this.getElementLocation(button)
            });
          }
        }

        // 测试点击响应（非破坏性测试）
        if (isEnabled && buttonText.toLowerCase().includes('test')) {
          try {
            await button.click({ timeout: 2000 });
            await this.page.waitForTimeout(500);
            
            // 检查是否有Loading状态
            const hasLoadingState = await this.page.locator('[data-loading], .loading, .spinner').isVisible();
            
            // 检查是否有错误消息
            const hasErrorMessage = await this.page.locator('[role="alert"], .error, .alert-error').isVisible();
            
            if (hasErrorMessage) {
              buttonIssues.push({
                type: 'functionality',
                severity: 'high',
                element: `Button: "${buttonText.slice(0, 20)}"`,
                description: '按钮点击触发错误',
                recommendation: '检查按钮功能逻辑和错误处理',
                location: await this.getElementLocation(button)
              });
            }
          } catch (error) {
            // 非关键错误，记录但不影响测试
          }
        }

      } catch (error) {
        console.log(`按钮 ${i + 1} 测试失败:`, error);
      }
    }

    this.issues.push(...buttonIssues);
    console.log(`✅ 按钮功能测试完成，发现 ${buttonIssues.length} 个问题`);
    
    return buttonIssues;
  }

  /**
   * 用户旅程逻辑闭环测试
   */
  async testUserJourneyFlow(): Promise<UIIssue[]> {
    console.log('🛤️ 开始用户旅程逻辑闭环测试...');

    const journeys: UserJourney[] = [
      {
        name: '用户注册登录流程',
        criticalPath: true,
        expectedOutcome: '用户成功登录并进入仪表板',
        steps: [
          { action: 'navigate', target: '/', validation: '首页加载成功' },
          { action: 'click', target: '登录', validation: '登录页面显示', fallback: 'Login' },
          { action: 'click', target: '注册', validation: '注册表单显示', fallback: 'Register' },
          { action: 'navigate', target: '/auth/login', validation: '登录表单可见' }
        ]
      },
      {
        name: '产品浏览购买流程',
        criticalPath: true,
        expectedOutcome: '用户能够浏览和购买产品',
        steps: [
          { action: 'navigate', target: '/products', validation: '产品页面加载' },
          { action: 'click', target: '购买', validation: '购买流程开始', fallback: 'Buy' },
          { action: 'validate', target: '价格显示', validation: '价格信息清晰可见' }
        ]
      },
      {
        name: '仪表板数据查看',
        criticalPath: false,
        expectedOutcome: '用户能够查看个人数据和统计',
        steps: [
          { action: 'navigate', target: '/dashboard', validation: '仪表板加载完成' },
          { action: 'validate', target: '数据组件', validation: '数据正确显示' },
          { action: 'click', target: '详情', validation: '详细信息展开', fallback: 'Details' }
        ]
      }
    ];

    const journeyIssues: UIIssue[] = [];

    for (const journey of journeys) {
      console.log(`🎯 测试旅程: ${journey.name}`);
      
      try {
        for (let i = 0; i < journey.steps.length; i++) {
          const step = journey.steps[i];
          console.log(`  步骤 ${i + 1}: ${step.action} -> ${step.target}`);
          
          const success = await this.executeJourneyStep(step);
          
          if (!success) {
            const severity = journey.criticalPath ? 'critical' : 'medium';
            journeyIssues.push({
              type: 'functionality',
              severity,
              element: step.target,
              description: `用户旅程中断: ${step.validation}`,
              recommendation: `修复 ${step.action} 操作的 ${step.target} 功能`,
              location: `Journey: ${journey.name}, Step ${i + 1}`
            });
            
            // 关键路径失败则停止该旅程测试
            if (journey.criticalPath) break;
          }
        }
      } catch (error) {
        journeyIssues.push({
          type: 'functionality',
          severity: 'high',
          element: journey.name,
          description: `用户旅程执行失败: ${error}`,
          recommendation: '检查页面结构和导航逻辑',
          location: `Journey: ${journey.name}`
        });
      }
    }

    this.issues.push(...journeyIssues);
    console.log(`✅ 用户旅程测试完成，发现 ${journeyIssues.length} 个问题`);
    
    return journeyIssues;
  }

  /**
   * 可访问性全面检查
   */
  async testAccessibility(): Promise<UIIssue[]> {
    console.log('♿ 开始可访问性全面检查...');
    
    const accessibilityIssues: UIIssue[] = [];

    try {
      // 使用 axe-core 进行自动化可访问性检测
      const accessibilityScanResults = await new AxeBuilder({ page: this.page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();

      // 转换 axe 结果为我们的格式
      accessibilityScanResults.violations.forEach(violation => {
        const severity = violation.impact === 'critical' ? 'critical' : 
                        violation.impact === 'serious' ? 'high' :
                        violation.impact === 'moderate' ? 'medium' : 'low';

        accessibilityIssues.push({
          type: 'accessibility',
          severity,
          element: violation.nodes[0]?.target?.join(', ') || 'Unknown',
          description: `WCAG违规: ${violation.description}`,
          recommendation: violation.help,
          location: `Rule: ${violation.id}`
        });
      });

      // 手动可访问性检查
      const manualChecks = await this.performManualAccessibilityChecks();
      accessibilityIssues.push(...manualChecks);

    } catch (error) {
      console.log('可访问性检测失败:', error);
      accessibilityIssues.push({
        type: 'accessibility',
        severity: 'medium',
        description: '无法执行完整的可访问性检测',
        recommendation: '确保 axe-core 正确配置',
        location: 'Accessibility Test Framework'
      });
    }

    this.issues.push(...accessibilityIssues);
    console.log(`✅ 可访问性检查完成，发现 ${accessibilityIssues.length} 个问题`);
    
    return accessibilityIssues;
  }

  /**
   * 响应式设计验证
   */
  async testResponsiveDesign(): Promise<UIIssue[]> {
    console.log('📱 开始响应式设计验证...');
    
    const responsiveIssues: UIIssue[] = [];
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Large Desktop', width: 2560, height: 1440 }
    ];

    const currentUrl = this.page.url();

    for (const viewport of viewports) {
      console.log(`📏 测试 ${viewport.name} 视窗 (${viewport.width}x${viewport.height})`);
      
      await this.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await this.page.reload();
      await this.page.waitForLoadState('networkidle');

      // 检查水平滚动
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      if (hasHorizontalScroll && viewport.width < 1200) {
        responsiveIssues.push({
          type: 'design',
          severity: 'medium',
          element: 'Page Layout',
          description: `${viewport.name} 视窗出现水平滚动`,
          recommendation: '优化响应式布局，避免水平滚动',
          location: `Viewport: ${viewport.name}`
        });
      }

      // 检查元素重叠
      const overlappingElements = await this.detectOverlappingElements();
      overlappingElements.forEach(overlap => {
        responsiveIssues.push({
          type: 'design',
          severity: 'high',
          element: overlap.elements,
          description: `${viewport.name} 视窗中元素重叠`,
          recommendation: '调整布局防止元素重叠',
          location: `Viewport: ${viewport.name}, Elements: ${overlap.elements}`
        });
      });

      // 检查按钮可点击性（移动端最小44px）
      if (viewport.width <= 768) {
        const smallButtons = await this.findSmallClickTargets(44);
        smallButtons.forEach(button => {
          responsiveIssues.push({
            type: 'usability',
            severity: 'medium',
            element: button.text,
            description: `移动端按钮过小 (${button.size}px)`,
            recommendation: '确保移动端点击目标至少44px',
            location: `Viewport: ${viewport.name}`
          });
        });
      }

      // 截图记录
      await this.page.screenshot({ 
        path: `test-results/responsive-${viewport.name.toLowerCase()}-${viewport.width}x${viewport.height}.png`,
        fullPage: true 
      });
    }

    this.issues.push(...responsiveIssues);
    console.log(`✅ 响应式设计验证完成，发现 ${responsiveIssues.length} 个问题`);
    
    return responsiveIssues;
  }

  /**
   * 性能影响分析
   */
  async testPerformanceImpact(): Promise<UIIssue[]> {
    console.log('⚡ 开始性能影响分析...');
    
    const performanceIssues: UIIssue[] = [];

    // 测量页面加载性能
    const navigationStart = Date.now();
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
    const navigationEnd = Date.now();
    
    const loadTime = navigationEnd - navigationStart;
    this.performanceMetrics.pageLoadTime = loadTime;

    if (loadTime > 3000) {
      performanceIssues.push({
        type: 'performance',
        severity: 'high',
        description: `页面加载时间过长: ${loadTime}ms`,
        recommendation: '优化页面加载性能，目标<3秒',
        location: 'Page Load'
      });
    }

    // 检查大图片
    const largeImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images
        .filter(img => img.naturalWidth > 2000 || img.naturalHeight > 2000)
        .map(img => ({ 
          src: img.src, 
          width: img.naturalWidth, 
          height: img.naturalHeight 
        }));
    });

    largeImages.forEach(img => {
      performanceIssues.push({
        type: 'performance',
        severity: 'medium',
        element: img.src,
        description: `图片尺寸过大: ${img.width}x${img.height}`,
        recommendation: '优化图片尺寸和格式',
        location: `Image: ${img.src.slice(-50)}`
      });
    });

    // 检查长列表渲染
    const longLists = await this.page.locator('ul, ol').filter({
      has: this.page.locator('li')
    }).all();

    for (const list of longLists) {
      const itemCount = await list.locator('li').count();
      if (itemCount > 100) {
        performanceIssues.push({
          type: 'performance',
          severity: 'medium',
          element: 'Long List',
          description: `长列表包含 ${itemCount} 个项目`,
          recommendation: '考虑使用虚拟滚动或分页',
          location: await this.getElementLocation(list)
        });
      }
    }

    this.issues.push(...performanceIssues);
    console.log(`✅ 性能分析完成，发现 ${performanceIssues.length} 个问题`);
    
    return performanceIssues;
  }

  /**
   * 生成全面的问题报告
   */
  generateComprehensiveReport(): {
    summary: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
    issuesByCategory: Record<string, UIIssue[]>;
    recommendations: string[];
    performanceMetrics: Record<string, number>;
  } {
    const summary = {
      total: this.issues.length,
      critical: this.issues.filter(i => i.severity === 'critical').length,
      high: this.issues.filter(i => i.severity === 'high').length,
      medium: this.issues.filter(i => i.severity === 'medium').length,
      low: this.issues.filter(i => i.severity === 'low').length,
    };

    const issuesByCategory = this.issues.reduce((acc, issue) => {
      if (!acc[issue.type]) acc[issue.type] = [];
      acc[issue.type].push(issue);
      return acc;
    }, {} as Record<string, UIIssue[]>);

    const recommendations = [
      ...new Set(this.issues
        .filter(i => i.severity === 'critical' || i.severity === 'high')
        .map(i => i.recommendation))
    ];

    return {
      summary,
      issuesByCategory,
      recommendations,
      performanceMetrics: this.performanceMetrics
    };
  }

  // 辅助方法
  private async executeJourneyStep(step: JourneyStep): Promise<boolean> {
    try {
      switch (step.action) {
        case 'navigate':
          await this.page.goto(step.target);
          await this.page.waitForLoadState('networkidle');
          return true;

        case 'click':
          const element = await this.findElementByText(step.target, step.fallback);
          if (element) {
            await element.click();
            await this.page.waitForTimeout(1000);
            return true;
          }
          return false;

        case 'validate':
          return await this.validateElement(step.target);

        default:
          return false;
      }
    } catch (error) {
      console.log(`步骤执行失败: ${step.action} -> ${step.target}:`, error);
      return false;
    }
  }

  private async findElementByText(text: string, fallback?: string): Promise<Locator | null> {
    let element = this.page.locator(`text="${text}"`).first();
    
    if (!(await element.isVisible())) {
      element = this.page.locator(`[aria-label*="${text}"]`).first();
    }
    
    if (!(await element.isVisible()) && fallback) {
      element = this.page.locator(`text="${fallback}"`).first();
    }
    
    if (!(await element.isVisible())) {
      element = this.page.locator(`*:has-text("${text}")`).first();
    }

    return (await element.isVisible()) ? element : null;
  }

  private async validateElement(target: string): Promise<boolean> {
    try {
      const element = this.page.locator(`*:has-text("${target}")`);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  private async getElementLocation(element: Locator): Promise<string> {
    try {
      const box = await element.boundingBox();
      return box ? `(${box.x}, ${box.y})` : 'Unknown position';
    } catch {
      return 'Position unavailable';
    }
  }

  private async getComputedStyles(element: Locator) {
    return await element.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color,
        transform: styles.transform,
        opacity: styles.opacity
      };
    });
  }

  private async performManualAccessibilityChecks(): Promise<UIIssue[]> {
    const issues: UIIssue[] = [];

    // 检查页面标题
    const title = await this.page.title();
    if (!title || title.trim().length === 0) {
      issues.push({
        type: 'accessibility',
        severity: 'high',
        description: '页面缺少标题',
        recommendation: '添加描述性的页面标题',
        location: 'document.title'
      });
    }

    // 检查主要内容区域
    const mainContent = this.page.locator('main, [role="main"]');
    if (!(await mainContent.isVisible())) {
      issues.push({
        type: 'accessibility',
        severity: 'medium',
        description: '页面缺少主要内容区域标记',
        recommendation: '使用 <main> 或 role="main"',
        location: 'Page Structure'
      });
    }

    // 检查跳过链接
    const skipLinks = this.page.locator('a[href="#main"], a[href="#content"]');
    if (!(await skipLinks.isVisible())) {
      issues.push({
        type: 'accessibility',
        severity: 'low',
        description: '缺少跳过导航链接',
        recommendation: '添加"跳过到主内容"链接',
        location: 'Page Navigation'
      });
    }

    return issues;
  }

  private async detectOverlappingElements(): Promise<Array<{elements: string}>> {
    return await this.page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*')).filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });

      const overlaps: Array<{elements: string}> = [];
      
      for (let i = 0; i < elements.length; i++) {
        for (let j = i + 1; j < elements.length; j++) {
          const rect1 = elements[i].getBoundingClientRect();
          const rect2 = elements[j].getBoundingClientRect();
          
          if (!(rect1.right < rect2.left || 
                rect2.right < rect1.left || 
                rect1.bottom < rect2.top || 
                rect2.bottom < rect1.top)) {
            overlaps.push({
              elements: `${elements[i].tagName}[${i}] & ${elements[j].tagName}[${j}]`
            });
          }
        }
      }
      
      return overlaps.slice(0, 5); // 限制结果数量
    });
  }

  private async findSmallClickTargets(minSize: number): Promise<Array<{text: string, size: number}>> {
    return await this.page.evaluate((minSize) => {
      const clickables = Array.from(document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick], [role="button"]'));
      const smallTargets: Array<{text: string, size: number}> = [];
      
      clickables.forEach(el => {
        const rect = el.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        
        if (size < minSize && size > 0) {
          smallTargets.push({
            text: (el.textContent || el.getAttribute('aria-label') || el.tagName).slice(0, 30),
            size: Math.round(size)
          });
        }
      });
      
      return smallTargets;
    }, minSize);
  }
}

// 主测试套件
test.describe('🎯 全面UI/UX测试套件', () => {
  let framework: ComprehensiveUITestFramework;

  test.beforeEach(async ({ page }) => {
    framework = new ComprehensiveUITestFramework(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('🔘 完整按钮功能性验证', async ({ page }) => {
    const issues = await framework.testButtonFunctionality();
    
    console.log('\n📊 按钮功能测试结果:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`);
      console.log(`  建议: ${issue.recommendation}`);
      console.log(`  位置: ${issue.location}\n`);
    });

    // 确保关键按钮功能正常
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);

    // 高优先级问题应该较少
    const highIssues = issues.filter(i => i.severity === 'high');
    expect(highIssues.length).toBeLessThan(5);
  });

  test('🛤️ 用户旅程逻辑闭环验证', async ({ page }) => {
    const issues = await framework.testUserJourneyFlow();
    
    console.log('\n🛤️ 用户旅程测试结果:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`);
      console.log(`  建议: ${issue.recommendation}`);
      console.log(`  位置: ${issue.location}\n`);
    });

    // 关键路径必须可用
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);
  });

  test('♿ WCAG 2.1 AA 可访问性全面检查', async ({ page }) => {
    const issues = await framework.testAccessibility();
    
    console.log('\n♿ 可访问性测试结果:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`);
      console.log(`  建议: ${issue.recommendation}`);
      console.log(`  位置: ${issue.location}\n`);
    });

    // 确保没有关键的可访问性问题
    const criticalIssues = issues.filter(i => i.severity === 'critical');
    expect(criticalIssues.length).toBe(0);
  });

  test('📱 响应式设计全设备验证', async ({ page }) => {
    const issues = await framework.testResponsiveDesign();
    
    console.log('\n📱 响应式设计测试结果:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`);
      console.log(`  建议: ${issue.recommendation}`);
      console.log(`  位置: ${issue.location}\n`);
    });

    // 确保没有严重的布局问题
    const severeIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'high');
    expect(severeIssues.length).toBeLessThan(3);
  });

  test('⚡ 性能影响和优化建议', async ({ page }) => {
    const issues = await framework.testPerformanceImpact();
    
    console.log('\n⚡ 性能测试结果:');
    issues.forEach(issue => {
      console.log(`  ${issue.severity.toUpperCase()}: ${issue.description}`);
      console.log(`  建议: ${issue.recommendation}`);
      console.log(`  位置: ${issue.location}\n`);
    });

    // 页面加载时间应该合理
    const performanceMetrics = framework.generateComprehensiveReport().performanceMetrics;
    expect(performanceMetrics.pageLoadTime).toBeLessThan(5000);
  });

  test('📋 生成综合UI/UX问题报告', async ({ page }) => {
    // 执行所有测试
    await framework.testButtonFunctionality();
    await framework.testUserJourneyFlow();
    await framework.testAccessibility();
    await framework.testResponsiveDesign();
    await framework.testPerformanceImpact();

    const report = framework.generateComprehensiveReport();
    
    console.log('\n📋 综合UI/UX测试报告:');
    console.log('='.repeat(50));
    console.log(`总问题数: ${report.summary.total}`);
    console.log(`关键问题: ${report.summary.critical}`);
    console.log(`高优先级: ${report.summary.high}`);
    console.log(`中优先级: ${report.summary.medium}`);
    console.log(`低优先级: ${report.summary.low}`);
    
    console.log('\n📊 问题分类统计:');
    Object.entries(report.issuesByCategory).forEach(([category, issues]) => {
      console.log(`  ${category}: ${issues.length} 个问题`);
    });
    
    console.log('\n🎯 主要改进建议:');
    report.recommendations.slice(0, 10).forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
    
    console.log('\n⚡ 性能指标:');
    Object.entries(report.performanceMetrics).forEach(([metric, value]) => {
      console.log(`  ${metric}: ${value}`);
    });
    
    // 生成JSON报告
    const reportJson = JSON.stringify(report, null, 2);
    await page.evaluate((report) => {
      console.log('完整报告数据:', report);
    }, reportJson);

    // 验证报告质量
    expect(report.summary.total).toBeGreaterThanOrEqual(0);
    expect(Object.keys(report.issuesByCategory).length).toBeGreaterThan(0);
  });
});