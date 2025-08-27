import { test, expect, Page, Locator } from '@playwright/test';

/**
 * 高级按钮算法深度测试套件
 * 使用AI算法进行智能按钮识别、分类和交互预测
 */

// 按钮特征提取器
interface ButtonFeatures {
  text: string;
  ariaLabel: string;
  role: string;
  className: string;
  tagName: string;
  dataAttributes: Record<string, string>;
  position: { x: number; y: number; width: number; height: number };
  color: string;
  backgroundColor: string;
  fontSize: string;
  fontWeight: string;
  zIndex: number;
  isVisible: boolean;
  isEnabled: boolean;
  hasIcon: boolean;
  iconType?: string;
}

// 按钮行为预测器
interface ButtonBehaviorPrediction {
  actionType: 'navigation' | 'form_submit' | 'modal_open' | 'data_modify' | 'api_call' | 'ui_toggle';
  confidence: number;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
  sideEffects: string[];
  requiredPreconditions: string[];
}

// 智能按钮分析引擎
class AdvancedButtonAnalyzer {
  constructor(private page: Page) {}
  
  // 深度特征提取
  async extractButtonFeatures(element: Locator): Promise<ButtonFeatures> {
    const boundingBox = await element.boundingBox();
    const computedStyles = await element.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        color: styles.color,
        backgroundColor: styles.backgroundColor,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        zIndex: styles.zIndex
      };
    });
    
    const dataAttributes: Record<string, string> = {};
    const attributes = await element.evaluate((el) => {
      const attrs: Record<string, string> = {};
      for (const attr of el.attributes) {
        if (attr.name.startsWith('data-')) {
          attrs[attr.name] = attr.value;
        }
      }
      return attrs;
    });
    
    // 检测图标存在
    const hasIcon = await element.locator('svg, i, .icon, [class*="icon"]').count() > 0;
    const iconType = hasIcon ? await this.detectIconType(element) : undefined;
    
    return {
      text: await element.textContent() || '',
      ariaLabel: await element.getAttribute('aria-label') || '',
      role: await element.getAttribute('role') || '',
      className: await element.getAttribute('class') || '',
      tagName: await element.evaluate(el => el.tagName.toLowerCase()),
      dataAttributes: { ...dataAttributes, ...attributes },
      position: boundingBox || { x: 0, y: 0, width: 0, height: 0 },
      ...computedStyles,
      isVisible: await element.isVisible(),
      isEnabled: await element.isEnabled(),
      hasIcon,
      iconType
    };
  }
  
  // 图标类型检测
  private async detectIconType(element: Locator): Promise<string> {
    const iconSelectors = {
      'arrow': ['arrow', 'chevron', 'caret'],
      'action': ['plus', 'minus', 'edit', 'delete', 'save'],
      'navigation': ['home', 'menu', 'burger', 'nav'],
      'social': ['facebook', 'twitter', 'linkedin', 'share'],
      'utility': ['search', 'filter', 'sort', 'download', 'upload'],
      'status': ['check', 'cross', 'warning', 'info', 'success', 'error']
    };
    
    for (const [type, keywords] of Object.entries(iconSelectors)) {
      for (const keyword of keywords) {
        const iconElement = element.locator(`[class*="${keyword}"], [data-icon*="${keyword}"]`);
        if (await iconElement.count() > 0) {
          return type;
        }
      }
    }
    
    return 'generic';
  }
  
  // AI行为预测算法
  predictButtonBehavior(features: ButtonFeatures): ButtonBehaviorPrediction {
    const text = features.text.toLowerCase();
    const className = features.className.toLowerCase();
    const ariaLabel = features.ariaLabel.toLowerCase();
    const fullContext = `${text} ${className} ${ariaLabel}`;
    
    // 规则引擎 + 机器学习模拟
    const rules = [
      {
        pattern: /(submit|send|提交|发送|确认|确定)/,
        actionType: 'form_submit' as const,
        confidence: 0.9,
        outcome: 'Form will be validated and submitted',
        risk: 'medium' as const,
        sideEffects: ['API call', 'Page redirect', 'Data validation'],
        preconditions: ['Form fields filled', 'Validation passed']
      },
      {
        pattern: /(modal|popup|dialog|弹窗|对话框)/,
        actionType: 'modal_open' as const,
        confidence: 0.85,
        outcome: 'Modal or popup will appear',
        risk: 'low' as const,
        sideEffects: ['Overlay display', 'Focus trap'],
        preconditions: ['Modal content ready']
      },
      {
        pattern: /(save|update|edit|保存|更新|编辑)/,
        actionType: 'data_modify' as const,
        confidence: 0.8,
        outcome: 'Data will be modified',
        risk: 'high' as const,
        sideEffects: ['Database update', 'State change', 'Cache invalidation'],
        preconditions: ['Valid data', 'Permission granted']
      },
      {
        pattern: /(nav|menu|home|back|next|导航|菜单|首页|返回|下一步)/,
        actionType: 'navigation' as const,
        confidence: 0.7,
        outcome: 'Page navigation will occur',
        risk: 'low' as const,
        sideEffects: ['Route change', 'Component unmount', 'State reset'],
        preconditions: ['Target route exists']
      },
      {
        pattern: /(toggle|switch|dropdown|切换|开关|下拉)/,
        actionType: 'ui_toggle' as const,
        confidence: 0.75,
        outcome: 'UI state will toggle',
        risk: 'low' as const,
        sideEffects: ['Visual state change', 'Local state update'],
        preconditions: ['Element is interactive']
      },
      {
        pattern: /(api|fetch|load|refresh|search|查询|搜索|加载)/,
        actionType: 'api_call' as const,
        confidence: 0.8,
        outcome: 'API request will be made',
        risk: 'medium' as const,
        sideEffects: ['Network request', 'Loading state', 'Data update'],
        preconditions: ['Network available', 'API endpoint ready']
      }
    ];
    
    // 应用规则引擎
    for (const rule of rules) {
      if (rule.pattern.test(fullContext)) {
        return {
          actionType: rule.actionType,
          confidence: rule.confidence,
          expectedOutcome: rule.outcome,
          riskLevel: rule.risk,
          sideEffects: rule.sideEffects,
          requiredPreconditions: rule.preconditions
        };
      }
    }
    
    // 默认预测
    return {
      actionType: 'ui_toggle',
      confidence: 0.3,
      expectedOutcome: 'Generic button interaction',
      riskLevel: 'low',
      sideEffects: ['Basic interaction'],
      requiredPreconditions: ['Element clickable']
    };
  }
  
  // 按钮语义相似度计算
  calculateSemanticSimilarity(button1Features: ButtonFeatures, button2Features: ButtonFeatures): number {
    const textSim = this.textSimilarity(button1Features.text, button2Features.text);
    const classSim = this.textSimilarity(button1Features.className, button2Features.className);
    const positionSim = this.positionSimilarity(button1Features.position, button2Features.position);
    const styleSim = this.styleSimilarity(button1Features, button2Features);
    
    // 加权平均
    return (textSim * 0.4 + classSim * 0.3 + positionSim * 0.15 + styleSim * 0.15);
  }
  
  private textSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];
    
    return union.length > 0 ? intersection.length / union.length : 0;
  }
  
  private positionSimilarity(pos1: any, pos2: any): number {
    const distance = Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
    const maxDistance = 1000; // 假设的最大距离
    return Math.max(0, 1 - distance / maxDistance);
  }
  
  private styleSimilarity(features1: ButtonFeatures, features2: ButtonFeatures): number {
    let score = 0;
    if (features1.backgroundColor === features2.backgroundColor) score += 0.3;
    if (features1.color === features2.color) score += 0.3;
    if (features1.fontSize === features2.fontSize) score += 0.2;
    if (features1.fontWeight === features2.fontWeight) score += 0.2;
    return score;
  }
}

