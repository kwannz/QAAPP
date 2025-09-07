import { test, expect } from '@playwright/test';

test.describe('Purchase page with connected wallet (E2E override)', () => {
  test('显示 已连接、断开按钮 与网络名称', async ({ page }) => {
    await page.goto('/products/purchase/gold?e2e_wallet=connected&e2e_chain=sepolia');

    await expect(page.getByText('钱包已连接')).toBeVisible();
    await expect(page.getByRole('button', { name: '断开' })).toBeVisible();
    await expect(page.getByText('Sepolia 测试网')).toBeVisible();
  });

  test('显示 余额 与 截断地址', async ({ page }) => {
    await page.goto('/products/purchase/gold?e2e_wallet=connected&e2e_chain=sepolia');

    await expect(page.getByText('USDT 余额')).toBeVisible();
    await expect(page.getByText('1.2345')).toBeVisible();
    await expect(page.getByText('钱包地址')).toBeVisible();
    // 由覆盖逻辑提供的演示地址会被截断为 0xAbCdE...Ef12
    await expect(page.getByText('0xAbCdE...Ef12')).toBeVisible();
  });

  test('错误网络时显示切换网络提示', async ({ page }) => {
    // 在测试/开发模式下，mainnet 被视为错误网络（当开启测试网）
    await page.goto('/products/purchase/gold?e2e_wallet=connected&e2e_chain=mainnet');

    await expect(page.getByText('以太坊主网')).toBeVisible();
    await expect(page.getByRole('button', { name: '切换网络' })).toBeVisible();

    // 点击切换网络，进入模拟切换完成状态
    await page.getByRole('button', { name: '切换网络' }).click();
    await expect(page.getByTestId('debug-network-switched')).toBeVisible();
    // 切换按钮不再可见
    await expect(page.getByRole('button', { name: '切换网络' })).toHaveCount(0);
    // 网络切换提示消失
    await expect(page.getByText(/请切换到 .* 网络/)).toHaveCount(0);
  });
});
