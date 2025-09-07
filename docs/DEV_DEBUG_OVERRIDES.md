# 开发调试覆盖说明（钱包/网络）

本项目在开发/调试模式下提供 URL 覆盖参数，便于在没有真实钱包环境的情况下验证各页面的钱包/网络相关 UI 和交互。

## 开启条件
- `NODE_ENV !== 'production'` 或 `NEXT_PUBLIC_ENABLE_DEBUG=true`

## 使用方式
- 在任意页面 URL 追加查询参数：
  - `e2e_wallet=connected` 强制显示“钱包已连接”UI
  - `e2e_chain=sepolia|mainnet|local` 指定网络名称与 Chain ID（默认 sepolia）

示例：
- `/dashboard?e2e_wallet=connected&e2e_chain=sepolia`
- `/products/purchase/gold?e2e_wallet=connected&e2e_chain=mainnet`

## 页面兼容列表
- 顶部调试覆盖条（WalletConnectionManager）：
  - `/`（首页）
  - `/dashboard`
  - `/referral`
  - `/products`
  - `/investments`
  - `/products/purchase/[type]`（gold/silver/diamond/platinum）
  - `/notifications`
  - `/reports`
  - `/settings`
  - `/admin/analytics`
  - `/admin/settings`

## 购买页“切换网络”模拟
- 在 `?e2e_wallet=connected` 模式下，“切换网络”按钮不会调用真实钱包；点击后：
  - 网络提示消失
  - 按钮消失
  - 显示调试提示：`已切换到 Sepolia 测试网`

## E2E 测试
- 浏览器安装：`pnpm exec playwright install`
- 运行：`pnpm test:e2e`
- 指定基础 URL：`PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 pnpm test:e2e`

覆盖相关的用例包括：
- `tests/e2e/*-connected.spec.ts`（已连接覆盖）
- `tests/e2e/product-purchase-connected.spec.ts`（切换网络模拟）
- 其他未连接态与流程用例：`tests/e2e/*.spec.ts`

## 注意事项
- 覆盖逻辑仅用于开发/测试，不影响生产环境行为。
- 若生产也需要开启覆盖功能，请显式设置 `NEXT_PUBLIC_ENABLE_DEBUG=true`（不建议）。
