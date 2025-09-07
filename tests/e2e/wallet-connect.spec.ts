import { test, expect } from '@playwright/test';

test.describe('Wallet connect UI (dev server required at :3000)', () => {
  test('dashboard shows connect wallet call-to-action', async ({ page }) => {
    await page.goto('/dashboard');

    // Accept either the button or the helper text variant
    const button = page.getByRole('button', { name: '连接钱包' });
    const helper = page.getByText('请选择一个钱包连接到QA投资平台');

    await expect(button.or(helper)).toBeVisible({ timeout: 10000 });
  });
});

