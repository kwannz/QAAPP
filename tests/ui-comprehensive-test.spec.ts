import { test, expect, Page } from '@playwright/test';

/**
 * QA App 综合UI测试套件
 * 测试所有页面的布局、按钮功能和设计问题
 */

const PAGES_TO_TEST = [
  // 主要页面
  { path: '/', name: '首页' },
  { path: '/auth/login', name: '登录页面' },
  { path: '/auth/register', name: '注册页面' },
  { path: '/products', name: '产品页面' },
  
  // Dashboard 页面
  { path: '/dashboard', name: 'Dashboard 主页' },
  { path: '/dashboard/profile', name: '个人资料' },
  { path: '/dashboard/wallets', name: '钱包管理' },
  { path: '/dashboard/transactions', name: '交易记录' },
  { path: '/dashboard/notifications', name: '通知中心' },
  { path: '/dashboard/reports', name: '报告页面' },
  { path: '/dashboard/activity', name: '活动记录' },
  { path: '/dashboard/commissions', name: '佣金管理' },
  { path: '/dashboard/earnings', name: '收益页面' },
  
  // Admin 页面
  { path: '/admin', name: 'Admin 主页' },
  { path: '/admin/users', name: '用户管理' },
  { path: '/admin/orders', name: '订单管理' },
  { path: '/admin/products', name: '产品管理' },
  { path: '/admin/reports', name: 'Admin 报告' },
  { path: '/admin/system', name: '系统设置' },
  { path: '/admin/audit-logs', name: '审计日志' },
  { path: '/admin/notifications', name: 'Admin 通知' },
  { path: '/admin/business-metrics', name: '业务指标' },
  { path: '/admin/compliance', name: '合规管理' },
  { path: '/admin/kyc-review', name: 'KYC审核' },
  { path: '/admin/risk-assessment', name: '风险评估' },
  { path: '/admin/system-audit', name: '系统审计' },
  { path: '/admin/permissions', name: '权限管理' },
  { path: '/admin/performance', name: '性能监控' },
  { path: '/admin/user-audit', name: '用户审计' },
  { path: '/admin/agents', name: '代理管理' },
  { path: '/admin/settings', name: 'Admin 设置' },
  { path: '/admin/logs', name: '系统日志' },
  { path: '/admin/withdrawals', name: '提现管理' },
  { path: '/admin/commissions', name: 'Admin 佣金' },
  
  // 其他页面
  { path: '/withdrawals', name: '提现页面' },
  { path: '/referral', name: '推荐页面' },
  { path: '/test-enhanced', name: '测试增强页面' }
];

// 屏幕尺寸测试
const SCREEN_SIZES = [
  { name: '桌面端', width: 1920, height: 1080 },
  { name: '笔记本', width: 1366, height: 768 },
  { name: '平板横屏', width: 1024, height: 768 },
  { name: '平板竖屏', width: 768, height: 1024 },
  { name: '手机横屏', width: 667, height: 375 },
  { name: '手机竖屏', width: 375, height: 667 }
];

/**
 * 检查页面基础元素和布局
 */
async function checkBasicLayout(page: Page, pageName: string) {
  // 等待页面加载
  await page.waitForLoadState('networkidle');
  
  // 检查标题是否存在
  const title = await page.title();
  expect(title).toBeTruthy();
  
  // 检查是否有主要内容区域
  const mainContent = page.locator('main, .main, #main, [role="main"]').first();
  
  // 检查导航栏
  const navigation = page.locator('nav, .nav, .navigation, [role="navigation"]').first();
  
  // 检查页面是否有基本内容
  const bodyText = await page.textContent('body');
  expect(bodyText.length).toBeGreaterThan(10);
  
  return {
    title,
    hasMainContent: await mainContent.count() > 0,
    hasNavigation: await navigation.count() > 0,
    bodyTextLength: bodyText.length
  };
}

/**
 * 检查按钮和链接
 */
