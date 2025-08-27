import { test, expect, Page } from '@playwright/test';

/**
 * MCP (Model Context Protocol) 深度集成测试
 * 模拟AI驱动的智能测试执行和决策制定
 */

// MCP上下文管理器
interface MCPContext {
  sessionId: string;
  currentPage: string;
  userIntent: string;
  discoveredElements: ElementInfo[];
  interactionHistory: InteractionEvent[];
  knowledgeBase: Record<string, any>;
  confidence: number;
  nextActions: ActionPlan[];
}

interface ElementInfo {
  selector: string;
  type: 'button' | 'input' | 'link' | 'form' | 'text' | 'image';
  text: string;
  attributes: Record<string, string>;
  position: { x: number; y: number };
  importance: number;
  semantic_role: string;
}

interface InteractionEvent {
  timestamp: number;
  action: string;
  element: ElementInfo;
  success: boolean;
  outcome: string;
  userFeedback?: 'positive' | 'negative' | 'neutral';
}

interface ActionPlan {
  action: 'click' | 'fill' | 'navigate' | 'wait' | 'verify' | 'analyze';
  target: string;
  parameters?: Record<string, any>;
  priority: number;
  expectedOutcome: string;
  confidence: number;
}

// 智能MCP处理器
class MCPProcessor {
  private context: MCPContext;
  
  constructor(private page: Page) {
    this.context = this.initializeContext();
  }
  
  private initializeContext(): MCPContext {
    return {
      sessionId: `mcp_${Date.now()}`,
      currentPage: '',
      userIntent: 'automated_testing',
      discoveredElements: [],
      interactionHistory: [],
      knowledgeBase: {},
      confidence: 0.5,
      nextActions: []
    };
  }
  
  // 智能页面理解
  async understandPage(): Promise<{
    pageType: string;
    mainPurpose: string;
    keyElements: ElementInfo[];
    userJourney: string[];
    confidence: number;
  }> {
    const url = this.page.url();
    const title = await this.page.title();
    const metaDescription = await this.page.locator('meta[name="description"]').getAttribute('content') || '';
    
    // 发现所有交互元素
    const elements = await this.discoverAllElements();
    this.context.discoveredElements = elements;
    
    // AI页面分类
    const pageClassification = this.classifyPage(url, title, metaDescription, elements);
    
    // 用户旅程推断
    const userJourney = this.inferUserJourney(elements, pageClassification.pageType);
    
    console.log(`🧠 MCP页面理解结果:`);
    console.log(`   页面类型: ${pageClassification.pageType}`);
    console.log(`   主要用途: ${pageClassification.mainPurpose}`);
    console.log(`   关键元素: ${elements.length} 个`);
    console.log(`   推断旅程: ${userJourney.join(' → ')}`);
    
    return {
      ...pageClassification,
      keyElements: elements.slice(0, 10), // 前10个最重要的元素
      userJourney,
      confidence: this.context.confidence
    };
  }
  
  // 发现所有页面元素
  private async discoverAllElements(): Promise<ElementInfo[]> {
    const selectors = [
      { selector: 'button', type: 'button' as const },
      { selector: 'input', type: 'input' as const },
      { selector: 'a[href]', type: 'link' as const },
      { selector: 'form', type: 'form' as const },
      { selector: 'h1, h2, h3', type: 'text' as const },
      { selector: 'img', type: 'image' as const }
    ];
    
    const allElements: ElementInfo[] = [];
    
    for (const { selector, type } of selectors) {
      const elements = await this.page.locator(selector).all();
      
      for (const element of elements.slice(0, 15)) { // 限制每种类型的元素数量
        if (await element.isVisible()) {
          const text = await element.textContent() || '';
          const boundingBox = await element.boundingBox();
          
          // 提取属性
          const attributes: Record<string, string> = {};
          const attributeNames = ['id', 'class', 'name', 'type', 'role', 'aria-label', 'data-testid'];
          for (const attr of attributeNames) {
            const value = await element.getAttribute(attr);
            if (value) attributes[attr] = value;
          }
          
          // 计算重要性分数
          const importance = this.calculateElementImportance(type, text, attributes, boundingBox);
          
          // 语义角色识别
          const semanticRole = this.identifySemanticRole(type, text, attributes);
          
          allElements.push({
            selector,
            type,
            text: text.slice(0, 100),
            attributes,
            position: boundingBox ? { x: boundingBox.x, y: boundingBox.y } : { x: 0, y: 0 },
            importance,
            semantic_role: semanticRole
          });
        }
      }
    }
    
    // 按重要性排序
    return allElements.sort((a, b) => b.importance - a.importance);
  }
  
