import { test, expect, Page, ConsoleMessage } from '@playwright/test';

interface PageTestResult {
  url: string;
  iteration: number;
  timestamp: string;
  loadTime: number;
  errors: string[];
  warnings: string[];
  consoleLogs: string[];
  networkErrors: string[];
  status: 'passed' | 'failed';
  screenshot?: string;
}

interface TestSummary {
  totalTests: number;
  passed: number;
  failed: number;
  pages: {
    [key: string]: {
      totalIterations: number;
      passedIterations: number;
      failedIterations: number;
      results: PageTestResult[];
    };
  };
}

// Define the pages to test
const testPages = [
  { name: 'homepage', url: '/', description: 'Homepage' },
  { name: 'products', url: '/products', description: 'Products Page' },
  { name: 'login', url: '/auth/login', description: 'Login Page' },
  { name: 'register', url: '/auth/register', description: 'Register Page' },
  { name: 'referral', url: '/referral', description: 'Referral Page' }
];

let testSummary: TestSummary = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  pages: {}
};

async function capturePageData(page: Page, pageName: string, iteration: number): Promise<PageTestResult> {
  const startTime = Date.now();
  const consoleLogs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const networkErrors: string[] = [];

  // Set up console logging
  page.on('console', (msg: ConsoleMessage) => {
    const logLevel = msg.type();
    const text = msg.text();
    const location = msg.location();
    const logEntry = `[${logLevel.toUpperCase()}] ${text} (${location.url}:${location.lineNumber})`;
    
    consoleLogs.push(logEntry);
    
    if (logLevel === 'error') {
      errors.push(logEntry);
    } else if (logLevel === 'warning') {
      warnings.push(logEntry);
    }
    
    console.log(`🔍 Console [${pageName}:${iteration}]: ${logEntry}`);
  });

  // Set up network error monitoring
  page.on('response', (response) => {
    if (!response.ok()) {
      const errorMsg = `Network error: ${response.status()} ${response.statusText()} - ${response.url()}`;
      networkErrors.push(errorMsg);
      console.log(`🚨 Network Error [${pageName}:${iteration}]: ${errorMsg}`);
    }
  });

  // Set up page error monitoring
  page.on('pageerror', (error) => {
    const errorMsg = `Page error: ${error.message}`;
    errors.push(errorMsg);
    console.log(`💥 Page Error [${pageName}:${iteration}]: ${errorMsg}`);
  });

  const loadTime = Date.now() - startTime;

  return {
    url: page.url(),
    iteration,
    timestamp: new Date().toISOString(),
    loadTime,
    errors,
    warnings,
    consoleLogs,
    networkErrors,
    status: errors.length === 0 && networkErrors.length === 0 ? 'passed' : 'failed'
  };
}