async function checkInteractiveElements(page: Page) {
  // 查找所有按钮
  const buttons = page.locator('button, input[type="button"], input[type="submit"], [role="button"]');
  const buttonCount = await buttons.count();
  
  // 查找所有链接
  const links = page.locator('a[href]');
  const linkCount = await links.count();
  
  // 检查按钮是否可点击
  let clickableButtons = 0;
  for (let i = 0; i < Math.min(buttonCount, 10); i++) {
    const button = buttons.nth(i);
    if (await button.isVisible() && await button.isEnabled()) {
      clickableButtons++;
    }
  }
  
  // 检查链接是否有效
  let validLinks = 0;
  for (let i = 0; i < Math.min(linkCount, 10); i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');
    if (href && href !== '#' && href !== 'javascript:void(0)') {
      validLinks++;
    }
  }
  
  return {
    totalButtons: buttonCount,
    clickableButtons,
    totalLinks: linkCount,
    validLinks
  };
}

/**
 * 检查响应式设计
 */
async function checkResponsiveDesign(page: Page, screenSize: { width: number; height: number }) {
  await page.setViewportSize(screenSize);
  await page.waitForTimeout(500); // 等待重绘
  
  // 检查横向滚动条
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  
  // 检查内容是否被截断
  const visibleElements = await page.locator('*:visible').count();
  
  // 检查字体大小是否合适
  const bodyStyles = await page.evaluate(() => {
    const body = document.body;
    const styles = window.getComputedStyle(body);
    return {
      fontSize: parseInt(styles.fontSize),
      fontFamily: styles.fontFamily
    };
  });
  
  return {
    hasHorizontalScroll,
    visibleElements,
    fontSize: bodyStyles.fontSize,
    fontFamily: bodyStyles.fontFamily
  };
}

/**
 * 检查可访问性
 */
async function checkAccessibility(page: Page) {
  // 检查图片alt属性
  const images = page.locator('img');
  const imageCount = await images.count();
  let imagesWithAlt = 0;
  
  for (let i = 0; i < imageCount; i++) {
    const img = images.nth(i);
    const alt = await img.getAttribute('alt');
    if (alt !== null) {
      imagesWithAlt++;
    }
  }
  
  // 检查表单标签
  const inputs = page.locator('input, textarea, select');
  const inputCount = await inputs.count();
  let inputsWithLabels = 0;
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    
    if (id) {
      const label = page.locator(`label[for="${id}"]`);
      if (await label.count() > 0) {
        inputsWithLabels++;
      }
    } else if (ariaLabel) {
      inputsWithLabels++;
    }
  }
  
  // 检查标题层级
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
  
  return {
    imageCount,
    imagesWithAlt,
    inputCount,
    inputsWithLabels,
    headingCount: headings
  };
}

/**
 * 检查性能指标
 */
async function checkPerformance(page: Page) {
  // 测量页面加载时间
  const startTime = Date.now();
  await page.waitForLoadState('load');
  const loadTime = Date.now() - startTime;
  
  // 检查资源加载
  const resources = await page.evaluate(() => {
    const entries = performance.getEntriesByType('resource');
    return {
      totalResources: entries.length,
      slowResources: entries.filter((entry: any) => entry.duration > 1000).length
    };
  });
  
  return {
    loadTime,
    ...resources
  };
}

