'use client'

import React from 'react'
import { EnhancedProductPurchase } from '@/components/products/EnhancedProductPurchase'
import { ProductType } from '@/lib/contracts/addresses'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Toaster } from 'sonner'

export default function TestEnhancedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            增强版ETH支付系统测试
          </h1>
          <p className="text-gray-600">
            测试完整的ETH支付流程和用户体验
          </p>
          <Badge variant="secondary" className="mt-2">
            测试环境
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Silver Card 测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🥈 Silver Card 测试
              </CardTitle>
              <p className="text-sm text-gray-600">
                最小投资: 100 USDT | APR: 12% | 期限: 30天
              </p>
            </CardHeader>
            <CardContent>
              <EnhancedProductPurchase
                productType={ProductType.SILVER}
                onSuccess={(txHash, tokenId) => {
                  console.log('Silver Card 投资成功:', { txHash, tokenId })
                }}
                onError={(error) => {
                  console.error('Silver Card 投资失败:', error)
                }}
              />
            </CardContent>
          </Card>

          {/* Gold Card 测试 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                🥇 Gold Card 测试
              </CardTitle>
              <p className="text-sm text-gray-600">
                最小投资: 1,000 USDT | APR: 15% | 期限: 60天
              </p>
            </CardHeader>
            <CardContent>
              <EnhancedProductPurchase
                productType={ProductType.GOLD}
                onSuccess={(txHash, tokenId) => {
                  console.log('Gold Card 投资成功:', { txHash, tokenId })
                }}
                onError={(error) => {
                  console.error('Gold Card 投资失败:', error)
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* 系统状态信息 */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">💡 测试说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-1">ETH支付功能特性</h4>
                <ul className="list-disc list-inside text-blue-700 space-y-1">
                  <li>自动ETH到USDT汇率转换 (1 ETH = 2000 USDT)</li>
                  <li>实时余额检查和Gas费估算</li>
                  <li>完整的交易状态跟踪</li>
                  <li>错误处理和边界情况管理</li>
                </ul>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">钱包连接管理</h4>
                <ul className="list-disc list-inside text-green-700 space-y-1">
                  <li>多钱包支持 (MetaMask, WalletConnect等)</li>
                  <li>网络自动检测和切换提示</li>
                  <li>合约部署状态实时监控</li>
                  <li>连接状态可视化指示</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-1">用户体验优化</h4>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  <li>分步骤支付流程引导</li>
                  <li>实时收益计算预览</li>
                  <li>支付进度可视化指示器</li>
                  <li>友好的错误提示和重试机制</li>
                </ul>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-1">测试步骤建议</h4>
                <ol className="list-decimal list-inside text-gray-700 space-y-1">
                  <li>首先连接钱包并确保网络正确</li>
                  <li>检查合约部署状态 (如显示未部署是正常的)</li>
                  <li>选择支付方式 (USDT 或 ETH)</li>
                  <li>输入投资金额并查看收益预览</li>
                  <li>模拟支付流程 (如果合约已部署)</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toast 通知 */}
      <Toaster position="top-right" richColors />
    </div>
  )
}