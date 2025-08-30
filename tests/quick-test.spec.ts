import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3002';
const API_URL = 'http://localhost:3001';

test.describe('快速系统验证', () => {
  test('API健康检查', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.data.status).toBe('healthy');
  });

  test('用户注册和登录', async ({ request }) => {
    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;
    
    // 注册
    const registerResponse = await request.post(`${API_URL}/api/auth/register`, {
      data: {
        email: testEmail,
        password: 'TestPassword123!',
        walletAddress: `0x${timestamp.toString(16).padEnd(40, '0')}`
      }
    });
    expect(registerResponse.ok()).toBeTruthy();
    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);
    expect(registerData.data.accessToken).toBeTruthy();
    
    // 登录
    const loginResponse = await request.post(`${API_URL}/api/auth/login`, {
      data: {
        email: testEmail,
        password: 'TestPassword123!'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.data.accessToken).toBeTruthy();
  });

  test('产品列表API', async ({ request }) => {
    const response = await request.get(`${API_URL}/api/products`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBeTruthy();
  });

  test('Web首页加载', async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page).toHaveTitle(/QA/);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('产品页面访问', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    // 检查页面是否包含产品相关内容
    const hasProductContent = await page.locator('text=/产品|Product|固定收益|Fixed/i').count() > 0;
    expect(hasProductContent).toBeTruthy();
  });

  test('登录页面功能', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`);
    
    // 检查登录表单元素
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('响应式设计', async ({ page }) => {
    // 桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(BASE_URL);
    await expect(page.locator('nav')).toBeVisible();
    
    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(BASE_URL);
    // 页面应该仍然可以正常显示
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('性能测试', () => {
  test('页面加载性能', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    
    console.log(`页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000); // 5秒内加载完成
  });

  test('API响应时间', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${API_URL}/health`);
    const responseTime = Date.now() - startTime;
    
    console.log(`API响应时间: ${responseTime}ms`);
    expect(response.ok()).toBeTruthy();
    expect(responseTime).toBeLessThan(1000); // 1秒内响应
  });
});