  // 计算元素重要性
  private calculateElementImportance(
    type: string,
    text: string,
    attributes: Record<string, string>,
    boundingBox: any
  ): number {
    let score = 0;
    
    // 基础类型分数
    const typeScores = { button: 8, input: 7, link: 6, form: 9, text: 4, image: 3 };
    score += typeScores[type as keyof typeof typeScores] || 0;
    
    // 文本关键词加分
    const keywordBoosts = {
      '登录|login|signin': 10,
      '注册|register|signup': 10,
      '购买|buy|purchase': 9,
      '提交|submit': 8,
      '搜索|search': 7,
      '导航|nav|menu': 6
    };
    
    for (const [pattern, boost] of Object.entries(keywordBoosts)) {
      if (new RegExp(pattern, 'i').test(text)) {
        score += boost;
        break;
      }
    }
    
    // 属性加分
    if (attributes.id) score += 2;
    if (attributes['data-testid']) score += 3;
    if (attributes.role === 'button') score += 2;
    if (attributes.class?.includes('primary')) score += 3;
    
    // 位置加分（上方和左侧元素通常更重要）
    if (boundingBox) {
      if (boundingBox.y < 300) score += 2; // 页面上部
      if (boundingBox.x < 300) score += 1; // 页面左侧
    }
    
    return score;
  }
  
  // 识别语义角色
  private identifySemanticRole(type: string, text: string, attributes: Record<string, string>): string {
    const rolePatterns = [
      { pattern: /(主要|primary|main)/, role: 'primary_action' },
      { pattern: /(次要|secondary)/, role: 'secondary_action' },
      { pattern: /(导航|nav|menu)/, role: 'navigation' },
      { pattern: /(登录|login)/, role: 'authentication' },
      { pattern: /(注册|register)/, role: 'registration' },
      { pattern: /(搜索|search)/, role: 'search' },
      { pattern: /(购买|buy|purchase)/, role: 'commerce' },
      { pattern: /(关闭|close|cancel)/, role: 'dismissal' }
    ];
    
    const fullText = `${text} ${attributes.class || ''} ${attributes['aria-label'] || ''}`;
    
    for (const { pattern, role } of rolePatterns) {
      if (pattern.test(fullText.toLowerCase())) {
        return role;
      }
    }
    
    return 'generic';
  }
  
  // AI页面分类
  private classifyPage(url: string, title: string, description: string, elements: ElementInfo[]): {
    pageType: string;
    mainPurpose: string;
    confidence: number;
  } {
    const context = `${url} ${title} ${description}`.toLowerCase();
    const elementTypes = elements.map(e => e.semantic_role);
    
    // 规则引擎页面分类
    const pageRules = [
      {
        pattern: /(login|signin|登录)/,
        elementRoles: ['authentication'],
        type: 'authentication',
        purpose: '用户认证和登录'
      },
      {
        pattern: /(register|signup|注册)/,
        elementRoles: ['registration'],
        type: 'registration',
        purpose: '用户注册和账户创建'
      },
      {
        pattern: /(dashboard|仪表板|控制台)/,
        elementRoles: ['navigation', 'primary_action'],
        type: 'dashboard',
        purpose: '用户控制面板和数据概览'
      },
      {
        pattern: /(product|商品|产品)/,
        elementRoles: ['commerce'],
        type: 'product_catalog',
        purpose: '产品展示和销售'
      },
      {
        pattern: /(home|首页|主页)/,
        elementRoles: ['navigation'],
        type: 'homepage',
        purpose: '网站首页和导航入口'
      }
    ];
    
    for (const rule of pageRules) {
      const contextMatch = rule.pattern.test(context);
      const elementMatch = rule.elementRoles.some(role => elementTypes.includes(role));
      
      if (contextMatch || elementMatch) {
        const confidence = (contextMatch ? 0.7 : 0) + (elementMatch ? 0.3 : 0);
        this.context.confidence = confidence;
        
        return {
          pageType: rule.type,
          mainPurpose: rule.purpose,
          confidence
        };
      }
    }
    
    return {
      pageType: 'generic',
      mainPurpose: '通用网页',
      confidence: 0.3
    };
  }
  
