import { test, expect } from '@playwright/test';

// 测试配置
const BASE_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:3001';

// 测试账户
const testAccounts = {
  admin: { email: 'admin@qa-app.com', password: 'Admin123!' },
  agent: { email: 'agent1@qa-app.com', password: 'Agent123!' },
  user: { email: 'user1@example.com', password: 'User123!' }
};

test.describe('QA App 综合测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('首页加载测试', async ({ page }) => {
    // 检查首页标题
    await expect(page).toHaveTitle(/QA/);
    
    // 检查核心元素
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('text=/产品|Products/i')).toBeVisible();
    
    // 检查登录按钮
    const loginButton = page.locator('text=/登录|Login/i').first();
    await expect(loginButton).toBeVisible();
  });

  test('产品页面测试', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 检查产品列表
    const productCards = page.locator('[data-testid="product-card"], .product-card, [class*="product"]');
    const count = await productCards.count();
    
    if (count > 0) {
      // 点击第一个产品
      await productCards.first().click();
      
      // 检查产品详情页面
      await expect(page.locator('text=/购买|Buy|投资|Invest/i')).toBeVisible({ timeout: 10000 });
    }
  });

  test('登录流程测试', async ({ page }) => {
    // 导航到登录页面
    await page.goto(`${BASE_URL}/auth/login`);
    
    // 填写登录表单
    await page.fill('input[type="email"], input[name="email"]', testAccounts.user.email);
    await page.fill('input[type="password"], input[name="password"]', testAccounts.user.password);
    
    // 点击登录按钮
    await page.click('button[type="submit"], button:has-text("登录"), button:has-text("Login")');
    
    // 等待跳转
    await page.waitForURL(/dashboard|home/, { timeout: 10000 }).catch(() => {
      console.log('登录后未跳转到预期页面');
    });
    
    // 验证登录成功
    const isLoggedIn = await page.locator('text=/退出|Logout|用户|User/i').isVisible().catch(() => false);
    expect(isLoggedIn).toBeTruthy();
  });

  test('Dashboard 页面测试', async ({ page }) => {
    // 先登录
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"], input[name="email"]', testAccounts.user.email);
    await page.fill('input[type="password"], input[name="password"]', testAccounts.user.password);
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForTimeout(2000);
    
    // 访问Dashboard
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 检查Dashboard元素
    await expect(page.locator('text=/仓位|Positions|收益|Earnings/i')).toBeVisible({ timeout: 10000 });
    
    // 测试侧边栏导航
    const sidebarLinks = [
      { text: '收益', url: '/dashboard/earnings' },
      { text: '交易', url: '/dashboard/transactions' },
      { text: '钱包', url: '/dashboard/wallets' },
      { text: '个人资料', url: '/dashboard/profile' }
    ];
    
    for (const link of sidebarLinks) {
      const linkElement = page.locator(`text=/${link.text}/i`).first();
      if (await linkElement.isVisible()) {
        await linkElement.click();
        await expect(page).toHaveURL(new RegExp(link.url));
        await page.goBack();
      }
    }
  });

  test('管理员面板测试', async ({ page }) => {
    // 使用管理员账户登录
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"], input[name="email"]', testAccounts.admin.email);
    await page.fill('input[type="password"], input[name="password"]', testAccounts.admin.password);
    await page.click('button[type="submit"]');
    
    // 等待登录完成
    await page.waitForTimeout(2000);
    
    // 访问管理员面板
    await page.goto(`${BASE_URL}/admin`);
    
    // 检查管理员面板元素
    await expect(page.locator('text=/用户管理|User Management|系统设置|System Settings/i')).toBeVisible({ timeout: 10000 });
    
    // 测试管理功能
    const adminLinks = [
      { text: '用户', url: '/admin/users' },
      { text: '产品', url: '/admin/products' },
      { text: '订单', url: '/admin/orders' },
      { text: '系统', url: '/admin/system' }
    ];
    
    for (const link of adminLinks) {
      const linkElement = page.locator(`text=/${link.text}/i`).first();
      if (await linkElement.isVisible()) {
        await linkElement.click();
        await expect(page).toHaveURL(new RegExp(link.url));
        await page.goBack();
      }
    }
  });

  test('API 健康检查', async ({ request }) => {
    // 检查API健康状态
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(data.status).toBe('ok');
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试不同设备尺寸
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(BASE_URL);
      
      // 检查导航菜单在不同尺寸下的表现
      if (viewport.name === 'Mobile') {
        // 移动端应该有汉堡菜单
        const mobileMenu = page.locator('[data-testid="mobile-menu"], button[aria-label*="menu"], .hamburger, [class*="burger"]');
        await expect(mobileMenu).toBeVisible();
      } else {
        // 桌面端应该显示完整导航
        await expect(page.locator('nav')).toBeVisible();
      }
    }
  });

  test('表单验证测试', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    // 测试空表单提交
    await page.click('button[type="submit"]');
    
    // 检查验证错误消息
    const errorMessage = page.locator('text=/必填|required|请输入/i');
    await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
    
    // 测试无效邮箱
    await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    const emailError = page.locator('text=/邮箱格式|email.*invalid|请输入有效/i');
    await expect(emailError.first()).toBeVisible({ timeout: 5000 });
  });

  test('页面性能测试', async ({ page }) => {
    // 开启性能监控
    await page.goto(BASE_URL);
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      };
    });
    
    // 验证性能指标
    expect(metrics.domContentLoaded).toBeLessThan(3000); // DOM加载应该在3秒内
    expect(metrics.loadComplete).toBeLessThan(5000); // 页面完全加载应该在5秒内
  });

  test('错误处理测试', async ({ page }) => {
    // 测试404页面
    await page.goto(`${BASE_URL}/non-existent-page`);
    await expect(page.locator('text=/404|找不到|not found/i')).toBeVisible({ timeout: 10000 });
    
    // 测试API错误处理
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"], input[name="email"]', 'wrong@email.com');
    await page.fill('input[type="password"], input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // 应该显示错误消息
    const errorMsg = page.locator('text=/错误|error|失败|failed|无效|invalid/i');
    await expect(errorMsg.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('业务流程测试', () => {
  test('完整购买流程', async ({ page }) => {
    // 1. 登录
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"], input[name="email"]', testAccounts.user.email);
    await page.fill('input[type="password"], input[name="password"]', testAccounts.user.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // 2. 浏览产品
    await page.goto(`${BASE_URL}/products`);
    
    // 3. 选择产品
    const productCard = page.locator('[data-testid="product-card"], .product-card, [class*="product"]').first();
    if (await productCard.isVisible()) {
      await productCard.click();
      
      // 4. 输入购买金额
      const amountInput = page.locator('input[type="number"], input[name="amount"]');
      if (await amountInput.isVisible()) {
        await amountInput.fill('100');
        
        // 5. 点击购买按钮
        const buyButton = page.locator('button:has-text("购买"), button:has-text("Buy"), button:has-text("投资")');
        if (await buyButton.isVisible()) {
          await buyButton.click();
          
          // 6. 确认交易
          const confirmButton = page.locator('button:has-text("确认"), button:has-text("Confirm")');
          if (await confirmButton.isVisible()) {
            await confirmButton.click();
          }
        }
      }
    }
  });

  test('推荐系统测试', async ({ page }) => {
    // 登录
    await page.goto(`${BASE_URL}/auth/login`);
    await page.fill('input[type="email"], input[name="email"]', testAccounts.agent.email);
    await page.fill('input[type="password"], input[name="password"]', testAccounts.agent.password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    
    // 访问推荐页面
    await page.goto(`${BASE_URL}/referral`);
    
    // 检查推荐码
    await expect(page.locator('text=/推荐码|Referral Code|邀请码/i')).toBeVisible({ timeout: 10000 });
    
    // 检查推荐链接
    const referralLink = page.locator('input[readonly], [data-testid="referral-link"]');
    if (await referralLink.isVisible()) {
      const value = await referralLink.inputValue();
      expect(value).toContain('ref=');
    }
  });
});

// 导出测试配置
export default {
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
};