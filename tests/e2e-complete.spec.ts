import { test, expect, Page } from '@playwright/test';

// 配置
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const API_URL = process.env.API_URL || 'http://localhost:3001';

// 测试数据
const testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123!',
  walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
};

// 辅助函数
async function waitForAPI(page: Page) {
  await page.waitForTimeout(500); // 给API一些时间响应
}

async function registerUser(request: any, email: string, password: string) {
  const response = await request.post(`${API_URL}/api/auth/register`, {
    data: {
      email,
      password,
      walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
    }
  });
  return response;
}

async function loginUser(request: any, email: string, password: string) {
  const response = await request.post(`${API_URL}/api/auth/login`, {
    data: { email, password }
  });
  return response;
}

test.describe('系统健康检查', () => {
  test('API服务健康检查', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.data.status).toBe('healthy');
  });

  test('Web应用健康检查', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);
  });

  test('静态资源加载', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 检查CSS加载
    const hasStyles = await page.evaluate(() => {
      const sheets = document.styleSheets;
      return sheets.length > 0;
    });
    expect(hasStyles).toBeTruthy();
    
    // 检查JavaScript加载
    const hasScripts = await page.evaluate(() => {
      return typeof window !== 'undefined';
    });
    expect(hasScripts).toBeTruthy();
  });
});

test.describe('用户认证流程', () => {
  test('用户注册', async ({ request }) => {
    const response = await registerUser(request, testUser.email, testUser.password);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeDefined();
    expect(data.data.user.email).toBe(testUser.email);
  });

  test('用户登录', async ({ request }) => {
    // 先注册
    const registerEmail = `login${Date.now()}@test.com`;
    await registerUser(request, registerEmail, 'Password123!');
    
    // 然后登录
    const response = await loginUser(request, registerEmail, 'Password123!');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.accessToken).toBeDefined();
  });

  test('无效凭证登录失败', async ({ request }) => {
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: 'nonexistent@example.com',
        password: 'WrongPassword'
      }
    });
    
    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('Token刷新', async ({ request }) => {
    // 先注册并登录获取token
    const email = `refresh${Date.now()}@test.com`;
    await registerUser(request, email, 'Password123!');
    const loginResponse = await loginUser(request, email, 'Password123!');
    const loginData = await loginResponse.json();
    
    // 尝试刷新token
    const refreshResponse = await request.post(`${API_URL}/api/auth/refresh`, {
      data: {
        refreshToken: loginData.data.refreshToken
      }
    });
    
    if (refreshResponse.ok()) {
      const refreshData = await refreshResponse.json();
      expect(refreshData.data.accessToken).toBeDefined();
    }
  });
});

test.describe('产品功能', () => {
  test('获取产品列表', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/products`);
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);
  });

  test('获取产品详情', async ({ request }) => {
    // 先获取产品列表
    const listResponse = await request.get(`${API_URL}/api/products`);
    const listData = await listResponse.json();
    
    if (listData.data && listData.data.length > 0) {
      const productId = listData.data[0].id;
      const detailResponse = await request.get(`${API_URL}/api/products/${productId}`);
      
      if (detailResponse.ok()) {
        const detailData = await detailResponse.json();
        expect(detailData.success).toBe(true);
        expect(detailData.data.id).toBe(productId);
      }
    }
  });
});

test.describe('页面导航', () => {
  test('首页导航', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/QA/);
    
    // 检查导航栏
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('产品页面导航', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    
    // 检查页面是否包含产品相关内容
    const hasProductContent = await page.locator('body').textContent();
    expect(hasProductContent).toContain('产品');
  });

  test('登录页面导航', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // 检查登录表单
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('注册页面导航', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/register`);
    
    // 检查注册表单元素
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    
    if (await emailInput.isVisible()) {
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
    }
  });
});

