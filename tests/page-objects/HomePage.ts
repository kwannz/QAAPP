import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * 首页页面对象 - 专门处理首页的UI/UX测试
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // 首页特定元素
  get heroSection() {
    return this.page.locator('section:first-of-type, .hero, [data-testid="hero"]');
  }

  get navigationMenu() {
    return this.page.locator('nav, [role="navigation"], .navigation');
  }

  get ctaButtons() {
    return this.page.locator('button:has-text("开始"), button:has-text("Get Started"), .cta-button');
  }

  get featuresSection() {
    return this.page.locator('.features, [data-testid="features"]');
  }

  get productPreview() {
    return this.page.locator('.products-preview, [data-testid="products"]');
  }

  get statsSection() {
    return this.page.locator('.stats, [data-testid="stats"]');
  }

  get footer() {
    return this.page.locator('footer');
  }

  async navigateToHome(): Promise<void> {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * 验证首页核心元素
   */
  async validateHomePageElements(): Promise<{success: boolean, issues: string[]}> {
    const issues: string[] = [];
    
    // 检查页面标题
    const title = await this.page.title();
    if (!title || !title.toLowerCase().includes('qa')) {
      issues.push('页面标题不正确或缺失');
    }

    // 检查导航菜单
    if (!(await this.navigationMenu.isVisible())) {
      issues.push('导航菜单不可见');
    } else {
      // 检查导航链接
      const navLinks = this.navigationMenu.locator('a');
      const linkCount = await navLinks.count();
      if (linkCount === 0) {
        issues.push('导航菜单中没有链接');
      }
      
      // 验证关键导航项
      const expectedNavItems = ['产品', 'Products', '仪表板', 'Dashboard', '登录', 'Login'];
      let hasNavItems = false;
      
      for (const navItem of expectedNavItems) {
        const navElement = this.navigationMenu.locator(`text="${navItem}"`);
        if (await navElement.isVisible()) {
          hasNavItems = true;
          break;
        }
      }
      
      if (!hasNavItems) {
        issues.push('缺少关键导航项目');
      }
    }

    // 检查主要内容区域
    if (!(await this.heroSection.isVisible())) {
      issues.push('英雄区域/主要内容不可见');
    }

    // 检查CTA按钮
    const ctaCount = await this.ctaButtons.count();
    if (ctaCount === 0) {
      issues.push('缺少号召行动按钮');
    }

    // 检查页脚
    if (!(await this.footer.isVisible())) {
      issues.push('页脚不可见');
    }

    return {
      success: issues.length === 0,
      issues
    };
  }

  /**
   * 测试导航功能
   */
  async testNavigation(): Promise<{success: boolean, results: {item: string, success: boolean, error?: string}[]}> {
    const results: {item: string, success: boolean, error?: string}[] = [];
    
    const navigationItems = [
      { text: '产品', fallback: 'Products', expectedPath: '/products' },
      { text: '仪表板', fallback: 'Dashboard', expectedPath: '/dashboard' },
      { text: '登录', fallback: 'Login', expectedPath: '/auth/login' },
    ];

    for (const navItem of navigationItems) {
      try {
        // 导航到首页
        await this.navigateToHome();
        
        // 查找并点击导航项
        let navElement = this.navigationMenu.locator(`text="${navItem.text}"`);
        
        if (!(await navElement.isVisible())) {
          navElement = this.navigationMenu.locator(`text="${navItem.fallback}"`);
        }

        if (await navElement.isVisible()) {
          await navElement.click();
          await this.waitForPageLoad();
          
          // 验证导航结果
          const currentPath = new URL(this.page.url()).pathname;
          const success = currentPath.includes(navItem.expectedPath.replace('/', '')) || 
                         currentPath === navItem.expectedPath;
          
          results.push({
            item: navItem.text,
            success,
            error: success ? undefined : `期望路径: ${navItem.expectedPath}, 实际路径: ${currentPath}`
          });
        } else {
          results.push({
            item: navItem.text,
            success: false,
            error: '导航项不可见'
          });
        }
      } catch (error) {
        results.push({
          item: navItem.text,
          success: false,
          error: `导航测试失败: ${error}`
        });
      }
    }

    const success = results.every(r => r.success);
    return { success, results };
  }

  /**
   * 测试首页交互元素
   */
  async testInteractiveElements(): Promise<{success: boolean, elementTests: {element: string, passed: boolean, issues: string[]}[]}> {
    const elementTests: {element: string, passed: boolean, issues: string[]}[] = [];

    // 测试CTA按钮
    const ctaButtons = await this.ctaButtons.all();
    for (let i = 0; i < ctaButtons.length; i++) {
      const button = ctaButtons[i];
      const buttonText = await button.textContent() || `CTA Button ${i + 1}`;
      const issues: string[] = [];

      try {
        // 检查按钮可见性
        if (!(await button.isVisible())) {
          issues.push('按钮不可见');
        }

        // 检查按钮可点击性
        if (!(await button.isEnabled())) {
          issues.push('按钮不可点击');
        }

        // 测试悬停效果
        const beforeHover = await button.evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            transform: styles.transform,
            opacity: styles.opacity
          };
        });

        await button.hover();
        await this.page.waitForTimeout(300);

        const afterHover = await button.evaluate(el => {
          const styles = getComputedStyle(el);
          return {
            backgroundColor: styles.backgroundColor,
            transform: styles.transform,
            opacity: styles.opacity
          };
        });

        const hasHoverEffect = 
          beforeHover.backgroundColor !== afterHover.backgroundColor ||
          beforeHover.transform !== afterHover.transform ||
          beforeHover.opacity !== afterHover.opacity;

        if (!hasHoverEffect) {
          issues.push('缺少悬停视觉反馈');
        }

        // 测试点击（非破坏性）
        if (buttonText.toLowerCase().includes('test') || buttonText.toLowerCase().includes('演示')) {
          await button.click();
          await this.page.waitForTimeout(1000);
          
          // 检查是否有响应
          const hasModal = await this.modals.isVisible();
          const hasNavigation = this.page.url() !== (await this.page.evaluate(() => window.location.href));
          
          if (!hasModal && !hasNavigation) {
            issues.push('点击后无明显响应');
          }
        }

      } catch (error) {
        issues.push(`测试失败: ${error}`);
      }

      elementTests.push({
        element: buttonText,
        passed: issues.length === 0,
        issues
      });
    }

    // 测试链接
    const pageLinks = this.page.locator('a[href]:not(nav a)');
    const linkCount = await pageLinks.count();
    const linksToTest = Math.min(5, linkCount); // 限制测试数量

    for (let i = 0; i < linksToTest; i++) {
      const link = pageLinks.nth(i);
      const linkText = await link.textContent() || `Link ${i + 1}`;
      const issues: string[] = [];

      try {
        if (!(await link.isVisible())) {
          issues.push('链接不可见');
        }

        const href = await link.getAttribute('href');
        if (!href) {
          issues.push('链接缺少href属性');
        }

        // 检查外部链接的target属性
        if (href && (href.startsWith('http') || href.startsWith('//'))) {
          const target = await link.getAttribute('target');
          if (target !== '_blank') {
            issues.push('外部链接应该在新窗口打开');
          }
        }

      } catch (error) {
        issues.push(`链接测试失败: ${error}`);
      }

      elementTests.push({
        element: linkText,
        passed: issues.length === 0,
        issues
      });
    }

    const success = elementTests.every(test => test.passed);
    return { success, elementTests };
  }

  /**
   * 测试首页加载性能
   */
  async testLoadingPerformance(): Promise<{
    loadTime: number;
    metricsWithinThreshold: boolean;
    performanceIssues: string[];
    recommendations: string[];
  }> {
    const performanceIssues: string[] = [];
    const recommendations: string[] = [];

    // 重新加载页面以获取准确的性能数据
    const startTime = Date.now();
    await this.page.reload();
    await this.waitForPageLoad();
    const loadTime = Date.now() - startTime;

    // 获取详细性能指标
    const metrics = await this.getPerformanceMetrics();

    // 分析性能阈值
    if (loadTime > 3000) {
      performanceIssues.push(`页面加载时间过长: ${loadTime}ms`);
      recommendations.push('优化页面资源加载，减少初始包大小');
    }

    if (metrics.firstContentfulPaint > 2000) {
      performanceIssues.push(`首次内容绘制过慢: ${metrics.firstContentfulPaint}ms`);
      recommendations.push('优化关键渲染路径，减少阻塞资源');
    }

    // 检查资源大小
    const resourceSizes = await this.page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      return resources.map(resource => ({
        name: resource.name,
        size: resource.transferSize || 0,
        type: resource.initiatorType
      })).filter(resource => resource.size > 500000); // 大于500KB的资源
    });

    if (resourceSizes.length > 0) {
      performanceIssues.push(`发现 ${resourceSizes.length} 个大文件资源`);
      recommendations.push('压缩大文件资源，考虑使用CDN');
    }

    // 检查图片优化
    const largeImages = await this.page.evaluate(() => {
      const images = Array.from(document.querySelectorAll('img'));
      return images.filter(img => {
        return img.naturalWidth > 1920 || img.naturalHeight > 1080;
      }).length;
    });

    if (largeImages > 0) {
      performanceIssues.push(`发现 ${largeImages} 个未优化的大图片`);
      recommendations.push('使用适当尺寸的图片，考虑现代图片格式');
    }

    const metricsWithinThreshold = loadTime <= 3000 && 
                                  metrics.firstContentfulPaint <= 2000 &&
                                  resourceSizes.length === 0;

    return {
      loadTime,
      metricsWithinThreshold,
      performanceIssues,
      recommendations
    };
  }

  /**
   * 验证首页SEO元素
   */
  async validateSEOElements(): Promise<{success: boolean, seoIssues: string[], recommendations: string[]}> {
    const seoIssues: string[] = [];
    const recommendations: string[] = [];

    // 检查页面标题
    const title = await this.page.title();
    if (!title) {
      seoIssues.push('缺少页面标题');
      recommendations.push('添加描述性的页面标题');
    } else if (title.length < 30 || title.length > 60) {
      seoIssues.push(`页面标题长度不合适: ${title.length} 字符`);
      recommendations.push('页面标题应该在30-60字符之间');
    }

    // 检查meta描述
    const metaDescription = await this.page.locator('meta[name="description"]').getAttribute('content');
    if (!metaDescription) {
      seoIssues.push('缺少meta描述');
      recommendations.push('添加meta描述标签');
    } else if (metaDescription.length < 120 || metaDescription.length > 160) {
      seoIssues.push(`Meta描述长度不合适: ${metaDescription.length} 字符`);
      recommendations.push('Meta描述应该在120-160字符之间');
    }

    // 检查H1标签
    const h1Elements = this.page.locator('h1');
    const h1Count = await h1Elements.count();
    if (h1Count === 0) {
      seoIssues.push('缺少H1标签');
      recommendations.push('添加主要的H1标题标签');
    } else if (h1Count > 1) {
      seoIssues.push(`H1标签过多: ${h1Count} 个`);
      recommendations.push('页面应该只有一个H1标签');
    }

    // 检查图片alt属性
    const images = this.page.locator('img');
    const imageCount = await images.count();
    let imagesWithoutAlt = 0;

    for (let i = 0; i < imageCount; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      if (!alt) {
        imagesWithoutAlt++;
      }
    }

    if (imagesWithoutAlt > 0) {
      seoIssues.push(`${imagesWithoutAlt} 个图片缺少alt属性`);
      recommendations.push('为所有图片添加描述性的alt属性');
    }

    // 检查结构化数据
    const jsonLd = await this.page.locator('script[type="application/ld+json"]').count();
    if (jsonLd === 0) {
      seoIssues.push('缺少结构化数据');
      recommendations.push('添加JSON-LD结构化数据');
    }

    return {
      success: seoIssues.length === 0,
      seoIssues,
      recommendations
    };
  }
}