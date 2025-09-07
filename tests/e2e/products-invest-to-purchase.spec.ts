import { test, expect } from '@playwright/test';

test.describe('Products → Purchase flow', () => {
  test('clicking 立即投资 opens purchase page with wallet CTA', async ({ page }) => {
    await page.goto('/products');

    // 点击第一个“立即投资”按钮
    const investButtons = page.getByRole('button', { name: '立即投资' });
    await expect(investButtons.first()).toBeVisible();
    await investButtons.first().click();

    // 应跳转到 /products/purchase/{slug}
    await expect(page).toHaveURL(/\/products\/purchase\//);

    // 购买页显示“连接钱包”CTA
    await expect(page.getByRole('button', { name: '连接钱包' })).toBeVisible();
  });
});