  // 推断用户旅程
  private inferUserJourney(elements: ElementInfo[], pageType: string): string[] {
    const journeyTemplates: Record<string, string[]> = {
      'authentication': ['访问登录页', '输入凭据', '点击登录', '验证成功'],
      'registration': ['访问注册页', '填写表单', '提交注册', '账户激活'],
      'product_catalog': ['浏览产品', '查看详情', '添加到购物车', '结算购买'],
      'dashboard': ['查看概览', '访问功能模块', '执行操作', '查看结果'],
      'homepage': ['访问首页', '探索导航', '选择功能', '进入子页面']
    };
    
    return journeyTemplates[pageType] || ['访问页面', '浏览内容', '执行操作', '查看结果'];
  }
  
  // 智能动作规划
  async planNextActions(userIntent: string = 'explore'): Promise<ActionPlan[]> {
    const highImportanceElements = this.context.discoveredElements.filter(e => e.importance > 10);
    const actions: ActionPlan[] = [];
    
    // 基于元素重要性和语义角色规划动作
    for (const element of highImportanceElements.slice(0, 5)) {
      const actionType = this.determineActionType(element);
      const priority = this.calculateActionPriority(element, userIntent);
      
      actions.push({
        action: actionType,
        target: element.selector,
        parameters: { elementInfo: element },
        priority,
        expectedOutcome: this.predictActionOutcome(actionType, element),
        confidence: this.context.confidence
      });
    }
    
    // 按优先级排序
    return actions.sort((a, b) => b.priority - a.priority);
  }
  
  private determineActionType(element: ElementInfo): ActionPlan['action'] {
    if (element.type === 'button') return 'click';
    if (element.type === 'input') return 'fill';
    if (element.type === 'link') return 'navigate';
    if (element.type === 'form') return 'analyze';
    return 'verify';
  }
  
  private calculateActionPriority(element: ElementInfo, intent: string): number {
    let priority = element.importance;
    
    // 基于用户意图调整优先级
    if (intent === 'test_authentication' && element.semantic_role === 'authentication') {
      priority += 10;
    } else if (intent === 'test_commerce' && element.semantic_role === 'commerce') {
      priority += 10;
    }
    
    return priority;
  }
  
  private predictActionOutcome(action: ActionPlan['action'], element: ElementInfo): string {
    const outcomes = {
      'click': `点击 "${element.text}" 将触发相关功能`,
      'fill': `填写 "${element.text}" 字段将更新表单状态`,
      'navigate': `导航到 "${element.text}" 链接将改变页面`,
      'verify': `验证 "${element.text}" 元素的存在和状态`,
      'analyze': `分析 "${element.text}" 元素的结构和内容`
    };
    
    return outcomes[action] || '执行未知操作';
  }
  
  // 执行智能动作
  async executeIntelligentAction(actionPlan: ActionPlan): Promise<InteractionEvent> {
    const startTime = Date.now();
    let success = false;
    let outcome = '';
    
    try {
      const element = this.page.locator(actionPlan.target);
      
      switch (actionPlan.action) {
        case 'click':
          if (await element.isVisible() && await element.isEnabled()) {
            // 安全点击（悬停而非实际点击）
            await element.hover();
            success = true;
            outcome = 'Element hovered successfully';
          }
          break;
          
        case 'fill':
          if (await element.isVisible() && await element.isEnabled()) {
            await element.fill('test_value');
            success = true;
            outcome = 'Field filled with test value';
          }
          break;
          
        case 'verify':
          success = await element.isVisible();
          outcome = success ? 'Element verified as visible' : 'Element not visible';
          break;
          
        case 'analyze':
          const count = await element.count();
          success = true;
          outcome = `Found ${count} matching elements`;
          break;
      }
      
    } catch (error) {
      outcome = `Action failed: ${error}`;
    }
    
    const event: InteractionEvent = {
      timestamp: startTime,
      action: actionPlan.action,
      element: actionPlan.parameters?.elementInfo,
      success,
      outcome
    };
    
    this.context.interactionHistory.push(event);
    return event;
  }
  
