import { test, expect } from '@playwright/test';

const types = ['silver', 'gold', 'diamond', 'platinum'] as const;

for (const type of types) {
  test(`未连接钱包：/products/purchase/${type} 显示连接按钮`, async ({ page }) => {
    await page.goto(`/products/purchase/${type}`);
    await expect(page.getByRole('button', { name: '连接钱包' })).toBeVisible();
  });
}

