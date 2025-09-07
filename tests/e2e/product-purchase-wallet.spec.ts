import { test, expect } from '@playwright/test';

test.describe('Product purchase wallet step', () => {
  test('shows connect wallet button on purchase page (gold)', async ({ page }) => {
    await page.goto('/products/purchase/gold');
    await expect(page.getByRole('button', { name: '连接钱包' })).toBeVisible();
  });
});