// 主要测试套件
test.describe('QA App 综合UI测试', () => {
  
  // 基础页面测试
  for (const pageInfo of PAGES_TO_TEST) {
    test(`基础布局测试 - ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      console.log(`\n=== 测试页面: ${pageInfo.name} ===`);
      
      try {
        await page.goto(pageInfo.path);
        
        // 基础布局检查
        const layoutInfo = await checkBasicLayout(page, pageInfo.name);
        console.log('布局信息:', layoutInfo);
        
        // 交互元素检查
        const interactiveInfo = await checkInteractiveElements(page);
        console.log('交互元素:', interactiveInfo);
        
        // 可访问性检查
        const accessibilityInfo = await checkAccessibility(page);
        console.log('可访问性:', accessibilityInfo);
        
        // 性能检查
        const performanceInfo = await checkPerformance(page);
        console.log('性能指标:', performanceInfo);
        
        // 截图保存
        await page.screenshot({ 
          path: `test-results/screenshots/${pageInfo.name.replace(/[\/\s]/g, '_')}.png`,
          fullPage: true 
        });
        
        // 基础断言
        expect(layoutInfo.title).toBeTruthy();
        expect(layoutInfo.bodyTextLength).toBeGreaterThan(10);
        expect(performanceInfo.loadTime).toBeLessThan(10000); // 10秒内加载完成
        
      } catch (error) {
        console.error(`页面 ${pageInfo.name} 测试失败:`, error);
        
        // 即使失败也要截图
        try {
          await page.screenshot({ 
            path: `test-results/screenshots/ERROR_${pageInfo.name.replace(/[\/\s]/g, '_')}.png`,
            fullPage: true 
          });
        } catch (screenshotError) {
          console.error('截图失败:', screenshotError);
        }
        
        throw error;
      }
    });
  }
  
  // 响应式设计测试
  test('响应式设计测试', async ({ page }) => {
    console.log('\n=== 响应式设计测试 ===');
    
    // 测试首页在不同屏幕尺寸下的表现
    await page.goto('/');
    
    for (const screenSize of SCREEN_SIZES) {
      console.log(`\n测试屏幕尺寸: ${screenSize.name} (${screenSize.width}x${screenSize.height})`);
      
      const responsiveInfo = await checkResponsiveDesign(page, screenSize);
      console.log('响应式信息:', responsiveInfo);
      
      // 截图保存
      await page.screenshot({ 
        path: `test-results/screenshots/responsive_${screenSize.name}.png`,
        fullPage: true 
      });
      
      // 断言检查
      expect(responsiveInfo.hasHorizontalScroll).toBeFalsy(); // 不应该有横向滚动条
      expect(responsiveInfo.visibleElements).toBeGreaterThan(0); // 应该有可见元素
      expect(responsiveInfo.fontSize).toBeGreaterThan(10); // 字体不应该太小
    }
  });
  
  // 导航和路由测试
  test('导航功能测试', async ({ page }) => {
    console.log('\n=== 导航功能测试 ===');
    
    await page.goto('/');
    
    // 查找导航链接
    const navLinks = page.locator('nav a, .nav a, .navigation a');
    const navCount = await navLinks.count();
    
    console.log(`发现 ${navCount} 个导航链接`);
    
    // 测试前5个导航链接
    for (let i = 0; i < Math.min(navCount, 5); i++) {
      const link = navLinks.nth(i);
      const href = await link.getAttribute('href');
      const text = await link.textContent();
      
      if (href && !href.startsWith('#') && !href.startsWith('mailto:')) {
        console.log(`测试导航链接: "${text}" -> ${href}`);
        
        try {
          await link.click();
          await page.waitForLoadState('networkidle');
          
          // 检查是否成功导航
          const currentUrl = page.url();
          console.log(`当前URL: ${currentUrl}`);
          
          // 返回首页继续测试
          await page.goto('/');
        } catch (error) {
          console.error(`导航链接 "${text}" 测试失败:`, error);
        }
      }
    }
  });
  
  // 表单功能测试
  test('表单功能测试', async ({ page }) => {
    console.log('\n=== 表单功能测试 ===');
    
    const formPages = ['/auth/login', '/auth/register'];
    
    for (const formPage of formPages) {
      console.log(`\n测试表单页面: ${formPage}`);
      
      try {
        await page.goto(formPage);
        
        // 查找表单
        const forms = page.locator('form');
        const formCount = await forms.count();
        
        console.log(`发现 ${formCount} 个表单`);
        
        if (formCount > 0) {
          const form = forms.first();
          
          // 查找输入字段
          const inputs = form.locator('input, textarea, select');
          const inputCount = await inputs.count();
          console.log(`表单中有 ${inputCount} 个输入字段`);
          
          // 查找提交按钮
          const submitButtons = form.locator('button[type="submit"], input[type="submit"]');
          const submitCount = await submitButtons.count();
          console.log(`表单中有 ${submitCount} 个提交按钮`);
          
          // 截图保存
          await page.screenshot({ 
            path: `test-results/screenshots/form_${formPage.replace(/[\/]/g, '_')}.png`,
            fullPage: true 
          });
        }
        
      } catch (error) {
        console.error(`表单页面 ${formPage} 测试失败:`, error);
      }
    }
  });
});