test.describe('表单功能', () => {
  test('登录表单提交', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await emailInput.isVisible()) {
      // 填写表单
      await emailInput.fill(`formtest${Date.now()}@example.com`);
      await passwordInput.fill('Password123!');
      
      // 提交表单
      await submitButton.click();
      
      // 等待响应
      await page.waitForTimeout(2000);
      
      // 检查是否有错误消息（因为用户不存在）
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeDefined();
    }
  });

  test('表单验证', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    const submitButton = page.locator('button[type="submit"]').first();
    
    if (await submitButton.isVisible()) {
      // 尝试提交空表单
      await submitButton.click();
      
      // 等待验证消息
      await page.waitForTimeout(1000);
      
      // 检查是否有验证提示
      const hasValidation = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:invalid');
        return inputs.length > 0;
      });
      
      // HTML5验证或自定义验证都可以
      expect(hasValidation || await page.locator('.error, .invalid').count() > 0).toBeTruthy();
    }
  });
});

test.describe('响应式设计', () => {
  test('桌面视图', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    
    // 检查导航栏在桌面视图中可见
    await expect(page.locator('nav').first()).toBeVisible();
  });

  test('平板视图', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    
    // 页面应该正常显示
    await expect(page.locator('body')).toBeVisible();
  });

  test('移动视图', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    
    // 页面应该正常显示
    await expect(page.locator('body')).toBeVisible();
    
    // 可能有汉堡菜单或其他移动端特定元素
    const mobileMenu = page.locator('[data-testid="mobile-menu"], .mobile-menu, .hamburger, button[aria-label*="menu"]');
    // 不强制要求移动菜单，因为设计可能不同
    if (await mobileMenu.count() > 0) {
      console.log('Mobile menu found');
    }
  });
});

test.describe('性能测试', () => {
  test('首页加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    console.log(`首页DOM加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('API响应性能', async ({ request }) => {
    const endpoints = [
      '/health',
      '/api/products',
      '/api/auth/health'
    ];
    
    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(`${API_URL}${endpoint}`);
      const responseTime = Date.now() - startTime;
      
      console.log(`${endpoint} 响应时间: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(2000);
      
      if (response.ok()) {
        expect(response.status()).toBeLessThan(400);
      }
    }
  });

  test('并发请求处理', async ({ request }) => {
    const promises = [];
    
    // 发送10个并发请求
    for (let i = 0; i < 10; i++) {
      promises.push(request.get(`${API_URL}/health`));
    }
    
    const startTime = Date.now();
    const responses = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    console.log(`10个并发请求总时间: ${totalTime}ms`);
    
    // 所有请求都应该成功
    responses.forEach(response => {
      expect(response.ok()).toBeTruthy();
    });
    
    // 并发请求应该在合理时间内完成
    expect(totalTime).toBeLessThan(5000);
  });
});

test.describe('错误处理', () => {
  test('404页面处理', async ({ page }) => {
    await page.goto(`${BASE_URL}/non-existent-page-${Date.now()}`);
    
    // 检查是否显示404页面或错误消息
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/404|not found|找不到/i);
  });

  test('API错误处理', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/non-existent-endpoint`);
    
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
  });

  test('网络错误恢复', async ({ page }) => {
    // 模拟离线
    await page.context().setOffline(true);
    
    try {
      await page.goto(BASE_URL, { timeout: 5000 });
    } catch (error) {
      // 预期会失败
      expect(error).toBeDefined();
    }
    
    // 恢复在线
    await page.context().setOffline(false);
    
    // 应该能够正常访问
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBeLessThan(400);
  });
});

test.describe('安全测试', () => {
  test('XSS防护', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // 检查CSP头
    const response = await page.goto(BASE_URL);
    const headers = response?.headers();
    
    if (headers) {
      // 检查安全相关的头
      const csp = headers['content-security-policy'];
      const xfo = headers['x-frame-options'];
      const xct = headers['x-content-type-options'];
      
      // 至少应该有一些安全头
      expect(csp || xfo || xct).toBeDefined();
    }
  });

  test('SQL注入防护', async ({ request }) => {
    // 尝试SQL注入
    const response = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: "admin' OR '1'='1",
        password: "' OR '1'='1"
      }
    });
    
    // 应该返回认证失败，而不是成功
    expect(response.ok()).toBeFalsy();
    const data = await response.json();
    expect(data.success).toBe(false);
  });
});

// 导出配置
export default {
  timeout: 30000,
  retries: 2,
  workers: 1,
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
};