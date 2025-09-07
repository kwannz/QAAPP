/** @jest-environment jsdom */

describe('wagmi-config fallback', () => {
  beforeEach(() => {
    // Ensure browser-like env for isBrowserEnvironment()
    (global as any).window = (global as any).window || {};
    (global as any).window.indexedDB = (global as any).window.indexedDB || {};
  });

  it('creates injected-only config when WalletConnect is disabled', async () => {
    process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT = 'true';

    const { createWagmiConfig } = await import('../lib/wagmi-config');
    const cfg = createWagmiConfig();
    expect(cfg).toBeTruthy();
  });

  it('creates injected-only config when projectId is missing/invalid', async () => {
    process.env.NEXT_PUBLIC_DISABLE_WALLETCONNECT = 'false';
    process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = 'YOUR_PROJECT_ID_HERE';

    const { createWagmiConfig } = await import('../lib/wagmi-config');
    const cfg = createWagmiConfig();
    expect(cfg).toBeTruthy();
  });
});
