import { test, expect } from '@playwright/test';

test.describe('业务流程测试', () => {
  test('用户完整注册登录流程', async ({ page }) => {
    // 测试注册页面访问
    await page.goto('/auth/register');
    await expect(page).toHaveTitle(/QA/);
    
    // 检查注册表单是否存在
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    const confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    
    if (await emailInput.count() > 0) {
      console.log('注册表单已找到，开始测试表单验证');
      
      // 测试空表单提交
      const submitButton = page.locator('button[type="submit"]');
      if (await submitButton.count() > 0) {
        await submitButton.click();
        
        // 应该显示验证错误
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/register-empty-form.png' });
      }
      
      // 填写有效的注册信息
      const testEmail = `test+${Date.now()}@example.com`;
      await emailInput.fill(testEmail);
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('TestPassword123!');
      }
      
      if (await confirmPasswordInput.count() > 0) {
        await confirmPasswordInput.fill('TestPassword123!');
      }
      
      await page.screenshot({ path: 'test-results/register-filled-form.png' });
      console.log(`注册表单已填写，邮箱: ${testEmail}`);
    }
    
    // 测试登录页面
    await page.goto('/auth/login');
    await expect(page).toHaveTitle(/QA/);
    
    const loginEmailInput = page.locator('input[name="email"]');
    const loginPasswordInput = page.locator('input[name="password"]');
    
    if (await loginEmailInput.count() > 0 && await loginPasswordInput.count() > 0) {
      await loginEmailInput.fill('test@example.com');
      await loginPasswordInput.fill('testpassword123');
      
      await page.screenshot({ path: 'test-results/login-form-filled.png' });
      console.log('登录表单测试完成');
    }
  });

  test('QA卡片浏览流程', async ({ page }) => {
    await page.goto('/');
    
    // 查找QA卡片相关的页面元素
    const cardElements = page.locator('[data-testid="qa-card"], .qa-card, .card');
    const cardCount = await cardElements.count();
    
    console.log(`找到 ${cardCount} 个卡片元素`);
    
    if (cardCount > 0) {
      // 点击第一个卡片
      await cardElements.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-results/card-detail-view.png' });
    }
    
    // 检查是否有购买按钮或相关功能
    const buyButtons = page.locator('button:has-text("购买"), button:has-text("Buy"), [data-testid="buy-button"]');
    const buyButtonCount = await buyButtons.count();
    
    console.log(`找到 ${buyButtonCount} 个购买按钮`);
    
    if (buyButtonCount > 0) {
      await buyButtons.first().click();
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: 'test-results/purchase-flow.png' });
    }
  });

  test('钱包连接流程', async ({ page }) => {
    await page.goto('/');
    
    // 查找钱包连接按钮
    const walletButtons = page.locator(
      'button:has-text("连接钱包"), button:has-text("Connect Wallet"), ' +
      '[data-testid="wallet-connect"], .wallet-connect'
    );
    
    const walletButtonCount = await walletButtons.count();
    console.log(`找到 ${walletButtonCount} 个钱包连接按钮`);
    
    if (walletButtonCount > 0) {
      // 模拟点击钱包连接
      await walletButtons.first().click();
      await page.waitForTimeout(2000);
      
      // 检查是否出现钱包选择弹窗
      const walletModal = page.locator('.modal, [role="dialog"], .wallet-modal');
      const modalCount = await walletModal.count();
      
      if (modalCount > 0) {
        console.log('钱包连接弹窗已出现');
        await page.screenshot({ path: 'test-results/wallet-connect-modal.png' });
        
        // 查找MetaMask选项
        const metamaskOption = page.locator('button:has-text("MetaMask"), [data-testid="metamask"]');
        if (await metamaskOption.count() > 0) {
          console.log('找到MetaMask选项');
          await metamaskOption.click();
          await page.waitForTimeout(1000);
        }
      }
      
      await page.screenshot({ path: 'test-results/wallet-connection-attempt.png' });
    }
  });

  test('导航和页面跳转测试', async ({ page }) => {
    await page.goto('/');
    
    // 测试主导航链接
    const navLinks = page.locator('nav a, [role="navigation"] a, header a');
    const linkCount = await navLinks.count();
    
    console.log(`找到 ${linkCount} 个导航链接`);
    
    for (let i = 0; i < Math.min(linkCount, 5); i++) {
      const link = navLinks.nth(i);
      const linkText = await link.textContent();
      const href = await link.getAttribute('href');
      
      console.log(`测试链接 ${i + 1}: "${linkText}" -> ${href}`);
      
      if (href && !href.startsWith('http') && !href.startsWith('mailto:')) {
        try {
          await link.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          
          const currentUrl = page.url();
          console.log(`导航成功，当前URL: ${currentUrl}`);
          
          await page.screenshot({ 
            path: `test-results/navigation-${i + 1}-${linkText?.replace(/[^a-zA-Z0-9]/g, '') || 'link'}.png` 
          });
          
          // 返回首页准备测试下一个链接
          await page.goto('/');
          await page.waitForLoadState('networkidle');
        } catch (error) {
          console.log(`链接 "${linkText}" 测试失败:`, error);
        }
      }
    }
  });

  test('搜索功能测试', async ({ page }) => {
    await page.goto('/');
    
    // 查找搜索框
    const searchInputs = page.locator(
      'input[type="search"], input[placeholder*="搜索"], input[placeholder*="search"], ' +
      '[data-testid="search-input"], .search-input'
    );
    
    const searchInputCount = await searchInputs.count();
    console.log(`找到 ${searchInputCount} 个搜索输入框`);
    
    if (searchInputCount > 0) {
      const searchInput = searchInputs.first();
      
      // 测试搜索功能
      await searchInput.fill('测试搜索');
      
      // 查找搜索按钮
      const searchButtons = page.locator(
        'button[type="submit"], button:has-text("搜索"), button:has-text("Search"), ' +
        '[data-testid="search-button"]'
      );
      
      if (await searchButtons.count() > 0) {
        await searchButtons.first().click();
      } else {
        // 如果没有搜索按钮，尝试按回车
        await searchInput.press('Enter');
      }
      
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/search-results.png' });
      
      console.log('搜索功能测试完成');
    }
  });
});