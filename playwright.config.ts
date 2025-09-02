import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright配置文件
 * 用于QA应用的端到端测试
 */
export default defineConfig({
  testDir: './tests',
  // 高级测试配置
  timeout: 60000, // 增加超时时间支持复杂测试
  expect: {
    timeout: 10000 // 增加断言超时
  },
  /* 并行运行测试 */
  fullyParallel: true,
  /* 在CI上失败时禁止重试 */
  forbidOnly: !!process.env.CI,
  /* CI上重试失败的测试 */
  retries: process.env.CI ? 2 : 0,
  /* 选择报告器 */
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  /* 全局设置 */
  use: {
    /* 在测试失败时收集跟踪信息 */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    /* 基础URL */
    baseURL: 'http://localhost:3003',
  },

  /* 配置不同浏览器的测试项目 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* 测试前启动本地开发服务器 */
  // webServer: [
  //   {
  //     command: 'pnpm --filter @qa-app/web dev',
  //     port: 3003,
  //     reuseExistingServer: !process.env.CI,
  //   }
  // ],
});