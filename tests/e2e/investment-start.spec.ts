import { test, expect } from '@playwright/test';

test.describe('Investment start flow', () => {
  test('navigates from investments to products and shows invest CTA', async ({ page }) => {
    await page.goto('/investments');

    // Click 新增投资 which links to /products
    const addButton = page.getByRole('button', { name: '新增投资' });
    await expect(addButton).toBeVisible();
    await addButton.click();

    // Expect we are on the products page and see the main CTA
    await expect(page).toHaveURL(/\/products/);
    await expect(page.getByRole('heading', { name: '投资产品' })).toBeVisible();
    await expect(page.getByRole('button', { name: '立即投资' })).toBeVisible();
  });
});