// 按钮交互序列分析器
class InteractionSequenceAnalyzer {
  private interactionHistory: Array<{
    timestamp: number;
    buttonFeatures: ButtonFeatures;
    prediction: ButtonBehaviorPrediction;
    actualOutcome: string;
    success: boolean;
  }> = [];
  
  recordInteraction(
    buttonFeatures: ButtonFeatures,
    prediction: ButtonBehaviorPrediction,
    actualOutcome: string,
    success: boolean
  ) {
    this.interactionHistory.push({
      timestamp: Date.now(),
      buttonFeatures,
      prediction,
      actualOutcome,
      success
    });
  }
  
  analyzePatterns(): {
    successRate: number;
    mostReliablePatterns: string[];
    commonFailurePatterns: string[];
    recommendedImprovements: string[];
  } {
    const totalInteractions = this.interactionHistory.length;
    const successfulInteractions = this.interactionHistory.filter(i => i.success).length;
    
    const successRate = totalInteractions > 0 ? successfulInteractions / totalInteractions : 0;
    
    // 分析成功模式
    const successfulPatterns = this.interactionHistory
      .filter(i => i.success)
      .map(i => i.buttonFeatures.text.toLowerCase())
      .filter((text, index, array) => array.indexOf(text) === index);
    
    // 分析失败模式
    const failurePatterns = this.interactionHistory
      .filter(i => !i.success)
      .map(i => i.buttonFeatures.text.toLowerCase())
      .filter((text, index, array) => array.indexOf(text) === index);
    
    return {
      successRate,
      mostReliablePatterns: successfulPatterns.slice(0, 5),
      commonFailurePatterns: failurePatterns.slice(0, 5),
      recommendedImprovements: this.generateRecommendations()
    };
  }
  
