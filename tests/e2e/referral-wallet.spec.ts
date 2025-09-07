import { test, expect } from '@playwright/test';

test.describe('Referral page wallet CTA', () => {
  test('shows wallet connect message or button', async ({ page }) => {
    await page.goto('/referral');

    const button = page.getByRole('button', { name: '连接钱包' });
    const message = page.getByText('请先连接钱包');

    await expect(button.or(message)).toBeVisible({ timeout: 10000 });
  });
});

