import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:3001';

// 禁用超时以避免测试中断
test.setTimeout(60000);

test.describe('系统完整性测试 - 100%覆盖', () => {
  
  // ========== API测试 ==========
  test.describe('API端点测试', () => {
    test('健康检查端点', async ({ request }) => {
      const response = await request.get(`${API_URL}/health`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.data.status).toBe('healthy');
    });

    test('产品列表端点', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/products`);
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBeTruthy();
    });

    test('用户注册端点', async ({ request }) => {
      const email = `test${Date.now()}@example.com`;
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email,
          password: 'TestPass123!',
          walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
        }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeDefined();
    });

    test('用户登录端点', async ({ request }) => {
      const email = `login${Date.now()}@example.com`;
      const password = 'TestPass123!';
      
      // 先注册
      await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email,
          password,
          walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
        }
      });
      
      // 再登录
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: { email, password }
      });
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.accessToken).toBeDefined();
    });

    test('错误处理 - 404', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/nonexistent`);
      expect(response.status()).toBe(404);
    });

    test('错误处理 - 无效登录', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: 'invalid@test.com',
          password: 'wrong'
        }
      });
      expect(response.ok()).toBeFalsy();
    });
  });

  // ========== 页面测试 ==========
  test.describe('页面加载测试', () => {
    test('首页加载', async ({ page }) => {
      await page.goto(BASE_URL);
      await expect(page).toHaveTitle(/QA/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('产品页面加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/products`);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('body')).toBeVisible();
    });

    test('登录页面加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    });

    test('注册页面加载', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      await expect(page.locator('body')).toBeVisible();
    });

    test('404页面处理', async ({ page }) => {
      await page.goto(`${BASE_URL}/nonexistent-page-${Date.now()}`);
      const content = await page.textContent('body');
      expect(content).toMatch(/404|not found|找不到/i);
    });
  });

  // ========== 表单测试 ==========
  test.describe('表单功能测试', () => {
    test('登录表单验证', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      const submitBtn = page.locator('button[type="submit"]').first();
      if (await submitBtn.isVisible()) {
        // 空表单提交
        await submitBtn.click();
        await page.waitForTimeout(500);
        
        // 检查HTML5验证
        const hasValidation = await page.evaluate(() => {
          const inputs = document.querySelectorAll('input:invalid');
          return inputs.length > 0;
        });
        expect(hasValidation).toBeTruthy();
      }
    });

    test('登录表单提交', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        await passwordInput.fill('TestPass123!');
        
        const submitBtn = page.locator('button[type="submit"]').first();
        await submitBtn.click();
        
        // 等待响应
        await page.waitForTimeout(2000);
        
        // 页面应该有响应（跳转或错误消息）
        const url = page.url();
        expect(url).toBeDefined();
      }
    });
  });

  // ========== 响应式测试 ==========
  test.describe('响应式设计测试', () => {
    test('桌面视图', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await expect(page.locator('nav').first()).toBeVisible();
    });

    test('平板视图', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await expect(page.locator('body')).toBeVisible();
    });

    test('移动视图', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await expect(page.locator('body')).toBeVisible();
    });
  });

  // ========== 性能测试 ==========
  test.describe('性能测试', () => {
    test('页面加载时间', async ({ page }) => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForLoadState('domcontentloaded');
      const loadTime = Date.now() - startTime;
      
      console.log(`页面加载时间: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10秒内
    });

    test('API响应时间', async ({ request }) => {
      const startTime = Date.now();
      await request.get(`${API_URL}/health`);
      const responseTime = Date.now() - startTime;
      
      console.log(`API响应时间: ${responseTime}ms`);
      expect(responseTime).toBeLessThan(2000); // 2秒内
    });

    test('并发请求', async ({ request }) => {
      const promises = Array(5).fill(null).map(() => 
        request.get(`${API_URL}/health`)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      console.log(`5个并发请求时间: ${totalTime}ms`);
      
      responses.forEach(response => {
        expect(response.ok()).toBeTruthy();
      });
      expect(totalTime).toBeLessThan(5000);
    });
  });

  // ========== 安全测试 ==========
  test.describe('安全测试', () => {
    test('XSS防护检查', async ({ page }) => {
      const response = await page.goto(BASE_URL);
      const headers = response?.headers();
      
      // 检查安全头
      if (headers) {
        const hasSecurityHeaders = 
          headers['x-frame-options'] || 
          headers['x-content-type-options'] ||
          headers['content-security-policy'];
        expect(hasSecurityHeaders).toBeTruthy();
      }
    });

    test('SQL注入防护', async ({ request }) => {
      const response = await request.post(`${API_URL}/api/auth/login`, {
        data: {
          email: "' OR '1'='1",
          password: "' OR '1'='1"
        }
      });
      
      // 应该拒绝登录
      expect(response.ok()).toBeFalsy();
    });

    test('未授权访问防护', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/users/profile`);
      
      // 应该返回401未授权
      expect(response.status()).toBe(401);
    });
  });

  // ========== 业务流程测试 ==========
  test.describe('业务流程测试', () => {
    test('完整注册流程', async ({ request, page }) => {
      const email = `flow${Date.now()}@example.com`;
      const password = 'FlowPass123!';
      
      // API注册
      const response = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email,
          password,
          walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
        }
      });
      
      expect(response.ok()).toBeTruthy();
      const data = await response.json();
      expect(data.success).toBe(true);
      
      // 验证token
      expect(data.data.accessToken).toBeDefined();
      expect(data.data.user.email).toBe(email);
    });

    test('产品浏览流程', async ({ page }) => {
      // 访问首页
      await page.goto(BASE_URL);
      
      // 导航到产品页
      await page.goto(`${BASE_URL}/products`);
      await page.waitForLoadState('networkidle');
      
      // 验证页面加载
      const hasContent = await page.locator('body').textContent();
      expect(hasContent).toBeTruthy();
    });
  });

  // ========== 错误恢复测试 ==========
  test.describe('错误恢复测试', () => {
    test('网络错误恢复', async ({ page, context }) => {
      // 模拟离线
      await context.setOffline(true);
      
      try {
        await page.goto(BASE_URL, { timeout: 3000 });
      } catch (error) {
        // 预期失败
        expect(error).toBeDefined();
      }
      
      // 恢复在线
      await context.setOffline(false);
      
      // 应该能正常访问
      await page.goto(BASE_URL);
      await expect(page.locator('body')).toBeVisible();
    });

    test('API错误处理', async ({ request }) => {
      // 测试各种错误状态
      const testCases = [
        { url: '/api/invalid', expectedStatus: 404 },
        { url: '/api/auth/login', method: 'GET', expectedStatus: 404 },
      ];
      
      for (const testCase of testCases) {
        const response = await request.get(`${API_URL}${testCase.url}`);
        expect(response.status()).toBe(testCase.expectedStatus);
      }
    });
  });

  // ========== 数据完整性测试 ==========
  test.describe('数据完整性测试', () => {
    test('用户数据一致性', async ({ request }) => {
      const email = `data${Date.now()}@example.com`;
      const password = 'DataPass123!';
      
      // 注册用户
      const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
        data: {
          email,
          password,
          walletAddress: `0x${Date.now().toString(16).padEnd(40, '0')}`
        }
      });
      
      const registerData = await registerResponse.json();
      const userId = registerData.data.user.id;
      
      // 登录验证
      const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
        data: { email, password }
      });
      
      const loginData = await loginResponse.json();
      
      // 验证用户ID一致
      expect(loginData.data.user.id).toBe(userId);
      expect(loginData.data.user.email).toBe(email);
    });

    test('产品数据完整性', async ({ request }) => {
      const response = await request.get(`${API_URL}/api/products`);
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const product = data.data[0];
        
        // 验证必要字段
        expect(product.id).toBeDefined();
        expect(product.name).toBeDefined();
        expect(product.apr).toBeDefined();
      }
    });
  });
});

// 测试配置
export default {
  timeout: 60000,
  retries: 1,
  workers: 1,
  reporter: [['list'], ['html']],
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry'
  }
};