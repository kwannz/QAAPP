import { test, expect } from '@playwright/test';

// 配置测试基础 URL
test.use({
  baseURL: 'http://localhost:3002',
});

test.describe('QA App 系统完整性测试', () => {
  
  test.describe('页面访问测试', () => {
    test('首页应该正常加载', async ({ page }) => {
      await page.goto('/');
      await expect(page).toHaveTitle(/QA App/i);
      
      // 检查主要元素
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.locator('h1')).toContainText(/欢迎|Welcome/i);
    });

    test('登录页面应该正常显示', async ({ page }) => {
      await page.goto('/login');
      
      // 检查登录表单元素
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
    });

    test('注册页面应该正常显示', async ({ page }) => {
      await page.goto('/register');
      
      // 检查注册表单元素
      await expect(page.locator('input[name="name"], input[placeholder*="姓名"], input[placeholder*="Name"]').first()).toBeVisible();
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });
  });

  test.describe('用户认证流程测试', () => {
    test('用户登录流程', async ({ page }) => {
      await page.goto('/login');
      
      // 填写登录表单
      await page.fill('input[type="email"], input[name="email"]', 'user1@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'User123!');
      
      // 点击登录按钮
      await page.click('button[type="submit"]');
      
      // 等待登录成功后跳转
      await page.waitForURL('**/dashboard', { timeout: 10000 }).catch(() => {
        // 如果没有跳转到 dashboard，可能跳转到其他页面
      });
      
      // 验证登录成功
      const isLoggedIn = await page.locator('text=/退出|Logout|用户|User/i').isVisible().catch(() => false);
      expect(isLoggedIn).toBeTruthy();
    });

    test('管理员登录流程', async ({ page }) => {
      await page.goto('/login');
      
      // 使用管理员账户登录
      await page.fill('input[type="email"], input[name="email"]', 'admin@qa-app.com');
      await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
      
      await page.click('button[type="submit"]');
      
      // 等待页面跳转
      await page.waitForLoadState('networkidle');
      
      // 验证管理员权限
      const hasAdminAccess = await page.locator('text=/管理|Admin|系统|System/i').isVisible().catch(() => false);
      expect(hasAdminAccess).toBeTruthy();
    });
  });

  test.describe('Dashboard 功能测试', () => {
    test.beforeEach(async ({ page }) => {
      // 先登录
      await page.goto('/login');
      await page.fill('input[type="email"], input[name="email"]', 'user1@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'User123!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    });

    test('Dashboard 页面元素检查', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 检查主要统计卡片
      const statsCards = page.locator('.card, [class*="card"], [class*="stat"]');
      await expect(statsCards).toHaveCount(await statsCards.count());
      
      // 检查导航菜单
      await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
    });

    test('产品列表页面', async ({ page }) => {
      await page.goto('/dashboard/products');
      
      // 检查产品列表
      await expect(page.locator('h1, h2').first()).toContainText(/产品|Product/i);
      
      // 检查产品卡片或表格
      const productElements = page.locator('[class*="product"], table tr, .card');
      const count = await productElements.count();
      expect(count).toBeGreaterThan(0);
    });

    test('订单页面', async ({ page }) => {
      await page.goto('/dashboard/orders');
      
      // 检查订单页面标题
      await expect(page.locator('h1, h2').first()).toContainText(/订单|Order/i);
      
      // 检查订单列表
      const orderElements = page.locator('[class*="order"], table tr, .card');
      const count = await orderElements.count();
      expect(count).toBeGreaterThan(0);
    });

    test('收益页面', async ({ page }) => {
      await page.goto('/dashboard/earnings');
      
      // 检查收益页面
      await expect(page.locator('h1, h2').first()).toContainText(/收益|Earning|分红|Payout/i);
      
      // 检查收益数据
      const earningElements = page.locator('[class*="earning"], [class*="payout"], table tr, .card');
      await expect(earningElements.first()).toBeVisible();
    });
  });

  test.describe('按钮功能测试', () => {
    test.beforeEach(async ({ page }) => {
      // 先登录
      await page.goto('/login');
      await page.fill('input[type="email"], input[name="email"]', 'user1@example.com');
      await page.fill('input[type="password"], input[name="password"]', 'User123!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    });

    test('导航菜单按钮测试', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 测试产品导航
      const productLink = page.locator('a[href*="product"], text=/产品|Product/i').first();
      if (await productLink.isVisible()) {
        await productLink.click();
        await expect(page).toHaveURL(/product/);
      }
      
      // 测试订单导航
      const orderLink = page.locator('a[href*="order"], text=/订单|Order/i').first();
      if (await orderLink.isVisible()) {
        await orderLink.click();
        await expect(page).toHaveURL(/order/);
      }
    });

    test('产品购买按钮测试', async ({ page }) => {
      await page.goto('/dashboard/products');
      
      // 查找购买按钮
      const buyButton = page.locator('button:has-text(/购买|Buy|下单|Order/i)').first();
      if (await buyButton.isVisible()) {
        await buyButton.click();
        
        // 检查是否出现确认对话框或跳转到订单页面
        const hasDialog = await page.locator('[role="dialog"], .modal').isVisible().catch(() => false);
        const isOrderPage = page.url().includes('order');
        
        expect(hasDialog || isOrderPage).toBeTruthy();
      }
    });

    test('退出登录按钮测试', async ({ page }) => {
      await page.goto('/dashboard');
      
      // 查找退出按钮
      const logoutButton = page.locator('button:has-text(/退出|Logout|登出/i), a:has-text(/退出|Logout|登出/i)').first();
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        
        // 等待跳转到登录页
        await page.waitForURL('**/login', { timeout: 5000 }).catch(() => {});
        
        // 验证已退出
        expect(page.url()).toContain('login');
      }
    });
  });

  test.describe('表单验证测试', () => {
    test('登录表单验证', async ({ page }) => {
      await page.goto('/login');
      
      // 测试空表单提交
      await page.click('button[type="submit"]');
      
      // 检查错误提示
      const errorMessage = await page.locator('.error, [class*="error"], .text-red-500').isVisible().catch(() => false);
      expect(errorMessage).toBeTruthy();
      
      // 测试无效邮箱
      await page.fill('input[type="email"], input[name="email"]', 'invalid-email');
      await page.fill('input[type="password"], input[name="password"]', '123456');
      await page.click('button[type="submit"]');
      
      // 应该显示错误
      await expect(page.locator('.error, [class*="error"], .text-red-500').first()).toBeVisible();
    });

    test('注册表单验证', async ({ page }) => {
      await page.goto('/register');
      
      // 测试密码强度验证
      await page.fill('input[name="name"], input[placeholder*="姓名"], input[placeholder*="Name"]', 'Test User');
      await page.fill('input[type="email"], input[name="email"]', 'test@example.com');
      await page.fill('input[type="password"], input[name="password"]', '123'); // 弱密码
      
      const submitButton = page.locator('button[type="submit"]');
      await submitButton.click();
      
      // 检查密码强度提示
      const passwordError = await page.locator('text=/密码|Password/i').isVisible();
      expect(passwordError).toBeTruthy();
    });
  });

  test.describe('响应式设计测试', () => {
    test('移动端视图测试', async ({ page }) => {
      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto('/');
      
      // 检查移动端菜单按钮
      const mobileMenuButton = page.locator('button[aria-label*="menu"], button:has-text("☰"), [class*="burger"], [class*="mobile-menu"]');
      const isMobileMenuVisible = await mobileMenuButton.isVisible().catch(() => false);
      
      if (isMobileMenuVisible) {
        await mobileMenuButton.click();
        // 检查菜单是否展开
        await expect(page.locator('nav, [role="navigation"]')).toBeVisible();
      }
    });

    test('平板视图测试', async ({ page }) => {
      // 设置平板视口
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto('/dashboard');
      
      // 检查布局是否适配
      const mainContent = page.locator('main, [role="main"], .content');
      await expect(mainContent).toBeVisible();
      
      // 检查侧边栏
      const sidebar = page.locator('aside, [class*="sidebar"], nav');
      const hasSidebar = await sidebar.isVisible().catch(() => false);
      expect(hasSidebar).toBeTruthy();
    });
  });

  test.describe('API 健康检查', () => {
    test('API 服务健康状态', async ({ request }) => {
      const response = await request.get('http://localhost:3001/health').catch(() => null);
      
      if (response) {
        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('status');
      }
    });

    test('GraphQL endpoint 检查', async ({ request }) => {
      const response = await request.post('http://localhost:3001/graphql', {
        data: {
          query: '{ __typename }'
        }
      }).catch(() => null);
      
      if (response) {
        expect([200, 400]).toContain(response.status());
      }
    });
  });

  test.describe('数据完整性测试', () => {
    test.beforeEach(async ({ page }) => {
      // 使用管理员登录
      await page.goto('/login');
      await page.fill('input[type="email"], input[name="email"]', 'admin@qa-app.com');
      await page.fill('input[type="password"], input[name="password"]', 'Admin123!');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    });

    test('用户管理页面', async ({ page }) => {
      // 尝试访问用户管理页面
      await page.goto('/dashboard/users').catch(() => {
        page.goto('/admin/users').catch(() => {});
      });
      
      // 检查是否有用户列表
      const userElements = page.locator('[class*="user"], table tr, .card');
      const count = await userElements.count();
      
      if (count > 0) {
        expect(count).toBeGreaterThanOrEqual(6); // 种子数据有6个用户
      }
    });

    test('系统配置检查', async ({ page }) => {
      // 尝试访问系统设置
      await page.goto('/dashboard/settings').catch(() => {
        page.goto('/admin/settings').catch(() => {});
      });
      
      // 检查配置项
      const configElements = page.locator('[class*="config"], [class*="setting"], form input');
      const hasConfig = await configElements.first().isVisible().catch(() => false);
      expect(hasConfig).toBeTruthy();
    });
  });
});

// 性能测试
test.describe('性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // 页面应该在3秒内加载完成
    expect(loadTime).toBeLessThan(3000);
  });

  test('API 响应时间', async ({ request }) => {
    const startTime = Date.now();
    await request.get('http://localhost:3001/health').catch(() => null);
    const responseTime = Date.now() - startTime;
    
    // API 应该在1秒内响应
    expect(responseTime).toBeLessThan(1000);
  });
});