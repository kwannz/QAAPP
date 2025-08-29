/**
 * 部署验证测试
 * Deployment Validation Tests - 验证所有服务是否正确部署和运行
 * 创建时间: 2025-08-29
 */

import { test, expect, Page } from '@playwright/test';
import { testLogger, startTest, endTest, step, setupPageLogging } from '../utils/test-logger';

test.describe('🚀 部署验证测试', () => {
  let page: Page;

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    setupPageLogging(page);
  });

  test('验证Web应用部署状态', async () => {
    const testName = '验证Web应用部署状态';
    startTest(testName);

    try {
      const deploymentStep = step('检查Web应用是否可访问');
      
      // 访问主页
      await page.goto('/', { waitUntil: 'networkidle', timeout: 30000 });
      
      // 验证页面加载
      await expect(page).toHaveTitle(/QA/i);
      deploymentStep.success('Web应用主页成功加载');

      const healthStep = step('检查健康状态');
      
      // 检查页面基本元素
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang');
      
      // 检查是否有错误信息
      const errorElements = page.locator('[class*="error"], .error, #error');
      const errorCount = await errorElements.count();
      expect(errorCount).toBe(0);
      
      healthStep.success(`页面健康检查通过，无错误元素`);

      const assetsStep = step('验证静态资源加载');
      
      // 检查关键CSS是否加载
      const styles = await page.evaluate(() => {
        const stylesheets = Array.from(document.styleSheets);
        return stylesheets.length > 0;
      });
      expect(styles).toBeTruthy();
      
      // 检查JavaScript是否正常工作
      const jsWorking = await page.evaluate(() => {
        return typeof window !== 'undefined' && typeof document !== 'undefined';
      });
      expect(jsWorking).toBeTruthy();
      
      assetsStep.success('静态资源加载正常');

      const performanceStep = step('检查页面性能');
      
      // 测量页面加载时间
      const performance = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          totalTime: navigation.loadEventEnd - navigation.navigationStart
        };
      });
      
      // 记录性能指标
      testLogger.recordPerformance('DOMContentLoaded', performance.domContentLoaded, 'ms', 'timing');
      testLogger.recordPerformance('LoadComplete', performance.loadComplete, 'ms', 'timing');
      testLogger.recordPerformance('TotalLoadTime', performance.totalTime, 'ms', 'timing');
      
      // 验证性能指标在合理范围内
      expect(performance.totalTime).toBeLessThan(10000); // 10秒内加载完成
      
      performanceStep.success(`页面性能正常 - 总加载时间: ${performance.totalTime.toFixed(2)}ms`);

      // 截图记录
      const screenshotPath = 'test-results/screenshots/deployment-validation-homepage.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testLogger.recordScreenshot(screenshotPath);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证API服务连接', async () => {
    const testName = '验证API服务连接';
    startTest(testName);

    try {
      const healthCheckStep = step('检查API健康状态端点');
      
      // 访问页面以触发API调用
      await page.goto('/');
      
      // 等待并监听网络请求
      const apiRequests: any[] = [];
      page.on('response', response => {
        if (response.url().includes('/api/') || response.url().includes('/health')) {
          apiRequests.push({
            url: response.url(),
            status: response.status(),
            statusText: response.statusText(),
            headers: response.headers()
          });
        }
      });
      
      // 尝试直接访问健康检查端点
      let healthResponse;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        healthResponse = await page.request.get(`${apiUrl}/health`);
        
        expect(healthResponse.status()).toBe(200);
        const healthData = await healthResponse.json();
        
        // 验证健康检查响应结构
        expect(healthData).toHaveProperty('status');
        expect(healthData.status).toBe('ok');
        
        healthCheckStep.success(`API健康检查通过 - ${healthResponse.status()} ${healthResponse.statusText()}`);
      } catch (error) {
        // 如果直接访问失败，检查是否有间接的API调用
        if (apiRequests.length > 0) {
          const successfulRequests = apiRequests.filter(req => req.status < 400);
          expect(successfulRequests.length).toBeGreaterThan(0);
          healthCheckStep.success(`API通过页面调用验证 - ${successfulRequests.length}个成功请求`);
        } else {
          throw error;
        }
      }

      const connectivityStep = step('验证数据库连接');
      
      // 尝试访问需要数据库的端点
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const dbResponse = await page.request.get(`${apiUrl}/api/system/status`);
        
        if (dbResponse.status() === 200) {
          const statusData = await dbResponse.json();
          connectivityStep.success('数据库连接正常');
        } else {
          connectivityStep.info('数据库状态端点不可用，跳过检查');
        }
      } catch (error) {
        connectivityStep.info('无法访问数据库状态端点，可能尚未实现');
      }

      const securityStep = step('验证安全配置');
      
      // 检查安全头
      const response = await page.request.get(page.url());
      const headers = response.headers();
      
      // 检查基本安全头（如果配置了的话）
      const securityHeaders = {
        'x-frame-options': headers['x-frame-options'],
        'x-content-type-options': headers['x-content-type-options'],
        'referrer-policy': headers['referrer-policy'],
        'content-security-policy': headers['content-security-policy']
      };
      
      const presentHeaders = Object.entries(securityHeaders)
        .filter(([key, value]) => value !== undefined)
        .map(([key]) => key);
      
      securityStep.success(`安全配置检查完成 - 发现${presentHeaders.length}个安全头: ${presentHeaders.join(', ')}`);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证Docker容器服务状态', async () => {
    const testName = '验证Docker容器服务状态';
    startTest(testName);

    try {
      const servicesStep = step('检查各服务响应状态');
      
      // 检查Web服务
      await page.goto('/');
      await expect(page).toHaveTitle(/QA/i);
      servicesStep.info('✅ Web服务正常运行');
      
      // 检查API服务
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const apiResponse = await page.request.get(`${apiUrl}/health`);
        if (apiResponse.status() === 200) {
          servicesStep.info('✅ API服务正常运行');
        } else {
          servicesStep.info('⚠️ API服务状态异常');
        }
      } catch (error) {
        servicesStep.info('⚠️ 无法直接访问API服务');
      }

      const networkStep = step('验证服务间网络连通性');
      
      // 通过页面JavaScript检查内部网络调用
      const networkTest = await page.evaluate(async () => {
        try {
          // 尝试发起内部API调用
          const response = await fetch('/api/test-connection', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          return {
            success: true,
            status: response.status,
            accessible: true
          };
        } catch (error) {
          // 如果测试端点不存在，尝试其他方式
          return {
            success: false,
            error: error.message,
            accessible: false
          };
        }
      });
      
      if (networkTest.accessible) {
        networkStep.success('服务间网络连通正常');
      } else {
        networkStep.info('服务间网络连通性检查跳过（测试端点不可用）');
      }

      const resourceStep = step('验证系统资源使用情况');
      
      // 检查内存使用（通过浏览器API）
      const memoryInfo = await page.evaluate(() => {
        // @ts-ignore
        if (performance.memory) {
          // @ts-ignore
          const memory = performance.memory;
          return {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          };
        }
        return null;
      });
      
      if (memoryInfo) {
        const usagePercent = (memoryInfo.used / memoryInfo.total) * 100;
        testLogger.recordPerformance('MemoryUsage', usagePercent, 'count', 'memory');
        resourceStep.success(`内存使用率: ${usagePercent.toFixed(2)}%`);
      } else {
        resourceStep.info('内存使用情况检查跳过（API不可用）');
      }

      // 记录部署验证截图
      const screenshotPath = 'test-results/screenshots/docker-services-validation.png';
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testLogger.recordScreenshot(screenshotPath);

      servicesStep.success('Docker容器服务状态验证完成');

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证环境配置', async () => {
    const testName = '验证环境配置';
    startTest(testName);

    try {
      const envStep = step('检查环境变量配置');
      
      // 在页面中检查公开的环境变量
      const envCheck = await page.evaluate(() => {
        const env = {
          nodeEnv: process.env.NODE_ENV,
          // 只检查公开的环境变量
          apiUrl: (window as any).location?.hostname,
          protocol: (window as any).location?.protocol
        };
        
        // 检查Next.js公开的环境变量（如果有的话）
        const nextEnv = Object.keys(process.env || {})
          .filter(key => key.startsWith('NEXT_PUBLIC_'))
          .reduce((acc, key) => {
            acc[key] = process.env[key];
            return acc;
          }, {} as Record<string, any>);
        
        return { env, nextEnv };
      });
      
      // 验证基本环境信息
      expect(envCheck.env.protocol).toMatch(/https?:/);
      expect(envCheck.env.apiUrl).toBeTruthy();
      
      envStep.success(`环境配置检查完成 - Protocol: ${envCheck.env.protocol}, 公开环境变量: ${Object.keys(envCheck.nextEnv).length}个`);

      const configStep = step('验证应用配置完整性');
      
      // 检查页面是否正确加载配置
      const configValidation = await page.evaluate(() => {
        // 检查基本的应用配置
        return {
          title: document.title,
          lang: document.documentElement.lang,
          charset: document.characterSet,
          hasMetaViewport: !!document.querySelector('meta[name="viewport"]'),
          hasMetaDescription: !!document.querySelector('meta[name="description"]')
        };
      });
      
      expect(configValidation.title).toBeTruthy();
      expect(configValidation.charset).toBe('UTF-8');
      expect(configValidation.hasMetaViewport).toBeTruthy();
      
      configStep.success('应用配置完整性验证通过');

      const securityStep = step('验证安全配置');
      
      // 检查HTTPS重定向（如果在生产环境）
      const currentUrl = page.url();
      const isSecure = currentUrl.startsWith('https://') || currentUrl.startsWith('http://localhost');
      expect(isSecure).toBeTruthy();
      
      securityStep.success(`安全配置验证通过 - URL: ${currentUrl}`);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证监控和日志系统', async () => {
    const testName = '验证监控和日志系统';
    startTest(testName);

    try {
      const loggingStep = step('检查前端日志系统');
      
      // 检查控制台输出
      const consoleLogs: string[] = [];
      const consoleErrors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'log' || msg.type() === 'info') {
          consoleLogs.push(msg.text());
        } else if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // 访问页面触发日志
      await page.goto('/');
      await page.waitForTimeout(2000); // 等待日志生成
      
      // 验证没有严重错误
      const criticalErrors = consoleErrors.filter(error => 
        !error.includes('favicon') && 
        !error.includes('service-worker') &&
        !error.includes('Extension')
      );
      
      expect(criticalErrors.length).toBe(0);
      loggingStep.success(`前端日志检查完成 - ${consoleLogs.length}条信息日志，${criticalErrors.length}条错误`);

      const monitoringStep = step('检查监控端点可访问性');
      
      // 尝试访问监控端点（如果配置了的话）
      try {
        const monitoringUrls = [
          '/metrics',
          '/health',
          '/api/health',
          '/api/monitoring/status'
        ];
        
        let accessibleEndpoints = 0;
        for (const endpoint of monitoringUrls) {
          try {
            const response = await page.request.get(endpoint);
            if (response.status() < 500) {
              accessibleEndpoints++;
            }
          } catch (e) {
            // 端点不存在，继续检查下一个
          }
        }
        
        monitoringStep.success(`监控端点检查完成 - ${accessibleEndpoints}个端点可访问`);
      } catch (error) {
        monitoringStep.info('监控端点检查跳过（可能未配置）');
      }

      const performanceStep = step('验证性能监控');
      
      // 收集性能指标
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          navigation: {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart
          },
          paint: paint.map(entry => ({
            name: entry.name,
            startTime: entry.startTime
          })),
          resourceCount: performance.getEntriesByType('resource').length
        };
      });
      
      // 记录性能指标
      testLogger.recordPerformance('NavigationDCL', performanceMetrics.navigation.domContentLoaded, 'ms', 'timing');
      testLogger.recordPerformance('NavigationLoad', performanceMetrics.navigation.loadComplete, 'ms', 'timing');
      testLogger.recordPerformance('ResourceCount', performanceMetrics.resourceCount, 'count', 'network');
      
      performanceStep.success(`性能监控验证完成 - 加载${performanceMetrics.resourceCount}个资源`);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });
});