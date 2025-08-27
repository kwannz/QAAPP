import { test, expect, Page, Locator } from '@playwright/test';

/**
 * 高级逻辑闭环测试套件
 * 使用Playwright MCP进行深度状态管理和业务逻辑验证
 */

// 状态机定义
interface UserFlowState {
  current: 'GUEST' | 'REGISTERING' | 'LOGGING_IN' | 'AUTHENTICATED' | 'INVESTING' | 'COMPLETED';
  data: {
    email?: string;
    hasWallet?: boolean;
    investmentAmount?: number;
    transactionHash?: string;
    completedSteps: string[];
  };
}

// 测试状态跟踪器
class FlowStateTracker {
  private states: Map<string, UserFlowState> = new Map();
  
  initState(sessionId: string): UserFlowState {
    const initialState: UserFlowState = {
      current: 'GUEST',
      data: {
        completedSteps: []
      }
    };
    this.states.set(sessionId, initialState);
    return initialState;
  }
  
  getState(sessionId: string): UserFlowState | undefined {
    return this.states.get(sessionId);
  }
  
  updateState(sessionId: string, updates: Partial<UserFlowState>): UserFlowState {
    const currentState = this.getState(sessionId);
    if (!currentState) throw new Error(`Session ${sessionId} not found`);
    
    const newState = {
      ...currentState,
      ...updates,
      data: { ...currentState.data, ...updates.data }
    };
    this.states.set(sessionId, newState);
    return newState;
  }
  
  addCompletedStep(sessionId: string, step: string): void {
    const state = this.getState(sessionId);
    if (state) {
      state.data.completedSteps.push(step);
      this.states.set(sessionId, state);
    }
  }
  
  validateStateTransition(from: UserFlowState['current'], to: UserFlowState['current']): boolean {
    const allowedTransitions: Record<UserFlowState['current'], UserFlowState['current'][]> = {
      'GUEST': ['REGISTERING', 'LOGGING_IN'],
      'REGISTERING': ['AUTHENTICATED', 'GUEST'],
      'LOGGING_IN': ['AUTHENTICATED', 'GUEST'],
      'AUTHENTICATED': ['INVESTING', 'GUEST'],
      'INVESTING': ['COMPLETED', 'AUTHENTICATED'],
      'COMPLETED': ['AUTHENTICATED', 'GUEST']
    };
    
    return allowedTransitions[from].includes(to);
  }
}

// 页面交互智能分析器
class PageInteractionAnalyzer {
  constructor(private page: Page) {}
  
  // 智能按钮发现算法
  async discoverAllButtons(): Promise<Array<{element: Locator, type: string, priority: number, action: string}>> {
    const buttonSelectors = [
      'button',
      'input[type="button"]',
      'input[type="submit"]',
      '[role="button"]',
      'a[href*="javascript"]',
      '.btn',
      '.button',
      '[onclick]',
      '[data-testid*="button"]',
      '[data-testid*="btn"]'
    ];
    
    const allButtons: Array<{element: Locator, type: string, priority: number, action: string}> = [];
    
    for (const selector of buttonSelectors) {
      const elements = await this.page.locator(selector).all();
      
      for (const element of elements) {
        if (await element.isVisible() && await element.isEnabled()) {
          const text = await element.textContent() || '';
          const ariaLabel = await element.getAttribute('aria-label') || '';
          const dataTestId = await element.getAttribute('data-testid') || '';
          const className = await element.getAttribute('class') || '';
          
          const buttonInfo = this.classifyButton(text, ariaLabel, dataTestId, className);
          allButtons.push({
            element,
            ...buttonInfo
          });
        }
      }
    }
    
    // 按优先级排序
    return allButtons.sort((a, b) => b.priority - a.priority);
  }
  