  private generateRecommendations(): string[] {
    const recommendations = [];
    const lowConfidenceCount = this.interactionHistory.filter(i => i.prediction.confidence < 0.5).length;
    
    if (lowConfidenceCount > this.interactionHistory.length * 0.3) {
      recommendations.push('Improve button classification patterns');
    }
    
    const highRiskFailures = this.interactionHistory.filter(
      i => !i.success && i.prediction.riskLevel === 'high'
    ).length;
    
    if (highRiskFailures > 0) {
      recommendations.push('Add pre-validation for high-risk actions');
    }
    
    return recommendations;
  }
}

test.describe('🤖 高级按钮算法深度测试', () => {
  let analyzer: AdvancedButtonAnalyzer;
  let sequenceAnalyzer: InteractionSequenceAnalyzer;
  
  test.beforeEach(async ({ page }) => {
    analyzer = new AdvancedButtonAnalyzer(page);
    sequenceAnalyzer = new InteractionSequenceAnalyzer();
  });
  
  test('🧠 AI按钮特征提取和行为预测', async ({ page }) => {
    await page.goto('/');
    
    // 获取所有按钮元素
    const buttonSelectors = [
      'button',
      'input[type="submit"]',
      'input[type="button"]',
      '[role="button"]',
      'a[href]'
    ];
    
    const allButtons: Locator[] = [];
    for (const selector of buttonSelectors) {
      const elements = await page.locator(selector).all();
      allButtons.push(...elements);
    }
    
    console.log(`🎯 开始分析 ${allButtons.length} 个按钮元素`);
    
    const buttonAnalysis: Array<{
      element: Locator;
      features: ButtonFeatures;
      prediction: ButtonBehaviorPrediction;
    }> = [];
    
    // 对每个按钮进行深度分析
    for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
      const element = allButtons[i];
      
      if (await element.isVisible()) {
        const features = await analyzer.extractButtonFeatures(element);
        const prediction = analyzer.predictButtonBehavior(features);
        
        buttonAnalysis.push({ element, features, prediction });
        
        console.log(`📊 按钮 ${i + 1}: "${features.text.slice(0, 30)}"`);
        console.log(`   行为预测: ${prediction.actionType} (置信度: ${(prediction.confidence * 100).toFixed(1)}%)`);
        console.log(`   风险等级: ${prediction.riskLevel}`);
        console.log(`   期望结果: ${prediction.expectedOutcome}`);
        console.log(`   副作用: ${prediction.sideEffects.join(', ')}`);
      }
    }
    
    // 验证分析质量
    expect(buttonAnalysis.length).toBeGreaterThan(0);
    
    // 验证高置信度预测
    const highConfidencePredictions = buttonAnalysis.filter(b => b.prediction.confidence > 0.7);
    console.log(`✅ 高置信度预测: ${highConfidencePredictions.length}/${buttonAnalysis.length}`);
    
    // 验证风险评估分布
    const riskDistribution = buttonAnalysis.reduce((acc, b) => {
      acc[b.prediction.riskLevel] = (acc[b.prediction.riskLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📈 风险分布:', riskDistribution);
    expect(Object.keys(riskDistribution).length).toBeGreaterThan(0);
  });
  
  test('🔍 按钮语义相似度聚类分析', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button, [role="button"], input[type="submit"]').all();
    const visibleButtons = [];
    
    // 提取可见按钮特征
    for (const button of buttons.slice(0, 8)) {
      if (await button.isVisible()) {
        const features = await analyzer.extractButtonFeatures(button);
        visibleButtons.push({ element: button, features });
      }
    }
    
    console.log(`🎯 对 ${visibleButtons.length} 个按钮进行相似度分析`);
    
    // 计算相似度矩阵
    const similarityMatrix: number[][] = [];
    const clusters: number[][] = [];
    
    for (let i = 0; i < visibleButtons.length; i++) {
      similarityMatrix[i] = [];
      for (let j = 0; j < visibleButtons.length; j++) {
        const similarity = analyzer.calculateSemanticSimilarity(
          visibleButtons[i].features,
          visibleButtons[j].features
        );
        similarityMatrix[i][j] = similarity;
      }
    }
    
    // 简单聚类算法（基于相似度阈值）
    const visited = new Set<number>();
    const threshold = 0.3;
    
    for (let i = 0; i < visibleButtons.length; i++) {
      if (!visited.has(i)) {
        const cluster = [i];
        visited.add(i);
        
        for (let j = i + 1; j < visibleButtons.length; j++) {
          if (!visited.has(j) && similarityMatrix[i][j] > threshold) {
            cluster.push(j);
            visited.add(j);
          }
        }
        
        clusters.push(cluster);
      }
    }
    
    console.log(`📊 发现 ${clusters.length} 个按钮聚类:`);
    clusters.forEach((cluster, index) => {
      console.log(`  聚类 ${index + 1}: ${cluster.length} 个按钮`);
      cluster.forEach(buttonIndex => {
        const text = visibleButtons[buttonIndex].features.text.slice(0, 20);
        console.log(`    - "${text}"`);
      });
    });
    
    // 验证聚类质量
    expect(clusters.length).toBeGreaterThan(0);
    expect(clusters.length).toBeLessThanOrEqual(visibleButtons.length);
  });
  
  test('🎮 交互序列学习和优化', async ({ page }) => {
    await page.goto('/');
    
    const buttons = await page.locator('button, [role="button"]').all();
    const testButtons = buttons.slice(0, 5);
    
    console.log(`🔄 开始交互序列学习，测试 ${testButtons.length} 个按钮`);
    
    for (let i = 0; i < testButtons.length; i++) {
      const button = testButtons[i];
      
      if (await button.isVisible() && await button.isEnabled()) {
        const features = await analyzer.extractButtonFeatures(button);
        const prediction = analyzer.predictButtonBehavior(features);
        
        console.log(`🎯 测试按钮 ${i + 1}: "${features.text.slice(0, 30)}"`);
        console.log(`   预测行为: ${prediction.actionType}`);
        
        // 模拟交互（悬停而非点击，避免页面跳转）
        try {
          await button.hover();
          await page.waitForTimeout(100);
          
          // 检测实际结果
          const hasTooltip = await page.locator('[role="tooltip"], .tooltip').isVisible();
          const hasHighlight = await button.evaluate(el => {
            const styles = window.getComputedStyle(el);
            return styles.backgroundColor !== 'rgba(0, 0, 0, 0)' || 
                   styles.border !== 'none';
          });
          
          const actualOutcome = hasTooltip ? 'tooltip_shown' : 
                               hasHighlight ? 'visual_feedback' : 
                               'no_visible_change';
          
          const success = actualOutcome !== 'no_visible_change';
          
          // 记录交互结果
          sequenceAnalyzer.recordInteraction(features, prediction, actualOutcome, success);
          
          console.log(`   实际结果: ${actualOutcome} (${success ? '✅' : '❌'})`);
          
        } catch (error) {
          sequenceAnalyzer.recordInteraction(features, prediction, 'interaction_failed', false);
          console.log(`   交互失败: ${error}`);
        }
      }
    }
    
    // 分析交互模式
    const patterns = sequenceAnalyzer.analyzePatterns();
    
    console.log(`📈 交互序列分析结果:`);
    console.log(`   成功率: ${(patterns.successRate * 100).toFixed(1)}%`);
    console.log(`   可靠模式: ${patterns.mostReliablePatterns.join(', ')}`);
    console.log(`   失败模式: ${patterns.commonFailurePatterns.join(', ')}`);
    console.log(`   改进建议: ${patterns.recommendedImprovements.join(', ')}`);
    
    // 验证学习效果
    expect(patterns.successRate).toBeGreaterThan(0);
    expect(patterns.mostReliablePatterns.length + patterns.commonFailurePatterns.length).toBeGreaterThan(0);
  });
  
  test('🎯 跨页面按钮一致性分析', async ({ page }) => {
    const pages = ['/', '/products', '/dashboard'];
    const pageButtonAnalysis: Record<string, Array<ButtonFeatures>> = {};
    
    for (const pagePath of pages) {
      console.log(`📊 分析页面: ${pagePath}`);
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      const buttons = await page.locator('button, [role="button"]').all();
      const buttonFeatures: ButtonFeatures[] = [];
      
      for (const button of buttons.slice(0, 6)) {
        if (await button.isVisible()) {
          const features = await analyzer.extractButtonFeatures(button);
          buttonFeatures.push(features);
        }
      }
      
      pageButtonAnalysis[pagePath] = buttonFeatures;
      console.log(`   发现 ${buttonFeatures.length} 个按钮`);
    }
    
    // 跨页面一致性分析
    const consistencyReport = analyzeConsistency(pageButtonAnalysis);
    
    console.log(`🔍 跨页面一致性报告:`);
    console.log(`   通用按钮模式: ${consistencyReport.commonPatterns.length} 个`);
    console.log(`   页面特有模式: ${consistencyReport.uniquePatterns.length} 个`);
    console.log(`   一致性得分: ${(consistencyReport.consistencyScore * 100).toFixed(1)}%`);
    
    // 验证一致性
    expect(consistencyReport.consistencyScore).toBeGreaterThan(0.2);
    expect(consistencyReport.commonPatterns.length).toBeGreaterThan(0);
  });
  
});

// 辅助方法：一致性分析  
function analyzeConsistency(pageAnalysis: Record<string, Array<ButtonFeatures>>) {
    const allPatterns = Object.values(pageAnalysis).flat();
    const patternCounts: Record<string, number> = {};
    
    // 统计模式出现频率
    allPatterns.forEach(features => {
      const pattern = `${features.tagName}:${features.text.slice(0, 10)}:${features.className.split(' ')[0]}`;
      patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
    });
    
    const totalPages = Object.keys(pageAnalysis).length;
    const commonPatterns = Object.entries(patternCounts)
      .filter(([_, count]) => count >= totalPages)
      .map(([pattern, _]) => pattern);
    
    const uniquePatterns = Object.entries(patternCounts)
      .filter(([_, count]) => count === 1)
      .map(([pattern, _]) => pattern);
    
    const consistencyScore = commonPatterns.length / Object.keys(patternCounts).length;
    
    return { commonPatterns, uniquePatterns, consistencyScore };
}

test.describe.skip('🚀 性能分析测试', () => {
  test('🚀 按钮性能影响分析', async ({ page }) => {
    await page.goto('/');
    
    // 性能测量开始
    const startTime = performance.now();
    
    const buttons = await page.locator('button').all();
    const performanceMetrics: Array<{
      buttonText: string;
      analysisTime: number;
      interactionTime: number;
      memoryImpact: number;
    }> = [];
    
    for (let i = 0; i < Math.min(buttons.length, 5); i++) {
      const button = buttons[i];
      
      if (await button.isVisible()) {
        // 测量分析时间
        const analysisStart = performance.now();
        const features = await analyzer.extractButtonFeatures(button);
        const prediction = analyzer.predictButtonBehavior(features);
        const analysisTime = performance.now() - analysisStart;
        
        // 测量交互时间
        const interactionStart = performance.now();
        await button.hover();
        const interactionTime = performance.now() - interactionStart;
        
        // 模拟内存影响（特征对象大小）
        const memoryImpact = JSON.stringify({ features, prediction }).length;
        
        performanceMetrics.push({
          buttonText: features.text.slice(0, 20),
          analysisTime,
          interactionTime,
          memoryImpact
        });
        
        console.log(`⚡ 按钮 "${features.text.slice(0, 20)}"`);
        console.log(`   分析耗时: ${analysisTime.toFixed(2)}ms`);
        console.log(`   交互耗时: ${interactionTime.toFixed(2)}ms`);
        console.log(`   内存占用: ${memoryImpact} bytes`);
      }
    }
    
    const totalTime = performance.now() - startTime;
    const avgAnalysisTime = performanceMetrics.reduce((sum, m) => sum + m.analysisTime, 0) / performanceMetrics.length;
    const avgInteractionTime = performanceMetrics.reduce((sum, m) => sum + m.interactionTime, 0) / performanceMetrics.length;
    
    console.log(`📊 性能分析总结:`);
    console.log(`   总耗时: ${totalTime.toFixed(2)}ms`);
    console.log(`   平均分析时间: ${avgAnalysisTime.toFixed(2)}ms`);
    console.log(`   平均交互时间: ${avgInteractionTime.toFixed(2)}ms`);
    
    // 性能验证
    expect(avgAnalysisTime).toBeLessThan(100); // 分析应该在100ms内完成
    expect(avgInteractionTime).toBeLessThan(50); // 交互应该在50ms内完成
    expect(totalTime).toBeLessThan(5000); // 总时间应该在5秒内
  });
});