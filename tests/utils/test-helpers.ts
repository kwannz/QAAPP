import { Page, Locator, expect } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * 等待页面完全加载
   */
  async waitForPageLoad(timeout = 10000) {
    await this.page.waitForLoadState('networkidle', { timeout });
    await this.page.waitForLoadState('domcontentloaded', { timeout });
  }

  /**
   * 安全地填写表单字段
   */
  async fillFormField(selector: string, value: string) {
    const field = this.page.locator(selector);
    if (await field.count() > 0 && await field.isVisible()) {
      await field.fill(value);
      return true;
    }
    return false;
  }

  /**
   * 安全地点击元素
   */
  async safeClick(selector: string) {
    const element = this.page.locator(selector);
    if (await element.count() > 0 && await element.isVisible()) {
      await element.click();
      return true;
    }
    return false;
  }

  /**
   * 检查元素是否存在并可见
   */
  async isElementVisible(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    const count = await element.count();
    if (count === 0) return false;
    
    try {
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * 截图并保存（带时间戳）
   */
  async takeScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/${name}-${timestamp}.png`;
    await this.page.screenshot({ path: filename });
    return filename;
  }

  /**
   * 模拟慢速网络
   */
  async simulateSlowNetwork() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.enable');
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 1000000, // 1Mbps
      uploadThroughput: 1000000,
      latency: 100,
    });
  }

  /**
   * 恢复正常网络
   */
  async restoreNetwork() {
    const client = await this.page.context().newCDPSession(this.page);
    await client.send('Network.disable');
  }

  /**
   * 检查页面中是否有错误
   */
  async checkForErrors(): Promise<string[]> {
    const errors: string[] = [];
    
    // 检查控制台错误
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`Console Error: ${msg.text()}`);
      }
    });

    // 检查页面错误
    this.page.on('pageerror', (error) => {
      errors.push(`Page Error: ${error.message}`);
    });

    return errors;
  }

  /**
   * 等待API响应
   */
  async waitForApiResponse(urlPattern: string | RegExp, timeout = 10000) {
    return await this.page.waitForResponse(
      response => {
        const url = response.url();
        return typeof urlPattern === 'string' 
          ? url.includes(urlPattern)
          : urlPattern.test(url);
      },
      { timeout }
    );
  }

  /**
   * 模拟移动设备
   */
  async simulateMobileDevice() {
    await this.page.setViewportSize({ width: 375, height: 667 });
    await this.page.evaluate(() => {
      // 模拟触摸设备
      Object.defineProperty(navigator, 'maxTouchPoints', {
        writable: false,
        value: 1,
      });
    });
  }

  /**
   * 检查无障碍访问性
   */
  async checkAccessibility() {
    const issues: string[] = [];
    
    // 检查是否有alt属性的图片
    const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images without alt text`);
    }

    // 检查是否有合适的标题结构
    const h1Count = await this.page.locator('h1').count();
    if (h1Count === 0) {
      issues.push('No H1 heading found');
    } else if (h1Count > 1) {
      issues.push(`Multiple H1 headings found: ${h1Count}`);
    }

    // 检查是否有跳转到主内容的链接
    const skipLinks = await this.page.locator('a[href="#main"], a[href="#content"]').count();
    if (skipLinks === 0) {
      issues.push('No skip navigation link found');
    }

    return issues;
  }

  /**
   * 性能指标收集
   */
  async collectPerformanceMetrics() {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      return {
        loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
        firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
        firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        transferSize: navigation.transferSize,
        encodedBodySize: navigation.encodedBodySize,
        decodedBodySize: navigation.decodedBodySize,
      };
    });
  }
}

export class FormHelpers {
  constructor(private page: Page) {}

  /**
   * 填写登录表单
   */
  async fillLoginForm(email: string, password: string) {
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="password"]').fill(password);
  }

  /**
   * 填写注册表单
   */
  async fillRegisterForm(email: string, password: string, confirmPassword?: string) {
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="password"]').fill(password);
    
    const confirmField = this.page.locator('input[name="confirmPassword"]');
    if (await confirmField.count() > 0) {
      await confirmField.fill(confirmPassword || password);
    }
  }

  /**
   * 提交表单
   */
  async submitForm() {
    const submitButton = this.page.locator('button[type="submit"], input[type="submit"]');
    await submitButton.click();
  }

  /**
   * 检查表单验证错误
   */
  async checkValidationErrors(): Promise<string[]> {
    const errorSelectors = [
      '.error',
      '.error-message', 
      '[role="alert"]',
      '.alert-error',
      '.field-error',
      '.invalid-feedback'
    ];

    const errors: string[] = [];
    
    for (const selector of errorSelectors) {
      const errorElements = this.page.locator(selector);
      const count = await errorElements.count();
      
      for (let i = 0; i < count; i++) {
        const errorText = await errorElements.nth(i).textContent();
        if (errorText?.trim()) {
          errors.push(errorText.trim());
        }
      }
    }

    return errors;
  }
}

export class WalletHelpers {
  constructor(private page: Page) {}

  /**
   * 模拟钱包连接
   */
  async mockWalletConnection() {
    await this.page.addInitScript(() => {
      // 模拟 window.ethereum 对象
      (window as any).ethereum = {
        isMetaMask: true,
        request: async ({ method }: { method: string }) => {
          switch (method) {
            case 'eth_requestAccounts':
              return ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'];
            case 'eth_chainId':
              return '0x1'; // Mainnet
            case 'eth_accounts':
              return ['0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'];
            default:
              return null;
          }
        },
        on: (event: string, handler: Function) => {
          // 模拟事件监听
        },
        removeListener: (event: string, handler: Function) => {
          // 模拟移除监听
        }
      };
    });
  }

  /**
   * 点击钱包连接按钮
   */
  async connectWallet() {
    const connectButtons = this.page.locator(
      'button:has-text("连接钱包"), button:has-text("Connect Wallet"), ' +
      '[data-testid="wallet-connect"]'
    );
    
    if (await connectButtons.count() > 0) {
      await connectButtons.first().click();
      return true;
    }
    return false;
  }

  /**
   * 选择钱包类型
   */
  async selectWallet(walletType: 'metamask' | 'walletconnect' | 'coinbase') {
    const selectors = {
      metamask: 'button:has-text("MetaMask"), [data-testid="metamask"]',
      walletconnect: 'button:has-text("WalletConnect"), [data-testid="walletconnect"]',
      coinbase: 'button:has-text("Coinbase"), [data-testid="coinbase"]'
    };

    const button = this.page.locator(selectors[walletType]);
    if (await button.count() > 0) {
      await button.click();
      return true;
    }
    return false;
  }
}