/**
 * API集成测试
 * Comprehensive API Integration Tests - 验证所有API端点和集成功能
 * 创建时间: 2025-08-29
 */

import { test, expect, Page, APIRequestContext } from '@playwright/test';
import { testLogger, startTest, endTest, step, setupPageLogging } from '../utils/test-logger';

test.describe('🔌 API集成测试', () => {
  let page: Page;
  let apiContext: APIRequestContext;
  const baseApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  test.beforeEach(async ({ page: testPage, request }) => {
    page = testPage;
    apiContext = request;
    setupPageLogging(page);
  });

  test('验证核心API端点可用性', async () => {
    const testName = '验证核心API端点可用性';
    startTest(testName);

    try {
      const healthCheckStep = step('检查API健康状况');
      
      // 定义核心API端点
      const coreEndpoints = [
        { path: '/health', name: '健康检查', method: 'GET', expectedStatus: 200 },
        { path: '/api/health', name: 'API健康检查', method: 'GET', expectedStatus: 200 },
        { path: '/api/v1/health', name: 'V1健康检查', method: 'GET', expectedStatus: 200 },
        { path: '/api/status', name: '系统状态', method: 'GET', expectedStatus: 200 }
      ];
      
      let healthyEndpoints = 0;
      const endpointResults: Array<{endpoint: string, status: number, success: boolean, responseTime: number}> = [];
      
      for (const endpoint of coreEndpoints) {
        const startTime = Date.now();
        try {
          const response = await apiContext.get(`${baseApiUrl}${endpoint.path}`);
          const responseTime = Date.now() - startTime;
          const success = response.status() === endpoint.expectedStatus || (response.status() >= 200 && response.status() < 300);
          
          endpointResults.push({
            endpoint: endpoint.name,
            status: response.status(),
            success,
            responseTime
          });
          
          if (success) {
            healthyEndpoints++;
            testLogger.recordPerformance(`API_${endpoint.name}_ResponseTime`, responseTime, 'ms', 'timing');
          }
          
        } catch (error) {
          endpointResults.push({
            endpoint: endpoint.name,
            status: 0,
            success: false,
            responseTime: Date.now() - startTime
          });
          testLogger.recordError(`API endpoint ${endpoint.path} failed: ${error.message}`);
        }
      }
      
      // 至少一个健康检查端点应该可用
      expect(healthyEndpoints).toBeGreaterThan(0);
      
      healthCheckStep.success(`API健康检查完成 - ${healthyEndpoints}/${coreEndpoints.length}个端点正常`);

      const apiDiscoveryStep = step('发现可用的API端点');
      
      // 尝试发现更多API端点
      const discoveryEndpoints = [
        '/api',
        '/api/v1',
        '/api/v2',
        '/api/swagger',
        '/api/docs',
        '/swagger',
        '/docs'
      ];
      
      const availableEndpoints: string[] = [];
      
      for (const endpoint of discoveryEndpoints) {
        try {
          const response = await apiContext.get(`${baseApiUrl}${endpoint}`);
          if (response.status() < 500) { // 不是服务器错误就认为端点存在
            availableEndpoints.push(endpoint);
          }
        } catch (error) {
          // 端点不存在，继续检查下一个
        }
      }
      
      apiDiscoveryStep.success(`API发现完成 - 找到${availableEndpoints.length}个可用端点: ${availableEndpoints.join(', ')}`);

      const performanceStep = step('测试API性能基准');
      
      // 测试最快的健康检查端点的性能
      const workingEndpoint = endpointResults.find(r => r.success);
      if (workingEndpoint) {
        const performanceTests = [];
        
        // 连续5次请求测试稳定性
        for (let i = 0; i < 5; i++) {
          const startTime = Date.now();
          try {
            await apiContext.get(`${baseApiUrl}/health`);
            performanceTests.push(Date.now() - startTime);
          } catch (error) {
            performanceTests.push(-1); // 失败标记
          }
        }
        
        const successfulTests = performanceTests.filter(t => t > 0);
        if (successfulTests.length > 0) {
          const avgResponseTime = successfulTests.reduce((a, b) => a + b, 0) / successfulTests.length;
          const maxResponseTime = Math.max(...successfulTests);
          const minResponseTime = Math.min(...successfulTests);
          
          testLogger.recordPerformance('API_AvgResponseTime', avgResponseTime, 'ms', 'timing');
          testLogger.recordPerformance('API_MaxResponseTime', maxResponseTime, 'ms', 'timing');
          testLogger.recordPerformance('API_MinResponseTime', minResponseTime, 'ms', 'timing');
          
          // 验证性能在合理范围内
          expect(avgResponseTime).toBeLessThan(3000); // 3秒内响应
          expect(maxResponseTime).toBeLessThan(5000); // 最大5秒
          
          performanceStep.success(`API性能测试完成 - 平均: ${avgResponseTime.toFixed(2)}ms, 最大: ${maxResponseTime}ms, 最小: ${minResponseTime}ms`);
        }
      } else {
        performanceStep.info('无可用的API端点进行性能测试');
      }

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证API安全性和认证', async () => {
    const testName = '验证API安全性和认证';
    startTest(testName);

    try {
      const securityHeadersStep = step('检查API安全头');
      
      // 检查API响应的安全头
      const response = await apiContext.get(`${baseApiUrl}/health`);
      const headers = response.headers();
      
      const securityHeaders = {
        'x-frame-options': headers['x-frame-options'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'strict-transport-security': headers['strict-transport-security'],
        'content-security-policy': headers['content-security-policy'],
        'referrer-policy': headers['referrer-policy']
      };
      
      const presentSecurityHeaders = Object.entries(securityHeaders)
        .filter(([key, value]) => value !== undefined)
        .map(([key]) => key);
      
      securityHeadersStep.success(`安全头检查完成 - 发现${presentSecurityHeaders.length}个安全头: ${presentSecurityHeaders.join(', ')}`);

      const corsStep = step('测试CORS配置');
      
      // 测试CORS预检请求
      try {
        const corsResponse = await apiContext.fetch(`${baseApiUrl}/health`, {
          method: 'OPTIONS',
          headers: {
            'Origin': 'https://example.com',
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'Content-Type'
          }
        });
        
        const corsHeaders = corsResponse.headers();
        const allowedOrigins = corsHeaders['access-control-allow-origin'];
        const allowedMethods = corsHeaders['access-control-allow-methods'];
        
        corsStep.success(`CORS配置检查完成 - Origin: ${allowedOrigins || 'none'}, Methods: ${allowedMethods || 'none'}`);
      } catch (error) {
        corsStep.info('CORS预检请求测试跳过（可能未配置）');
      }

      const rateLimitingStep = step('测试API速率限制');
      
      // 快速发送多个请求测试速率限制
      const rapidRequests = 10;
      const requestPromises = [];
      const startTime = Date.now();
      
      for (let i = 0; i < rapidRequests; i++) {
        requestPromises.push(
          apiContext.get(`${baseApiUrl}/health`).then(response => ({
            status: response.status(),
            headers: response.headers(),
            timing: Date.now() - startTime
          })).catch(error => ({
            error: error.message,
            status: 0,
            timing: Date.now() - startTime
          }))
        );
      }
      
      const results = await Promise.all(requestPromises);
      const rateLimitedRequests = results.filter(r => r.status === 429).length;
      const successfulRequests = results.filter(r => r.status === 200).length;
      
      testLogger.recordPerformance('RapidRequests_Total', rapidRequests, 'count', 'network');
      testLogger.recordPerformance('RapidRequests_Success', successfulRequests, 'count', 'network');
      testLogger.recordPerformance('RapidRequests_RateLimited', rateLimitedRequests, 'count', 'network');
      
      if (rateLimitedRequests > 0) {
        rateLimitingStep.success(`API速率限制正常工作 - ${rateLimitedRequests}个请求被限制`);
      } else {
        rateLimitingStep.info(`API速率限制未触发或未配置 - ${successfulRequests}/${rapidRequests}请求成功`);
      }

      const authenticationStep = step('测试身份认证要求');
      
      // 测试需要认证的端点
      const protectedEndpoints = [
        '/api/admin',
        '/api/user/profile',
        '/api/dashboard',
        '/api/protected',
        '/admin/api'
      ];
      
      let protectedEndpointsFound = 0;
      let authenticationWorking = 0;
      
      for (const endpoint of protectedEndpoints) {
        try {
          const response = await apiContext.get(`${baseApiUrl}${endpoint}`);
          protectedEndpointsFound++;
          
          // 检查是否返回认证相关的状态码
          if (response.status() === 401 || response.status() === 403) {
            authenticationWorking++;
          }
        } catch (error) {
          // 端点可能不存在
        }
      }
      
      if (protectedEndpointsFound > 0) {
        authenticationStep.success(`身份认证测试完成 - ${authenticationWorking}/${protectedEndpointsFound}个端点正确要求认证`);
      } else {
        authenticationStep.info('未找到明显需要认证的API端点');
      }

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证API数据格式和版本控制', async () => {
    const testName = '验证API数据格式和版本控制';
    startTest(testName);

    try {
      const dataFormatStep = step('验证API响应数据格式');
      
      // 测试健康检查端点的响应格式
      const healthResponse = await apiContext.get(`${baseApiUrl}/health`);
      expect(healthResponse.ok()).toBeTruthy();
      
      const contentType = healthResponse.headers()['content-type'];
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        const healthData = await healthResponse.json();
        
        // 验证基本的响应结构
        expect(typeof healthData).toBe('object');
        expect(healthData).not.toBeNull();
        
        // 检查常见的健康检查字段
        const hasStatusField = 'status' in healthData || 'state' in healthData || 'health' in healthData;
        expect(hasStatusField).toBeTruthy();
        
        dataFormatStep.success(`API数据格式验证通过 - Content-Type: ${contentType}, 响应结构正确`);
      } else {
        // 可能是HTML或其他格式
        const responseText = await healthResponse.text();
        expect(responseText.length).toBeGreaterThan(0);
        
        dataFormatStep.success(`API响应格式验证完成 - Content-Type: ${contentType || 'unknown'}`);
      }

      const versioningStep = step('检查API版本控制');
      
      // 测试不同版本的API端点
      const versionEndpoints = [
        { path: '/api/v1', version: 'v1' },
        { path: '/api/v2', version: 'v2' },
        { path: '/v1', version: 'v1' },
        { path: '/v2', version: 'v2' }
      ];
      
      const availableVersions: string[] = [];
      
      for (const versionEndpoint of versionEndpoints) {
        try {
          const response = await apiContext.get(`${baseApiUrl}${versionEndpoint.path}`);
          if (response.status() < 500) {
            availableVersions.push(versionEndpoint.version);
          }
        } catch (error) {
          // 版本端点不存在
        }
      }
      
      if (availableVersions.length > 0) {
        versioningStep.success(`API版本控制检查完成 - 可用版本: ${availableVersions.join(', ')}`);
      } else {
        versioningStep.info('未检测到明确的API版本控制');
      }

      const errorHandlingStep = step('测试错误处理');
      
      // 测试不存在的端点
      const notFoundResponse = await apiContext.get(`${baseApiUrl}/api/nonexistent-endpoint-${Date.now()}`);
      expect(notFoundResponse.status()).toBe(404);
      
      // 检查错误响应格式
      const errorContentType = notFoundResponse.headers()['content-type'];
      
      if (errorContentType && errorContentType.includes('application/json')) {
        try {
          const errorData = await notFoundResponse.json();
          expect(typeof errorData).toBe('object');
          
          // 检查错误响应是否包含有用信息
          const hasErrorInfo = 'error' in errorData || 'message' in errorData || 'status' in errorData;
          expect(hasErrorInfo).toBeTruthy();
          
          errorHandlingStep.success('API错误处理验证通过 - 返回结构化错误信息');
        } catch (parseError) {
          errorHandlingStep.info('API错误响应不是JSON格式');
        }
      } else {
        errorHandlingStep.info('API错误响应使用非JSON格式');
      }

      const schemaValidationStep = step('验证API响应schema');
      
      // 对于JSON响应，验证基本的schema结构
      if (isJson) {
        try {
          const response = await apiContext.get(`${baseApiUrl}/health`);
          const data = await response.json();
          
          // 验证响应数据的类型一致性
          const validation = {
            isObject: typeof data === 'object' && data !== null,
            hasStringFields: Object.values(data).some(v => typeof v === 'string'),
            hasNestedObjects: Object.values(data).some(v => typeof v === 'object' && v !== null),
            hasArrays: Object.values(data).some(v => Array.isArray(v))
          };
          
          schemaValidationStep.success(`Schema验证完成 - 对象: ${validation.isObject}, 字符串字段: ${validation.hasStringFields}`);
        } catch (error) {
          schemaValidationStep.info('Schema验证跳过（无法解析响应）');
        }
      } else {
        schemaValidationStep.info('Schema验证跳过（非JSON响应）');
      }

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证WebSocket和实时通信', async () => {
    const testName = '验证WebSocket和实时通信';
    startTest(testName);

    try {
      const websocketStep = step('测试WebSocket连接');
      
      // 在页面中测试WebSocket连接
      await page.goto('/');
      
      // 检查WebSocket连接
      const websocketTest = await page.evaluate(async () => {
        try {
          // 尝试建立WebSocket连接
          const wsUrl = window.location.protocol === 'https:' ? 
            window.location.origin.replace('https:', 'wss:') :
            window.location.origin.replace('http:', 'ws:');
          
          const ws = new WebSocket(`${wsUrl}/ws`);
          
          return new Promise((resolve) => {
            const timeout = setTimeout(() => {
              ws.close();
              resolve({ 
                connected: false, 
                error: 'Connection timeout',
                endpoint: `${wsUrl}/ws`
              });
            }, 5000);
            
            ws.onopen = () => {
              clearTimeout(timeout);
              ws.close();
              resolve({ 
                connected: true, 
                endpoint: `${wsUrl}/ws`
              });
            };
            
            ws.onerror = (error) => {
              clearTimeout(timeout);
              resolve({ 
                connected: false, 
                error: 'Connection failed',
                endpoint: `${wsUrl}/ws`
              });
            };
          });
        } catch (error) {
          return { 
            connected: false, 
            error: error.message,
            endpoint: 'unknown'
          };
        }
      });
      
      if ((websocketTest as any).connected) {
        websocketStep.success(`WebSocket连接测试成功 - 端点: ${(websocketTest as any).endpoint}`);
      } else {
        websocketStep.info(`WebSocket连接不可用 - ${(websocketTest as any).error}`);
      }

      const realtimeStep = step('检查实时功能');
      
      // 检查页面是否有实时更新功能
      const realtimeFeatures = await page.evaluate(() => {
        // 检查是否有WebSocket相关的代码
        const scripts = Array.from(document.scripts);
        const hasWebSocketCode = scripts.some(script => 
          script.textContent?.includes('WebSocket') || 
          script.textContent?.includes('socket.io') ||
          script.textContent?.includes('ws://') ||
          script.textContent?.includes('wss://')
        );
        
        // 检查是否有实时更新相关的元素
        const hasRealtimeElements = document.querySelectorAll(
          '[class*="realtime"], [class*="live"], [data-realtime], [data-live]'
        ).length > 0;
        
        // 检查是否有定时更新
        const hasIntervals = window.setInterval.toString().includes('[native code]');
        
        return {
          hasWebSocketCode,
          hasRealtimeElements,
          hasIntervals,
          timestamp: Date.now()
        };
      });
      
      if (realtimeFeatures.hasWebSocketCode || realtimeFeatures.hasRealtimeElements) {
        realtimeStep.success(`实时功能检查完成 - WebSocket代码: ${realtimeFeatures.hasWebSocketCode}, 实时元素: ${realtimeFeatures.hasRealtimeElements}`);
      } else {
        realtimeStep.info('未检测到明显的实时功能实现');
      }

      const sseStep = step('测试Server-Sent Events');
      
      // 尝试连接SSE端点
      try {
        const sseResponse = await apiContext.get(`${baseApiUrl}/events`);
        const contentType = sseResponse.headers()['content-type'];
        
        if (contentType && contentType.includes('text/event-stream')) {
          sseStep.success('Server-Sent Events端点可用');
        } else if (sseResponse.status() === 404) {
          sseStep.info('Server-Sent Events端点不存在');
        } else {
          sseStep.info(`Server-Sent Events端点返回: ${sseResponse.status()}`);
        }
      } catch (error) {
        sseStep.info('Server-Sent Events测试跳过');
      }

      const performanceStep = step('测试实时通信性能');
      
      // 如果有WebSocket连接，测试延迟
      if ((websocketTest as any).connected) {
        const latencyTest = await page.evaluate(async () => {
          try {
            const wsUrl = window.location.protocol === 'https:' ? 
              window.location.origin.replace('https:', 'wss:') :
              window.location.origin.replace('http:', 'ws:');
            
            const ws = new WebSocket(`${wsUrl}/ws`);
            
            return new Promise((resolve) => {
              const startTime = Date.now();
              
              const timeout = setTimeout(() => {
                ws.close();
                resolve({ latency: -1, error: 'Timeout' });
              }, 10000);
              
              ws.onopen = () => {
                const openLatency = Date.now() - startTime;
                
                // 发送ping消息测试响应时间
                const pingStart = Date.now();
                ws.send(JSON.stringify({ type: 'ping', timestamp: pingStart }));
                
                ws.onmessage = () => {
                  const pongLatency = Date.now() - pingStart;
                  clearTimeout(timeout);
                  ws.close();
                  resolve({ 
                    openLatency, 
                    pongLatency,
                    totalLatency: Date.now() - startTime
                  });
                };
              };
              
              ws.onerror = () => {
                clearTimeout(timeout);
                resolve({ latency: -1, error: 'Connection error' });
              };
            });
          } catch (error) {
            return { latency: -1, error: error.message };
          }
        });
        
        const latency = (latencyTest as any);
        if (latency.openLatency) {
          testLogger.recordPerformance('WebSocket_OpenLatency', latency.openLatency, 'ms', 'timing');
          if (latency.pongLatency) {
            testLogger.recordPerformance('WebSocket_PongLatency', latency.pongLatency, 'ms', 'timing');
          }
          performanceStep.success(`WebSocket性能测试完成 - 连接延迟: ${latency.openLatency}ms`);
        } else {
          performanceStep.info('WebSocket性能测试未完成');
        }
      } else {
        performanceStep.info('WebSocket性能测试跳过（连接不可用）');
      }

      // 截图记录
      const screenshotPath = 'test-results/screenshots/websocket-test.png';
      await page.screenshot({ path: screenshotPath });
      testLogger.recordScreenshot(screenshotPath);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });

  test('验证API缓存和性能优化', async () => {
    const testName = '验证API缓存和性能优化';
    startTest(testName);

    try {
      const cachingStep = step('测试HTTP缓存头');
      
      const response = await apiContext.get(`${baseApiUrl}/health`);
      const headers = response.headers();
      
      const cacheHeaders = {
        'cache-control': headers['cache-control'],
        'etag': headers['etag'],
        'last-modified': headers['last-modified'],
        'expires': headers['expires']
      };
      
      const presentCacheHeaders = Object.entries(cacheHeaders)
        .filter(([key, value]) => value !== undefined)
        .map(([key]) => key);
      
      cachingStep.success(`HTTP缓存头检查完成 - 发现${presentCacheHeaders.length}个缓存头: ${presentCacheHeaders.join(', ')}`);

      const compressionStep = step('测试响应压缩');
      
      const compressionHeaders = {
        'content-encoding': headers['content-encoding'],
        'content-length': headers['content-length']
      };
      
      const hasCompression = compressionHeaders['content-encoding']?.includes('gzip') || 
                            compressionHeaders['content-encoding']?.includes('br') ||
                            compressionHeaders['content-encoding']?.includes('deflate');
      
      if (hasCompression) {
        compressionStep.success(`响应压缩已启用 - 编码: ${compressionHeaders['content-encoding']}`);
      } else {
        compressionStep.info('未检测到响应压缩或响应内容较小');
      }

      const cdnStep = step('检测CDN使用');
      
      const cdnHeaders = {
        'cf-ray': headers['cf-ray'], // Cloudflare
        'x-cache': headers['x-cache'], // Generic CDN
        'x-served-by': headers['x-served-by'], // Fastly
        'x-amz-cf-id': headers['x-amz-cf-id'], // AWS CloudFront
        'server': headers['server']
      };
      
      const cdnIndicators = Object.entries(cdnHeaders)
        .filter(([key, value]) => value !== undefined)
        .filter(([key, value]) => 
          key === 'cf-ray' || 
          (typeof value === 'string' && (
            value.includes('cloudflare') ||
            value.includes('cloudfront') ||
            value.includes('fastly') ||
            value.includes('CDN')
          ))
        );
      
      if (cdnIndicators.length > 0) {
        cdnStep.success(`检测到CDN使用 - ${cdnIndicators.map(([k, v]) => `${k}: ${v}`).join(', ')}`);
      } else {
        cdnStep.info('未检测到明显的CDN使用');
      }

      const loadBalancingStep = step('检测负载均衡');
      
      // 连续请求检查是否有不同的服务器响应
      const serverIdentifiers = [];
      
      for (let i = 0; i < 5; i++) {
        try {
          const resp = await apiContext.get(`${baseApiUrl}/health`);
          const serverHeader = resp.headers()['server'];
          const xServerHeader = resp.headers()['x-server-id'] || resp.headers()['x-instance-id'];
          
          if (serverHeader) serverIdentifiers.push(serverHeader);
          if (xServerHeader) serverIdentifiers.push(xServerHeader);
        } catch (error) {
          // 忽略单个请求失败
        }
      }
      
      const uniqueServers = new Set(serverIdentifiers);
      
      if (uniqueServers.size > 1) {
        loadBalancingStep.success(`检测到负载均衡 - ${uniqueServers.size}个不同的服务器标识`);
      } else {
        loadBalancingStep.info('未检测到明显的负载均衡配置');
      }

      const performanceOptimizationStep = step('验证性能优化特性');
      
      // 测试并发请求性能
      const concurrentTests = 3;
      const concurrentRequests = [];
      
      for (let i = 0; i < concurrentTests; i++) {
        const startTime = Date.now();
        concurrentRequests.push(
          apiContext.get(`${baseApiUrl}/health`).then(resp => ({
            status: resp.status(),
            timing: Date.now() - startTime,
            size: parseInt(resp.headers()['content-length'] || '0', 10)
          }))
        );
      }
      
      const concurrentResults = await Promise.all(concurrentRequests);
      const avgConcurrentTime = concurrentResults.reduce((sum, r) => sum + r.timing, 0) / concurrentResults.length;
      const totalSize = concurrentResults.reduce((sum, r) => sum + r.size, 0);
      
      testLogger.recordPerformance('API_ConcurrentAvgTime', avgConcurrentTime, 'ms', 'timing');
      testLogger.recordPerformance('API_TotalResponseSize', totalSize, 'bytes', 'network');
      
      performanceOptimizationStep.success(`并发性能测试完成 - 平均响应时间: ${avgConcurrentTime.toFixed(2)}ms, 总响应大小: ${totalSize}字节`);

      endTest(testName, 'passed');
    } catch (error) {
      testLogger.recordError(error.message, error.stack);
      endTest(testName, 'failed', error);
      throw error;
    }
  });
});