import { Page, Locator, expect } from '@playwright/test';

/**
 * 基础页面对象 - 提供通用UI测试功能
 */
export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 通用选择器方法
  get buttons() {
    return this.page.locator('button, [role="button"], input[type="submit"], input[type="button"]');
  }

  get links() {
    return this.page.locator('a[href]');
  }

  get inputs() {
    return this.page.locator('input, textarea, select');
  }

  get forms() {
    return this.page.locator('form');
  }

  get modals() {
    return this.page.locator('[role="dialog"], .modal, .popup');
  }

  get alerts() {
    return this.page.locator('[role="alert"], .alert, .error, .success');
  }

  get loadingIndicators() {
    return this.page.locator('[data-loading], .loading, .spinner, [aria-busy="true"]');
  }

  /**
   * 智能元素定位 - 支持中英文和多种查找策略
   */
  async findElement(identifier: string): Promise<Locator> {
    // 尝试多种定位策略
    const strategies = [
      () => this.page.locator(`[data-testid="${identifier}"]`),
      () => this.page.locator(`text="${identifier}"`),
      () => this.page.locator(`[aria-label*="${identifier}"]`),
      () => this.page.locator(`[title*="${identifier}"]`),
      () => this.page.locator(`[placeholder*="${identifier}"]`),
      () => this.page.locator(`*:has-text("${identifier}")`),
      () => this.page.locator(`[class*="${identifier.toLowerCase().replace(/\s+/g, '-')}"]`),
      () => this.page.locator(`[id*="${identifier.toLowerCase().replace(/\s+/g, '-')}"]`)
    ];

    for (const strategy of strategies) {
      const element = strategy();
      if (await element.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        return element.first();
      }
    }

    throw new Error(`无法找到元素: ${identifier}`);
  }

  /**
   * 等待页面完全加载
   */
  async waitForPageLoad(): Promise<void> {
    await Promise.all([
      this.page.waitForLoadState('networkidle'),
      this.page.waitForLoadState('domcontentloaded'),
      // 等待加载指示器消失
      this.loadingIndicators.first().waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {}),
    ]);
  }

  /**
   * 智能点击 - 确保元素可点击并处理各种状态
   */
  async smartClick(identifier: string): Promise<boolean> {
    try {
      const element = await this.findElement(identifier);
      
      // 等待元素可见和可点击
      await element.waitFor({ state: 'visible' });
      await expect(element).toBeEnabled();
      
      // 滚动到视图中
      await element.scrollIntoViewIfNeeded();
      
      // 等待任何动画完成
      await this.page.waitForTimeout(300);
      
      await element.click();
      
      // 等待点击效果
      await this.page.waitForTimeout(500);
      
      return true;
    } catch (error) {
      console.log(`点击失败 "${identifier}":`, error);
      return false;
    }
  }

  /**
   * 智能输入 - 支持清除和验证
   */
  async smartInput(identifier: string, value: string, options?: { clear?: boolean, validate?: boolean }): Promise<boolean> {
    try {
      const element = await this.findElement(identifier);
      
      await element.waitFor({ state: 'visible' });
      await expect(element).toBeEnabled();
      
      if (options?.clear !== false) {
        await element.clear();
      }
      
      await element.fill(value);
      
      if (options?.validate !== false) {
        await expect(element).toHaveValue(value);
      }
      
      return true;
    } catch (error) {
      console.log(`输入失败 "${identifier}":`, error);
      return false;
    }
  }

  /**
   * 等待并验证元素出现
   */
  async waitForElement(identifier: string, timeout: number = 5000): Promise<boolean> {
    try {
      const element = await this.findElement(identifier);
      await element.waitFor({ state: 'visible', timeout });
      return true;
    } catch (error) {
      console.log(`等待元素失败 "${identifier}":`, error);
      return false;
    }
  }

  /**
   * 验证页面关键元素
   */
  async validatePage(expectedElements: string[]): Promise<{success: boolean, missing: string[]}> {
    const missing: string[] = [];
    
    for (const elementId of expectedElements) {
      const exists = await this.waitForElement(elementId, 3000);
      if (!exists) {
        missing.push(elementId);
      }
    }
    
    return {
      success: missing.length === 0,
      missing
    };
  }

  /**
   * 检查页面错误
   */
  async checkForErrors(): Promise<{hasErrors: boolean, errors: string[]}> {
    const errors: string[] = [];
    
    // 检查控制台错误
    const consoleErrors = await this.page.evaluate(() => {
      return window.console?.error?.toString() || '';
    });
    
    if (consoleErrors) {
      errors.push(`Console Error: ${consoleErrors}`);
    }
    
    // 检查页面错误消息
    const errorElements = await this.alerts.filter({
      hasText: /错误|error|失败|fail/i
    }).all();
    
    for (const errorEl of errorElements) {
      if (await errorEl.isVisible()) {
        const text = await errorEl.textContent();
        if (text) errors.push(`Page Error: ${text}`);
      }
    }
    
    // 检查网络错误
    const failedRequests = await this.page.evaluate(() => {
      return (window as any).__networkErrors || [];
    });
    
    errors.push(...failedRequests);
    
    return {
      hasErrors: errors.length > 0,
      errors
    };
  }

  /**
   * 获取页面性能指标
   */
  async getPerformanceMetrics(): Promise<{
    loadTime: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    interactionLatency: number;
  }> {
    return await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;
      const lcp = paintEntries.find(entry => entry.name === 'largest-contentful-paint')?.startTime || 0;
      
      return {
        loadTime: navigation.loadEventEnd - navigation.navigationStart,
        firstContentfulPaint: fcp,
        largestContentfulPaint: lcp,
        interactionLatency: performance.now() - navigation.navigationStart
      };
    });
  }

  /**
   * 截图并保存（用于调试）
   */
  async captureScreenshot(name: string, options?: {fullPage?: boolean}): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/screenshots/${name}-${timestamp}.png`;
    
    await this.page.screenshot({
      path: filename,
      fullPage: options?.fullPage || false
    });
    
    console.log(`📸 截图已保存: ${filename}`);
  }

  /**
   * 验证响应式布局
   */
  async validateResponsiveLayout(breakpoints: {name: string, width: number, height: number}[]): Promise<{
    breakpoint: string;
    issues: string[];
  }[]> {
    const results: {breakpoint: string; issues: string[]}[] = [];
    
    for (const bp of breakpoints) {
      await this.page.setViewportSize({ width: bp.width, height: bp.height });
      await this.page.waitForTimeout(1000); // 等待布局调整
      
      const issues: string[] = [];
      
      // 检查水平滚动
      const hasHorizontalScroll = await this.page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });
      
      if (hasHorizontalScroll) {
        issues.push('出现水平滚动条');
      }
      
      // 检查元素溢出
      const overflowElements = await this.page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.right > window.innerWidth || rect.left < 0;
          })
          .map(el => el.tagName + '.' + Array.from(el.classList).join('.'))
          .slice(0, 5);
      });
      
      if (overflowElements.length > 0) {
        issues.push(`元素溢出: ${overflowElements.join(', ')}`);
      }
      
      results.push({
        breakpoint: bp.name,
        issues
      });
    }
    
    return results;
  }

  /**
   * 验证表单功能
   */
  async validateFormFunctionality(formSelector?: string): Promise<{
    valid: boolean;
    issues: string[];
    fields: {name: string, valid: boolean, error?: string}[];
  }> {
    const form = formSelector ? this.page.locator(formSelector) : this.forms.first();
    const issues: string[] = [];
    const fields: {name: string, valid: boolean, error?: string}[] = [];
    
    // 检查表单存在
    if (!(await form.isVisible())) {
      return {
        valid: false,
        issues: ['表单不存在或不可见'],
        fields: []
      };
    }
    
    // 检查表单字段
    const formInputs = form.locator('input, textarea, select');
    const inputCount = await formInputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = formInputs.nth(i);
      const name = await input.getAttribute('name') || `field-${i}`;
      const type = await input.getAttribute('type') || 'text';
      const required = await input.getAttribute('required') !== null;
      
      let fieldValid = true;
      let error: string | undefined;
      
      // 检查必填字段验证
      if (required && type !== 'hidden') {
        // 清空字段并尝试提交
        await input.clear();
        await input.blur();
        
        const validationMessage = await input.evaluate(el => (el as HTMLInputElement).validationMessage);
        if (validationMessage) {
          fieldValid = false;
          error = validationMessage;
        }
      }
      
      fields.push({ name, valid: fieldValid, error });
      
      if (!fieldValid) {
        issues.push(`字段 "${name}" 验证失败: ${error}`);
      }
    }
    
    // 检查提交按钮
    const submitButton = form.locator('input[type="submit"], button[type="submit"], button:has-text("提交"), button:has-text("Submit")');
    if (!(await submitButton.isVisible())) {
      issues.push('缺少提交按钮');
    }
    
    return {
      valid: issues.length === 0,
      issues,
      fields
    };
  }

  /**
   * 模拟用户交互序列
   */
  async simulateUserInteraction(interactions: {
    type: 'click' | 'input' | 'hover' | 'scroll' | 'wait';
    target: string;
    value?: string;
    duration?: number;
  }[]): Promise<{success: boolean, failedAt?: number, error?: string}> {
    
    for (let i = 0; i < interactions.length; i++) {
      const interaction = interactions[i];
      
      try {
        switch (interaction.type) {
          case 'click':
            const success = await this.smartClick(interaction.target);
            if (!success) {
              return { success: false, failedAt: i, error: `点击失败: ${interaction.target}` };
            }
            break;
            
          case 'input':
            if (!interaction.value) {
              return { success: false, failedAt: i, error: '输入操作缺少值' };
            }
            const inputSuccess = await this.smartInput(interaction.target, interaction.value);
            if (!inputSuccess) {
              return { success: false, failedAt: i, error: `输入失败: ${interaction.target}` };
            }
            break;
            
          case 'hover':
            const element = await this.findElement(interaction.target);
            await element.hover();
            break;
            
          case 'scroll':
            const scrollElement = await this.findElement(interaction.target);
            await scrollElement.scrollIntoViewIfNeeded();
            break;
            
          case 'wait':
            await this.page.waitForTimeout(interaction.duration || 1000);
            break;
        }
        
        // 每次交互后短暂等待
        await this.page.waitForTimeout(200);
        
      } catch (error) {
        return { 
          success: false, 
          failedAt: i, 
          error: `交互失败 (${interaction.type} -> ${interaction.target}): ${error}` 
        };
      }
    }
    
    return { success: true };
  }
}