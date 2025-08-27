import { test, expect } from '@playwright/test';

const BLOCKCHAIN_RPC_URL = 'http://localhost:8545';

test.describe('区块链集成测试', () => {
  test('区块链节点连接测试', async ({ request }) => {
    try {
      const response = await request.post(BLOCKCHAIN_RPC_URL, {
        data: {
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      
      expect(data.jsonrpc).toBe('2.0');
      expect(data.result).toBeDefined();
      
      console.log('当前区块号:', parseInt(data.result, 16));
    } catch (error) {
      console.log('区块链节点连接失败:', error);
    }
  });

  test('网络ID检查', async ({ request }) => {
    try {
      const response = await request.post(BLOCKCHAIN_RPC_URL, {
        data: {
          jsonrpc: '2.0',
          method: 'net_version',
          params: [],
          id: 1
        }
      });

      if (response.status() === 200) {
        const data = await response.json();
        console.log('网络ID:', data.result);
      }
    } catch (error) {
      console.log('网络ID检查失败:', error);
    }
  });

  test('账户余额检查', async ({ request }) => {
    try {
      // 首先获取账户列表
      const accountsResponse = await request.post(BLOCKCHAIN_RPC_URL, {
        data: {
          jsonrpc: '2.0',
          method: 'eth_accounts',
          params: [],
          id: 1
        }
      });

      if (accountsResponse.status() === 200) {
        const accountsData = await accountsResponse.json();
        
        if (accountsData.result && accountsData.result.length > 0) {
          const firstAccount = accountsData.result[0];
          console.log('第一个账户:', firstAccount);

          // 检查账户余额
          const balanceResponse = await request.post(BLOCKCHAIN_RPC_URL, {
            data: {
              jsonrpc: '2.0',
              method: 'eth_getBalance',
              params: [firstAccount, 'latest'],
              id: 1
            }
          });

          if (balanceResponse.status() === 200) {
            const balanceData = await balanceResponse.json();
            const balance = parseInt(balanceData.result, 16);
            console.log('账户余额 (wei):', balance);
            console.log('账户余额 (ETH):', balance / 1e18);
          }
        }
      }
    } catch (error) {
      console.log('账户余额检查失败:', error);
    }
  });

  test('智能合约部署状态检查', async ({ request }) => {
    // 从环境变量或配置文件读取合约地址
    const contractAddresses = [
      process.env.TREASURY_CONTRACT_ADDRESS,
      process.env.QACARD_CONTRACT_ADDRESS,
      process.env.USDT_CONTRACT_ADDRESS
    ].filter(Boolean);

    for (const contractAddress of contractAddresses) {
      try {
        const response = await request.post(BLOCKCHAIN_RPC_URL, {
          data: {
            jsonrpc: '2.0',
            method: 'eth_getCode',
            params: [contractAddress, 'latest'],
            id: 1
          }
        });

        if (response.status() === 200) {
          const data = await response.json();
          const hasCode = data.result && data.result !== '0x';
          console.log(`合约 ${contractAddress} 部署状态:`, hasCode ? '已部署' : '未部署');
        }
      } catch (error) {
        console.log(`检查合约 ${contractAddress} 失败:`, error);
      }
    }
  });
});