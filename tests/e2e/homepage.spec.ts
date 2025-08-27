import { test, expect } from '@playwright/test';

test.describe('首页测试', () => {
  test('应该正确加载首页', async ({ page }) => {
    await page.goto('/');
    
    // 检查页面标题
    await expect(page).toHaveTitle(/QA/);
    
    // 检查页面是否包含关键元素
    await expect(page.locator('body')).toBeVisible();
    
    // 截图用于调试
    await page.screenshot({ path: 'test-results/homepage-screenshot.png' });
  });

  test('导航菜单功能', async ({ page }) => {
    await page.goto('/');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
    
    // 检查导航链接是否存在并可点击
    const navLinks = page.locator('nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    
    if (linkCount > 0) {
      // 测试第一个导航链接
      const firstLink = navLinks.first();
      await expect(firstLink).toBeVisible();
      
      // 如果链接可点击，测试点击功能
      if (await firstLink.isEnabled()) {
        await firstLink.click();
        await page.waitForLoadState('networkidle');
      }
    }
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试桌面端
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.screenshot({ path: 'test-results/desktop-view.png' });
    
    // 测试平板端
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await page.screenshot({ path: 'test-results/tablet-view.png' });
    
    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.screenshot({ path: 'test-results/mobile-view.png' });
  });
});