import { defineConfig, devices } from '@playwright/test';

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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1280, height: 720 },
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
  // Expect an already running server; this avoids sandbox port issues
  webServer: {
    command: 'echo "Using existing server"',
    port: 3000,
    reuseExistingServer: true,
  },
});