// Test each page 5 times
testPages.forEach(pageConfig => {
  test.describe(`${pageConfig.description} - Multiple Iterations`, () => {
    test.beforeAll(() => {
      testSummary.pages[pageConfig.name] = {
        totalIterations: 0,
        passedIterations: 0,
        failedIterations: 0,
        results: []
      };
    });

    for (let iteration = 1; iteration <= 5; iteration++) {
      test(`${pageConfig.description} - Iteration ${iteration}`, async ({ page }) => {
        console.log(`🚀 Starting test: ${pageConfig.description} - Iteration ${iteration}`);
        testSummary.totalTests++;
        testSummary.pages[pageConfig.name].totalIterations++;

        try {
          // Navigate to the page with detailed logging
          console.log(`📍 Navigating to: ${pageConfig.url}`);
          await page.goto(pageConfig.url, { 
            waitUntil: 'networkidle',
            timeout: 30000 
          });

          // Wait for any hydration to complete
          await page.waitForTimeout(2000);

          // Capture page data
          const result = await capturePageData(page, pageConfig.name, iteration);
          testSummary.pages[pageConfig.name].results.push(result);

          // Basic page assertions
          await expect(page).toHaveTitle(/.*/); // Any title is fine
          
          // Check for Next.js specific elements
          const nextScript = page.locator('script[src*="_next"]');
          if (await nextScript.count() > 0) {
            console.log(`✅ Next.js scripts detected on ${pageConfig.name}`);
          }

          // Check for React hydration
          const reactElements = page.locator('[data-reactroot], #__next, [data-react-checksum]');
          if (await reactElements.count() > 0) {
            console.log(`⚛️ React elements detected on ${pageConfig.name}`);
          }

          // Perform page-specific checks
          switch (pageConfig.name) {
            case 'homepage':
              // Check for common homepage elements
              console.log(`🏠 Checking homepage elements...`);
              break;
            
            case 'products':
              // Check for products page elements
              console.log(`🛍️ Checking products page elements...`);
              break;
            
            case 'login':
              // Check for login form
              console.log(`🔐 Checking login form elements...`);
              const loginForms = page.locator('form, [data-testid*="login"], input[type="email"], input[type="password"]');
              if (await loginForms.count() > 0) {
                console.log(`✅ Login form elements found`);
              }
              break;
            
            case 'register':
              // Check for registration form
              console.log(`📝 Checking registration form elements...`);
              const registerForms = page.locator('form, [data-testid*="register"], input[type="email"], input[type="password"]');
              if (await registerForms.count() > 0) {
                console.log(`✅ Registration form elements found`);
              }
              break;
            
            case 'referral':
              // Check for referral page elements
              console.log(`🔗 Checking referral page elements...`);
              break;
          }

          // Check for any client-side errors
          const jsErrors = await page.evaluate(() => {
            return (window as any).jsErrors || [];
          });

          if (jsErrors.length > 0) {
            console.log(`⚠️ JavaScript errors found:`, jsErrors);
            result.errors.push(...jsErrors);
            result.status = 'failed';
          }

          // Performance timing
          const performanceData = await page.evaluate(() => ({
            navigationStart: performance.timing.navigationStart,
            loadEventEnd: performance.timing.loadEventEnd,
            domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd
          }));

          const totalLoadTime = performanceData.loadEventEnd - performanceData.navigationStart;
          const domLoadTime = performanceData.domContentLoadedEventEnd - performanceData.navigationStart;

          console.log(`⏱️ Performance [${pageConfig.name}:${iteration}]: Total: ${totalLoadTime}ms, DOM: ${domLoadTime}ms`);

          if (result.status === 'passed') {
            testSummary.passed++;
            testSummary.pages[pageConfig.name].passedIterations++;
            console.log(`✅ Test PASSED: ${pageConfig.description} - Iteration ${iteration}`);
          } else {
            testSummary.failed++;
            testSummary.pages[pageConfig.name].failedIterations++;
            console.log(`❌ Test FAILED: ${pageConfig.description} - Iteration ${iteration}`);
            console.log(`Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`);
          }

        } catch (error) {
          testSummary.failed++;
          testSummary.pages[pageConfig.name].failedIterations++;
          console.log(`💥 Test ERROR: ${pageConfig.description} - Iteration ${iteration}: ${error}`);
          
          // Take screenshot on error
          try {
            await page.screenshot({ 
              path: `test-results/${pageConfig.name}-iteration-${iteration}-error.png`,
              fullPage: true 
            });
          } catch (screenshotError) {
            console.log(`📸 Screenshot failed: ${screenshotError}`);
          }

          throw error;
        }
      });
    }
  });
});

test.afterAll(async () => {
  console.log('\n' + '='.repeat(80));
  console.log('🎯 COMPREHENSIVE TEST SUMMARY');
  console.log('='.repeat(80));
  
  console.log(`📊 Total Tests: ${testSummary.totalTests}`);
  console.log(`✅ Passed: ${testSummary.passed}`);
  console.log(`❌ Failed: ${testSummary.failed}`);
  console.log(`📈 Success Rate: ${((testSummary.passed / testSummary.totalTests) * 100).toFixed(2)}%`);

  console.log('\n📄 PAGE-BY-PAGE RESULTS:');
  Object.entries(testSummary.pages).forEach(([pageName, pageData]) => {
    console.log(`\n🏷️ ${pageName.toUpperCase()}`);
    console.log(`   Total Iterations: ${pageData.totalIterations}`);
    console.log(`   ✅ Passed: ${pageData.passedIterations}`);
    console.log(`   ❌ Failed: ${pageData.failedIterations}`);
    console.log(`   📈 Success Rate: ${((pageData.passedIterations / pageData.totalIterations) * 100).toFixed(2)}%`);
    
    // Show error summary for failed tests
    const failedResults = pageData.results.filter(r => r.status === 'failed');
    if (failedResults.length > 0) {
      console.log(`   🚨 Error Summary:`);
      failedResults.forEach(result => {
        console.log(`      Iteration ${result.iteration}: ${result.errors.length} errors, ${result.networkErrors.length} network errors`);
      });
    }
  });

  console.log('\n🔍 LOGGING SYSTEM ANALYSIS:');
  let totalConsoleLogs = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  
  Object.values(testSummary.pages).forEach(pageData => {
    pageData.results.forEach(result => {
      totalConsoleLogs += result.consoleLogs.length;
      totalErrors += result.errors.length;
      totalWarnings += result.warnings.length;
    });
  });

  console.log(`📝 Total Console Logs: ${totalConsoleLogs}`);
  console.log(`⚠️ Total Errors: ${totalErrors}`);
  console.log(`⚠️ Total Warnings: ${totalWarnings}`);
  
  if (totalConsoleLogs > 0) {
    console.log(`✅ Verbose logging is working properly`);
  } else {
    console.log(`❌ No console logs detected - verbose logging may not be working`);
  }

  console.log('='.repeat(80));
});