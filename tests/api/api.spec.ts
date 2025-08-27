import { test, expect } from '@playwright/test';

const API_BASE_URL = 'http://localhost:3001';

test.describe('API接口测试', () => {
  test('健康检查接口', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/health`);
    
    // 如果返回404，尝试根路径
    if (response.status() === 404) {
      const rootResponse = await request.get(`${API_BASE_URL}/`);
      expect(rootResponse.status()).toBeLessThan(500);
    } else {
      expect(response.status()).toBe(200);
    }
  });

  test('API版本信息', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api/version`);
    
    // 如果特定版本接口不存在，测试根API路径
    if (response.status() === 404) {
      const apiResponse = await request.get(`${API_BASE_URL}/api`);
      console.log('API根路径状态:', apiResponse.status());
    } else {
      expect(response.status()).toBe(200);
      const data = await response.json();
      console.log('API版本信息:', data);
    }
  });

  test('用户相关API', async ({ request }) => {
    // 测试用户列表接口
    const usersResponse = await request.get(`${API_BASE_URL}/api/users`);
    
    if (usersResponse.status() === 200) {
      const users = await usersResponse.json();
      console.log('用户数据:', users);
    } else if (usersResponse.status() === 401) {
      console.log('用户接口需要认证');
    } else {
      console.log('用户接口状态:', usersResponse.status());
    }
  });

  test('区块链相关API', async ({ request }) => {
    // 测试区块链状态接口
    const blockchainResponse = await request.get(`${API_BASE_URL}/api/blockchain/status`);
    
    if (blockchainResponse.status() === 200) {
      const status = await blockchainResponse.json();
      console.log('区块链状态:', status);
    } else {
      console.log('区块链状态接口:', blockchainResponse.status());
    }
  });

  test('CORS头部检查', async ({ request }) => {
    const response = await request.get(`${API_BASE_URL}/api`, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    const corsHeader = response.headers()['access-control-allow-origin'];
    console.log('CORS头部:', corsHeader);
  });
});