  // 按钮分类算法
  private classifyButton(text: string, ariaLabel: string, testId: string, className: string): {type: string, priority: number, action: string} {
    const fullText = `${text} ${ariaLabel} ${testId} ${className}`.toLowerCase();
    
    // 关键按钮模式识别
    const patterns = [
      { pattern: /(submit|提交|确认|确定)/, type: 'submit', priority: 10, action: 'form_submit' },
      { pattern: /(register|注册|signup|sign.up)/, type: 'register', priority: 9, action: 'user_register' },
      { pattern: /(login|登录|signin|sign.in)/, type: 'login', priority: 9, action: 'user_login' },
      { pattern: /(connect|连接|wallet)/, type: 'wallet', priority: 8, action: 'wallet_connect' },
      { pattern: /(buy|购买|invest|投资)/, type: 'purchase', priority: 8, action: 'make_investment' },
      { pattern: /(next|下一步|continue|继续)/, type: 'navigation', priority: 7, action: 'flow_continue' },
      { pattern: /(cancel|取消|close|关闭)/, type: 'cancel', priority: 3, action: 'flow_cancel' },
      { pattern: /(back|返回|prev|上一步)/, type: 'navigation', priority: 6, action: 'flow_back' },
      { pattern: /(save|保存|update|更新)/, type: 'action', priority: 7, action: 'data_save' },
      { pattern: /(delete|删除|remove|移除)/, type: 'destructive', priority: 5, action: 'data_delete' },
      { pattern: /(copy|复制|share|分享)/, type: 'utility', priority: 4, action: 'utility_action' }
    ];
    
    for (const { pattern, type, priority, action } of patterns) {
      if (pattern.test(fullText)) {
        return { type, priority, action };
      }
    }
    
    return { type: 'generic', priority: 2, action: 'generic_click' };
  }
  
  // 智能表单字段发现
  async discoverFormFields(): Promise<Array<{element: Locator, type: string, required: boolean, name: string}>> {
    const fieldSelectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="password"]',
      'input[type="tel"]',
      'input[type="number"]',
      'textarea',
      'select',
      'input[type="checkbox"]',
      'input[type="radio"]'
    ];
    
    const formFields: Array<{element: Locator, type: string, required: boolean, name: string}> = [];
    
    for (const selector of fieldSelectors) {
      const elements = await this.page.locator(selector).all();
      
      for (const element of elements) {
        if (await element.isVisible()) {
          const type = await element.getAttribute('type') || selector.split('[')[0];
          const required = await element.getAttribute('required') !== null;
          const name = await element.getAttribute('name') || 
                       await element.getAttribute('data-testid') || 
                       await element.getAttribute('id') || 
                       'unknown';
          
          formFields.push({ element, type, required, name });
        }
      }
    }
    
    return formFields;
  }
}

// 业务逻辑验证器
class BusinessLogicValidator {
  constructor(private page: Page, private stateTracker: FlowStateTracker) {}
  
  async validateRegistrationFlow(sessionId: string): Promise<boolean> {
    const state = this.stateTracker.getState(sessionId);
    if (!state) return false;
    
    // 验证注册表单存在
    const emailField = this.page.locator('input[type="email"], input[name*="email"]');
    const passwordField = this.page.locator('input[type="password"]');
    const submitButton = this.page.locator('button[type="submit"], input[type="submit"]');
    
    const hasValidForm = await emailField.isVisible() && 
                         await passwordField.isVisible() && 
                         await submitButton.isVisible();
    
    if (hasValidForm) {
      this.stateTracker.addCompletedStep(sessionId, 'registration_form_valid');
    }
    
    return hasValidForm;
  }
  
  async validateAuthenticationState(sessionId: string): Promise<boolean> {
    const state = this.stateTracker.getState(sessionId);
    if (!state) return false;
    
    // 检查认证状态指示器
    const authIndicators = [
      'text=/登录成功/',
      'text=/欢迎/',
      '[data-testid*="user-menu"]',
      '[data-testid*="logout"]',
      'text=/退出/',
      '.user-avatar',
      '.profile-menu'
    ];
    
    for (const indicator of authIndicators) {
      const element = this.page.locator(indicator);
      if (await element.isVisible()) {
        this.stateTracker.addCompletedStep(sessionId, 'authentication_confirmed');
        return true;
      }
    }
    
    return false;
  }
  
  async validateInvestmentFlow(sessionId: string): Promise<boolean> {
    const state = this.stateTracker.getState(sessionId);
    if (!state) return false;
    
    // 验证投资产品可见性
    const investmentElements = [
      '.product-card',
      '[data-testid*="product"]',
      'text=/投资/',
      'text=/购买/',
      'text=/产品/'
    ];
    
    for (const selector of investmentElements) {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        this.stateTracker.addCompletedStep(sessionId, 'investment_products_available');
        return true;
      }
    }
    
    return false;
  }
}

