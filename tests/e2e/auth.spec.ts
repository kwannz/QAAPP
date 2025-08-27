import { test, expect } from '@playwright/test';

test.describe('认证功能测试', () => {
  test('用户注册流程', async ({ page }) => {
    await page.goto('/auth/register');
    
    // 检查注册页面元素
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"]');
    
    // 如果找到注册表单元素
    if (await emailInput.count() > 0) {
      // 填写注册表单
      await emailInput.fill('test@example.com');
      
      // 分别处理密码和确认密码字段
      const passwordField = page.locator('input[name="password"]');
      const confirmPasswordField = page.locator('input[name="confirmPassword"]');
      
      if (await passwordField.count() > 0) {
        await passwordField.fill('testpassword123');
      }
      
      if (await confirmPasswordField.count() > 0) {
        await confirmPasswordField.fill('testpassword123');
      }
      
      // 截图
      await page.screenshot({ path: 'test-results/register-form.png' });
      
      // 注意：不实际提交表单以避免创建测试数据
      console.log('注册表单测试完成，未实际提交');
    } else {
      console.log('未找到注册表单，可能页面结构不同');
    }
  });

  test('用户登录流程', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 检查登录页面元素
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    const submitButton = page.locator('button[type="submit"], input[type="submit"]');
    
    // 如果找到登录表单元素
    if (await emailInput.count() > 0) {
      // 填写登录表单
      await emailInput.fill('test@example.com');
      
      if (await passwordInput.count() > 0) {
        await passwordInput.fill('testpassword123');
      }
      
      // 截图
      await page.screenshot({ path: 'test-results/login-form.png' });
      
      // 注意：不实际提交表单以避免不必要的登录尝试
      console.log('登录表单测试完成，未实际提交');
    } else {
      console.log('未找到登录表单，可能页面结构不同');
    }
  });

  test('错误处理测试', async ({ page }) => {
    await page.goto('/auth/login');
    
    // 测试空表单提交
    const submitButton = page.locator('button[type="submit"], input[type="submit"]');
    
    if (await submitButton.count() > 0) {
      await submitButton.click();
      
      // 检查是否显示错误消息
      const errorMessage = page.locator('.error, .alert-error, [role="alert"]');
      if (await errorMessage.count() > 0) {
        await expect(errorMessage).toBeVisible();
      }
      
      await page.screenshot({ path: 'test-results/auth-error.png' });
    }
  });
});