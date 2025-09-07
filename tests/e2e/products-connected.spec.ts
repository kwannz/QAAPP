import { test, expect } from '@playwright/test';

test.describe('Products page connected override', () => {
  test('显示 已连接 与 网络名称', async ({ page }) => {
    await page.goto('/products?e2e_wallet=connected&e2e_chain=sepolia');
    await expect(page.getByText('钱包已连接')).toBeVisible();
    await expect(page.getByText('Sepolia 测试网')).toBeVisible();
  });
});

