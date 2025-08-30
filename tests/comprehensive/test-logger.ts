import { Page, ConsoleMessage, Request, Response } from '@playwright/test';

export interface TestLog {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  category: 'CONSOLE' | 'NETWORK' | 'PERFORMANCE' | 'ACTION' | 'ASSERTION' | 'ERROR';
  message: string;
  details?: any;
}

export class VerboseTestLogger {
  private logs: TestLog[] = [];
  private testName: string;
  private startTime: number;

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = Date.now();
    this.log('INFO', 'ACTION', `Starting test: ${testName}`);
  }

  private log(level: TestLog['level'], category: TestLog['category'], message: string, details?: any) {
    const timestamp = new Date().toISOString();
    const logEntry: TestLog = {
      timestamp,
      level,
      category,
      message,
      details
    };
    
    this.logs.push(logEntry);
    
    // Console output with color coding
    const colors = {
      INFO: '\x1b[36m',    // Cyan
      WARN: '\x1b[33m',    // Yellow
      ERROR: '\x1b[31m',   // Red
      DEBUG: '\x1b[90m'    // Gray
    };
    
    const categoryColors = {
      CONSOLE: '\x1b[35m',     // Magenta
      NETWORK: '\x1b[34m',     // Blue
      PERFORMANCE: '\x1b[32m', // Green
      ACTION: '\x1b[36m',      // Cyan
      ASSERTION: '\x1b[33m',   // Yellow
      ERROR: '\x1b[31m'        // Red
    };

    const colorCode = colors[level] || '\x1b[0m';
    const categoryColor = categoryColors[category] || '\x1b[0m';
    const reset = '\x1b[0m';
    
    console.log(
      `${colorCode}[${level}]${reset} ${categoryColor}[${category}]${reset} ${timestamp} - ${message}`,
      details ? details : ''
    );
  }

  async setupPageLogging(page: Page): Promise<void> {
    this.log('INFO', 'ACTION', 'Setting up comprehensive page logging');

    // Console message logging
    page.on('console', (msg: ConsoleMessage) => {
      const level = this.mapConsoleLevel(msg.type());
      this.log(level, 'CONSOLE', `${msg.type()}: ${msg.text()}`, {
        location: msg.location(),
        args: msg.args()
      });
    });

    // JavaScript errors
    page.on('pageerror', (error: Error) => {
      this.log('ERROR', 'ERROR', `Page Error: ${error.message}`, {
        stack: error.stack,
        name: error.name
      });
    });

    // Network request logging
    page.on('request', (request: Request) => {
      this.log('DEBUG', 'NETWORK', `→ REQUEST: ${request.method()} ${request.url()}`, {
        headers: request.headers(),
        postData: request.postData(),
        resourceType: request.resourceType()
      });
    });

    // Network response logging
    page.on('response', (response: Response) => {
      const level = response.status() >= 400 ? 'ERROR' : 
                   response.status() >= 300 ? 'WARN' : 'DEBUG';
      this.log(level, 'NETWORK', `← RESPONSE: ${response.status()} ${response.url()}`, {
        headers: response.headers(),
        status: response.status(),
        statusText: response.statusText()
      });
    });

    // Request failures
    page.on('requestfailed', (request: Request) => {
      this.log('ERROR', 'NETWORK', `✗ REQUEST FAILED: ${request.method()} ${request.url()}`, {
        failure: request.failure(),
        headers: request.headers()
      });
    });

    // Dialog events (alerts, confirms, prompts)
    page.on('dialog', async (dialog) => {
      this.log('WARN', 'ACTION', `Dialog appeared: ${dialog.type()} - ${dialog.message()}`);
      await dialog.dismiss();
    });

    this.log('INFO', 'ACTION', 'Page logging setup completed');
  }

  private mapConsoleLevel(consoleType: string): TestLog['level'] {
    switch (consoleType) {
      case 'error':
        return 'ERROR';
      case 'warning':
        return 'WARN';
      case 'info':
        return 'INFO';
      case 'debug':
      case 'log':
      default:
        return 'DEBUG';
    }
  }

  async logAction(action: string, details?: any): Promise<void> {
    this.log('INFO', 'ACTION', action, details);
  }

  async logAssertion(assertion: string, passed: boolean, details?: any): Promise<void> {
    const level = passed ? 'INFO' : 'ERROR';
    const symbol = passed ? '✓' : '✗';
    this.log(level, 'ASSERTION', `${symbol} ${assertion}`, details);
  }

  async logPerformance(page: Page, action: string): Promise<void> {
    try {
      const metrics = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: nav?.domContentLoadedEventEnd - nav?.domContentLoadedEventStart,
          loadComplete: nav?.loadEventEnd - nav?.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime,
          networkRequests: performance.getEntriesByType('resource').length
        };
      });

      this.log('INFO', 'PERFORMANCE', `Performance metrics for ${action}`, metrics);
    } catch (error) {
      this.log('WARN', 'PERFORMANCE', `Could not collect performance metrics for ${action}`, error);
    }
  }

  async takeScreenshot(page: Page, name: string, fullPage = false): Promise<string> {
    const filename = `${this.testName.replace(/\s+/g, '_')}_${name}_${Date.now()}.png`;
    const path = `test-results/screenshots/${filename}`;
    
    await page.screenshot({ 
      path, 
      fullPage,
      animations: 'disabled'
    });
    
    this.log('INFO', 'ACTION', `Screenshot captured: ${name}`, { path, fullPage });
    return path;
  }

  async logElementInfo(page: Page, selector: string, action: string): Promise<void> {
    try {
      const elementInfo = await page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (!element) return null;
        
        const rect = element.getBoundingClientRect();
        return {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          textContent: element.textContent?.slice(0, 100),
          attributes: Array.from(element.attributes).reduce((acc, attr) => {
            acc[attr.name] = attr.value;
            return acc;
          }, {} as Record<string, string>),
          boundingBox: {
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height
          },
          visible: element.offsetParent !== null
        };
      }, selector);

      this.log('DEBUG', 'ACTION', `Element info for ${action} on "${selector}"`, elementInfo);
    } catch (error) {
      this.log('WARN', 'ACTION', `Could not get element info for "${selector}"`, error);
    }
  }

  async waitAndLog(page: Page, selector: string, timeout = 10000): Promise<void> {
    this.log('DEBUG', 'ACTION', `Waiting for element: ${selector}`, { timeout });
    
    const startTime = Date.now();
    try {
      await page.waitForSelector(selector, { timeout });
      const waitTime = Date.now() - startTime;
      this.log('INFO', 'ACTION', `✓ Element found: ${selector}`, { waitTime: `${waitTime}ms` });
    } catch (error) {
      const waitTime = Date.now() - startTime;
      this.log('ERROR', 'ACTION', `✗ Element not found: ${selector}`, { waitTime: `${waitTime}ms`, error });
      throw error;
    }
  }

  getLogs(): TestLog[] {
    return [...this.logs];
  }

  getLogsSummary(): { total: number; byLevel: Record<string, number>; byCategory: Record<string, number>; duration: string } {
    const duration = `${(Date.now() - this.startTime) / 1000}s`;
    
    const byLevel = this.logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = this.logs.reduce((acc, log) => {
      acc[log.category] = (acc[log.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: this.logs.length,
      byLevel,
      byCategory,
      duration
    };
  }

  async generateReport(): Promise<void> {
    const summary = this.getLogsSummary();
    const reportPath = `test-results/reports/${this.testName.replace(/\s+/g, '_')}_report.json`;
    
    const report = {
      testName: this.testName,
      summary,
      logs: this.logs,
      generatedAt: new Date().toISOString()
    };

    // We'll write this to a file if needed, for now just log the summary
    this.log('INFO', 'ACTION', 'Test execution completed', {
      summary,
      reportGenerated: true
    });

    console.log('\n' + '='.repeat(80));
    console.log(`TEST SUMMARY: ${this.testName}`);
    console.log('='.repeat(80));
    console.log(`Total Duration: ${summary.duration}`);
    console.log(`Total Log Entries: ${summary.total}`);
    console.log(`By Level:`, summary.byLevel);
    console.log(`By Category:`, summary.byCategory);
    console.log('='.repeat(80) + '\n');
  }
}

// Helper function to create logger for each test
export function createTestLogger(testName: string): VerboseTestLogger {
  return new VerboseTestLogger(testName);
}

// Utility functions for common test patterns
export async function loggedClick(page: Page, logger: VerboseTestLogger, selector: string, description?: string): Promise<void> {
  const action = description || `Click element: ${selector}`;
  await logger.logElementInfo(page, selector, 'click');
  await logger.logAction(`Attempting: ${action}`);
  
  try {
    await page.click(selector);
    await logger.logAction(`✓ Completed: ${action}`);
  } catch (error) {
    await logger.logAction(`✗ Failed: ${action}`, error);
    throw error;
  }
}

export async function loggedFill(page: Page, logger: VerboseTestLogger, selector: string, value: string, description?: string): Promise<void> {
  const action = description || `Fill element: ${selector}`;
  await logger.logElementInfo(page, selector, 'fill');
  await logger.logAction(`Attempting: ${action}`, { value: value.replace(/./g, '*') }); // Mask sensitive data
  
  try {
    await page.fill(selector, value);
    await logger.logAction(`✓ Completed: ${action}`);
  } catch (error) {
    await logger.logAction(`✗ Failed: ${action}`, error);
    throw error;
  }
}

export async function loggedNavigate(page: Page, logger: VerboseTestLogger, url: string, description?: string): Promise<void> {
  const action = description || `Navigate to: ${url}`;
  await logger.logAction(`Attempting: ${action}`);
  
  const startTime = Date.now();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const loadTime = Date.now() - startTime;
    await logger.logAction(`✓ Completed: ${action}`, { loadTime: `${loadTime}ms` });
    await logger.logPerformance(page, `Navigation to ${url}`);
  } catch (error) {
    await logger.logAction(`✗ Failed: ${action}`, error);
    throw error;
  }
}