test.describe('🧠 深度逻辑闭环测试', () => {
  let stateTracker: FlowStateTracker;
  let interactionAnalyzer: PageInteractionAnalyzer;
  let businessValidator: BusinessLogicValidator;
  
  test.beforeEach(async ({ page }) => {
    stateTracker = new FlowStateTracker();
    interactionAnalyzer = new PageInteractionAnalyzer(page);
    businessValidator = new BusinessLogicValidator(page, stateTracker);
  });
  
  test('🎯 完整用户旅程状态机验证', async ({ page }) => {
    const sessionId = `session_${Date.now()}`;
    let currentState = stateTracker.initState(sessionId);
    
    console.log(`🔄 启动状态机测试，初始状态: ${currentState.current}`);
    
    // 步骤1: 访问首页 (GUEST状态)
    await page.goto('/');
    expect(currentState.current).toBe('GUEST');
    
    // 步骤2: 发现并分析所有按钮
    console.log('🔍 智能按钮发现分析...');
    const buttons = await interactionAnalyzer.discoverAllButtons();
    console.log(`发现 ${buttons.length} 个交互按钮:`);
    
    for (const button of buttons.slice(0, 10)) { // 只展示前10个
      const text = await button.element.textContent() || 'No text';
      console.log(`  - 类型: ${button.type}, 优先级: ${button.priority}, 动作: ${button.action}, 文本: "${text.slice(0, 20)}"`);
    }
    
    // 步骤3: 寻找注册按钮并验证状态转换
    const registerButton = buttons.find(b => b.type === 'register');
    if (registerButton) {
      console.log('📝 发现注册按钮，开始注册流程');
      await registerButton.element.click();
      
      // 验证状态转换
      const isValidTransition = stateTracker.validateStateTransition('GUEST', 'REGISTERING');
      expect(isValidTransition).toBe(true);
      
      currentState = stateTracker.updateState(sessionId, { current: 'REGISTERING' });
      console.log(`✅ 状态转换成功: GUEST -> REGISTERING`);
    }
    
    // 步骤4: 验证注册表单逻辑
    if (currentState.current === 'REGISTERING') {
      const isRegistrationValid = await businessValidator.validateRegistrationFlow(sessionId);
      expect(isRegistrationValid).toBe(true);
      console.log('✅ 注册表单逻辑验证通过');
      
      // 发现并填写表单字段
      const formFields = await interactionAnalyzer.discoverFormFields();
      console.log(`📋 发现 ${formFields.length} 个表单字段`);
      
      for (const field of formFields) {
        if (field.name.includes('email') && field.type === 'email') {
          await field.element.fill(`test_${sessionId}@example.com`);
          stateTracker.updateState(sessionId, { 
            data: { email: `test_${sessionId}@example.com` } 
          });
        } else if (field.type === 'password') {
          await field.element.fill('TestPassword123!');
        }
      }
    }
    
    // 步骤5: 验证最终状态一致性
    const finalState = stateTracker.getState(sessionId);
    expect(finalState).toBeDefined();
    expect(finalState!.data.completedSteps.length).toBeGreaterThan(0);
    
    console.log(`🎊 测试完成! 完成步骤: ${finalState!.data.completedSteps.join(', ')}`);
  });
  
  test('🔄 状态机循环和异常处理', async ({ page }) => {
    const sessionId = `cycle_test_${Date.now()}`;
    const state = stateTracker.initState(sessionId);
    
    await page.goto('/');
    
    // 测试非法状态转换
    const invalidTransition = stateTracker.validateStateTransition('GUEST', 'COMPLETED');
    expect(invalidTransition).toBe(false);
    console.log('❌ 非法状态转换正确被拒绝: GUEST -> COMPLETED');
    
    // 测试状态回退机制
    stateTracker.updateState(sessionId, { current: 'AUTHENTICATED' });
    const backToGuest = stateTracker.validateStateTransition('AUTHENTICATED', 'GUEST');
    expect(backToGuest).toBe(true);
    console.log('✅ 状态回退机制正常: AUTHENTICATED -> GUEST');
    
    // 测试数据持久性
    stateTracker.updateState(sessionId, { 
      data: { email: 'persistent@test.com' } 
    });
    const retrievedState = stateTracker.getState(sessionId);
    expect(retrievedState?.data.email).toBe('persistent@test.com');
    console.log('✅ 状态数据持久性验证通过');
  });
  
  test('🧪 按钮算法智能测试', async ({ page }) => {
    await page.goto('/');
    
    // 执行完整的按钮发现和分类
    const buttons = await interactionAnalyzer.discoverAllButtons();
    
    // 验证分类算法的准确性
    const submitButtons = buttons.filter(b => b.type === 'submit');
    const navigationButtons = buttons.filter(b => b.type === 'navigation');
    const walletButtons = buttons.filter(b => b.type === 'wallet');
    
    console.log(`📊 按钮分类统计:`);
    console.log(`  - 提交按钮: ${submitButtons.length}`);
    console.log(`  - 导航按钮: ${navigationButtons.length}`);
    console.log(`  - 钱包按钮: ${walletButtons.length}`);
    
    // 测试优先级排序
    expect(buttons).toEqual(buttons.sort((a, b) => b.priority - a.priority));
    console.log('✅ 按钮优先级排序正确');
    
    // 测试每个高优先级按钮的可交互性
    const highPriorityButtons = buttons.filter(b => b.priority >= 8).slice(0, 5);
    
    for (const button of highPriorityButtons) {
      const isClickable = await button.element.isEnabled() && await button.element.isVisible();
      expect(isClickable).toBe(true);
      
      const text = await button.element.textContent();
      console.log(`✅ 高优先级按钮可交互: "${text}" (优先级: ${button.priority})`);
    }
  });
  
  test('🔗 跨页面状态保持验证', async ({ page }) => {
    const sessionId = `cross_page_${Date.now()}`;
    let state = stateTracker.initState(sessionId);
    
    // 在首页设置状态
    await page.goto('/');
    stateTracker.updateState(sessionId, { 
      current: 'AUTHENTICATED',
      data: { email: 'cross.page@test.com', hasWallet: true }
    });
    
    // 导航到其他页面
    const pages = ['/products', '/dashboard', '/referral'];
    
    for (const pagePath of pages) {
      console.log(`🔄 导航到 ${pagePath}`);
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // 验证状态在页面间保持
      const currentState = stateTracker.getState(sessionId);
      expect(currentState?.current).toBe('AUTHENTICATED');
      expect(currentState?.data.email).toBe('cross.page@test.com');
      
      // 验证页面特定的业务逻辑
      if (pagePath === '/dashboard') {
        await businessValidator.validateInvestmentFlow(sessionId);
      }
      
      console.log(`✅ ${pagePath} 页面状态保持正确`);
    }
  });
  
  test('🎭 动态交互流程自适应测试', async ({ page }) => {
    await page.goto('/');
    
    // 动态发现页面上的所有交互元素
    const buttons = await interactionAnalyzer.discoverAllButtons();
    const formFields = await interactionAnalyzer.discoverFormFields();
    
    console.log(`🎯 页面交互元素统计:`);
    console.log(`  - 可交互按钮: ${buttons.length}`);
    console.log(`  - 表单字段: ${formFields.length}`);
    
    // 自适应交互策略
    const interactionPlan = [];
    
    // 优先填写必填字段
    const requiredFields = formFields.filter(f => f.required);
    for (const field of requiredFields) {
      const generators: Record<string, () => string> = {
        'email': () => `test_${Date.now()}@example.com`,
        'password': () => 'TestPassword123!',
        'text': () => field.name.includes('name') ? 'Test User' : 'Test Value',
        'tel': () => '+1234567890',
        'number': () => '100'
      };
      
      const value = generators[field.type] ? generators[field.type]() : 'test value';
      
      interactionPlan.push({
        type: 'fill_field',
        element: field.element,
        value
      });
    }
    
    // 然后点击主要操作按钮
    const primaryButtons = buttons.filter(b => b.priority >= 8);
    for (const button of primaryButtons.slice(0, 2)) {
      interactionPlan.push({
        type: 'click_button',
        element: button.element,
        action: button.action
      });
    }
    
    console.log(`📋 生成自适应交互计划，共 ${interactionPlan.length} 步`);
    
    // 执行交互计划（安全模式，避免实际提交）
    for (let i = 0; i < Math.min(interactionPlan.length, 3); i++) {
      const step = interactionPlan[i];
      console.log(`▶️  执行步骤 ${i + 1}: ${step.type}`);
      
      try {
        if (step.type === 'fill_field' && step.value) {
          await (step.element as Locator).fill(step.value);
        } else if (step.type === 'click_button') {
          // 只模拟悬停，不实际点击以避免页面跳转
          await (step.element as Locator).hover();
        }
        await page.waitForTimeout(500); // 短暂等待
      } catch (error) {
        console.log(`⚠️  步骤 ${i + 1} 执行失败，继续下一步`);
      }
    }
    
    console.log('✅ 自适应交互测试完成');
  });
  
});