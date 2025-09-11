import { defineConfig, devices } from '@playwright/test';

const useStandalone = process.env.PLAYWRIGHT_WEB_STANDALONE !== 'false';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list', { printSteps: true }],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'playwright-results.json' }]
  ],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
    env: {
      NEXT_PUBLIC_ENABLE_TESTNET: 'true',
      NEXT_PUBLIC_ENABLE_DEBUG: 'true',
    },
    launchOptions: {
      args: ['--verbose', '--enable-logging=stderr', '--v=1'],
      logger: {
        isEnabled: () => true,
        log: (name, severity, message, args) => {
          console.log(`[${new Date().toISOString()}] [${severity}] ${name}: ${message}`, args || '');
        }
      }
    }
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  // Start a dedicated web server for e2e to avoid stale builds
  webServer: useStandalone
    ? {
        // Start Next.js standalone output from custom dist dir
        command: 'sh -c "cd apps/web && pnpm build && PORT=3005 node dist/standalone/apps/web/server.js"',
        port: 3005,
        reuseExistingServer: false,
        timeout: 120000,
        env: {
          NEXT_PUBLIC_ENABLE_TESTNET: 'true',
          NEXT_PUBLIC_ENABLE_DEBUG: 'true',
          PORT: '3005',
        },
      }
    : {
        // Fallback to next start for environments where standalone causes issues
        command: 'sh -c "cd apps/web && pnpm build && pnpm start -p 3005"',
        port: 3005,
        reuseExistingServer: false,
        timeout: 120000,
        env: {
          NEXT_PUBLIC_ENABLE_TESTNET: 'true',
          NEXT_PUBLIC_ENABLE_DEBUG: 'true',
        },
      },
});