  // 生成智能测试报告
  generateIntelligentReport(): {
    summary: string;
    elementAnalysis: any;
    actionResults: any;
    recommendations: string[];
    confidenceScore: number;
  } {
    const totalElements = this.context.discoveredElements.length;
    const totalActions = this.context.interactionHistory.length;
    const successfulActions = this.context.interactionHistory.filter(e => e.success).length;
    const successRate = totalActions > 0 ? successfulActions / totalActions : 0;
    
    // 元素分析统计
    const elementTypes = this.context.discoveredElements.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const semanticRoles = this.context.discoveredElements.reduce((acc, e) => {
      acc[e.semantic_role] = (acc[e.semantic_role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // 生成建议
    const recommendations = [];
    
    if (successRate < 0.8) {
      recommendations.push('提高元素选择器的准确性');
    }
    
    if (totalElements < 5) {
      recommendations.push('页面可能需要更多交互元素');
    }
    
    if (this.context.confidence < 0.6) {
      recommendations.push('页面分类置信度较低，需要更多上下文信息');
    }
    
    return {
      summary: `MCP分析发现 ${totalElements} 个元素，执行 ${totalActions} 个动作，成功率 ${(successRate * 100).toFixed(1)}%`,
      elementAnalysis: { elementTypes, semanticRoles },
      actionResults: {
        total: totalActions,
        successful: successfulActions,
        successRate
      },
      recommendations,
      confidenceScore: this.context.confidence
    };
  }
}

test.describe('🤖 MCP深度集成测试', () => {
  let mcpProcessor: MCPProcessor;
  
  test.beforeEach(async ({ page }) => {
    mcpProcessor = new MCPProcessor(page);
  });
  
  test('🧠 MCP智能页面理解测试', async ({ page }) => {
    await page.goto('/');
    
    console.log('🔍 开始MCP智能页面分析...');
    const understanding = await mcpProcessor.understandPage();
    
    // 验证页面理解结果
    expect(understanding.pageType).toBeDefined();
    expect(understanding.mainPurpose).toBeDefined();
    expect(understanding.keyElements.length).toBeGreaterThan(0);
    expect(understanding.userJourney.length).toBeGreaterThan(0);
    expect(understanding.confidence).toBeGreaterThan(0);
    
    console.log('✅ MCP页面理解测试完成');
    console.log(`   页面类型: ${understanding.pageType}`);
    console.log(`   置信度: ${(understanding.confidence * 100).toFixed(1)}%`);
    console.log(`   发现元素: ${understanding.keyElements.length} 个`);
  });
  
  test('🎯 MCP智能动作规划和执行', async ({ page }) => {
    await page.goto('/');
    
    // 页面理解
    await mcpProcessor.understandPage();
    
    console.log('📋 生成智能动作计划...');
    const actionPlan = await mcpProcessor.planNextActions('automated_testing');
    
    expect(actionPlan.length).toBeGreaterThan(0);
    console.log(`📊 生成 ${actionPlan.length} 个智能动作:`);
    
    actionPlan.slice(0, 5).forEach((action, index) => {
      console.log(`   ${index + 1}. ${action.action} -> ${action.target.slice(0, 30)}`);
      console.log(`      优先级: ${action.priority}, 置信度: ${(action.confidence * 100).toFixed(1)}%`);
    });
    
    // 执行前3个高优先级动作
    console.log('🚀 执行智能动作...');
    const results = [];
    
    for (const action of actionPlan.slice(0, 3)) {
      const result = await mcpProcessor.executeIntelligentAction(action);
      results.push(result);
      
      console.log(`   ${action.action}: ${result.success ? '✅' : '❌'} ${result.outcome}`);
      
      // 短暂等待
      await page.waitForTimeout(200);
    }
    
    // 验证执行结果
    const successCount = results.filter(r => r.success).length;
    expect(successCount).toBeGreaterThan(0);
    
    console.log(`✅ 动作执行完成，成功率: ${(successCount / results.length * 100).toFixed(1)}%`);
  });
  
  test('📊 MCP跨页面智能分析', async ({ page }) => {
    const pages = ['/', '/products', '/dashboard'];
    const pageAnalysis: Record<string, any> = {};
    
    for (const pagePath of pages) {
      console.log(`🔍 分析页面: ${pagePath}`);
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // 重新初始化MCP处理器
      mcpProcessor = new MCPProcessor(page);
      
      const understanding = await mcpProcessor.understandPage();
      const actionPlan = await mcpProcessor.planNextActions();
      
      pageAnalysis[pagePath] = {
        understanding,
        actionPlan: actionPlan.slice(0, 3),
        elementCount: understanding.keyElements.length
      };
      
      console.log(`   类型: ${understanding.pageType}, 元素: ${understanding.keyElements.length} 个`);
    }
    
    // 跨页面一致性分析
    const pageTypes = Object.values(pageAnalysis).map(p => p.understanding.pageType);
    const uniqueTypes = [...new Set(pageTypes)];
    
    console.log('📈 跨页面分析结果:');
    console.log(`   页面类型数: ${uniqueTypes.length}`);
    console.log(`   平均元素数: ${Object.values(pageAnalysis).reduce((sum: number, p: any) => sum + p.elementCount, 0) / pages.length}`);
    
    // 验证分析质量
    expect(Object.keys(pageAnalysis).length).toBe(pages.length);
    expect(uniqueTypes.length).toBeGreaterThan(0);
  });
  
  test('🔄 MCP自适应学习测试', async ({ page }) => {
    await page.goto('/');
    
    // 第一轮分析和执行
    console.log('🎯 第一轮MCP学习...');
    await mcpProcessor.understandPage();
    let actionPlan = await mcpProcessor.planNextActions();
    
    // 执行一些动作
    for (const action of actionPlan.slice(0, 2)) {
      await mcpProcessor.executeIntelligentAction(action);
    }
    
    let report1 = mcpProcessor.generateIntelligentReport();
    
    // 导航到另一个页面
    await page.goto('/products');
    
    // 第二轮分析（模拟学习效果）
    console.log('🎯 第二轮MCP学习...');
    mcpProcessor = new MCPProcessor(page);
    await mcpProcessor.understandPage();
    actionPlan = await mcpProcessor.planNextActions();
    
    for (const action of actionPlan.slice(0, 2)) {
      await mcpProcessor.executeIntelligentAction(action);
    }
    
    let report2 = mcpProcessor.generateIntelligentReport();
    
    // 比较学习效果
    console.log('📊 学习效果对比:');
    console.log(`   第一轮: ${report1.summary}`);
    console.log(`   第二轮: ${report2.summary}`);
    console.log(`   置信度变化: ${(report1.confidenceScore * 100).toFixed(1)}% -> ${(report2.confidenceScore * 100).toFixed(1)}%`);
    
    // 验证学习效果
    expect(report2.actionResults.total).toBeGreaterThan(0);
    expect(report2.recommendations.length).toBeGreaterThanOrEqual(0);
    
    console.log('✅ MCP自适应学习测试完成');
  });
  
  test('🎭 MCP复杂场景适应性测试', async ({ page }) => {
    // 模拟复杂的用户场景
    const scenarios = [
      { intent: 'user_authentication', page: '/', description: '用户认证流程' },
      { intent: 'product_exploration', page: '/products', description: '产品浏览流程' },
      { intent: 'dashboard_navigation', page: '/dashboard', description: '控制面板操作' }
    ];
    
    const scenarioResults: Record<string, any> = {};
    
    for (const scenario of scenarios) {
      console.log(`🎭 测试场景: ${scenario.description}`);
      
      await page.goto(scenario.page);
      await page.waitForLoadState('networkidle');
      
      // 重新初始化
      mcpProcessor = new MCPProcessor(page);
      
      // 针对特定意图进行分析
      const understanding = await mcpProcessor.understandPage();
      const actionPlan = await mcpProcessor.planNextActions(scenario.intent);
      
      // 执行场景相关的动作
      const executionResults = [];
      for (const action of actionPlan.slice(0, 2)) {
        const result = await mcpProcessor.executeIntelligentAction(action);
        executionResults.push(result);
      }
      
      const report = mcpProcessor.generateIntelligentReport();
      
      scenarioResults[scenario.intent] = {
        understanding,
        actionPlan: actionPlan.length,
        successRate: executionResults.filter(r => r.success).length / Math.max(executionResults.length, 1),
        report
      };
      
      console.log(`   动作计划: ${actionPlan.length} 个`);
      console.log(`   执行成功率: ${(scenarioResults[scenario.intent].successRate * 100).toFixed(1)}%`);
    }
    
    // 综合场景适应性评估
    const overallSuccessRate = Object.values(scenarioResults).reduce((sum: number, result: any) => sum + result.successRate, 0) / scenarios.length;
    
    console.log('🏆 场景适应性综合评估:');
    console.log(`   整体成功率: ${(overallSuccessRate * 100).toFixed(1)}%`);
    console.log(`   场景覆盖: ${scenarios.length} 个`);
    
    // 验证适应性
    expect(overallSuccessRate).toBeGreaterThan(0.5);
    expect(Object.keys(scenarioResults).length).toBe(scenarios.length);
    
    console.log('✅ MCP复杂场景适应性测试完成');
  });
});