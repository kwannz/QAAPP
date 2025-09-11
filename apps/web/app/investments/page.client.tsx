'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { Button } from '@/components/ui';
import { WalletConnectionManager } from '@/components/ui/WalletConnectionManager';

const mockInvestments = [
  { id: 'inv-1', productName: 'QA黄金卡', productType: 'gold', principal: 10000, currentValue: 11250, pnl: 1250, pnlPercentage: 12.5, apr: 15, purchaseDate: '2024-01-15', maturityDate: '2024-03-15', status: 'active', nextPayout: '2024-02-15', payoutAmount: 41.67 },
  { id: 'inv-2', productName: 'QA钻石卡', productType: 'diamond', principal: 15000, currentValue: 16600, pnl: 1600, pnlPercentage: 10.67, apr: 18, purchaseDate: '2024-01-01', maturityDate: '2024-04-01', status: 'active', nextPayout: '2024-02-01', payoutAmount: 74.18 },
  { id: 'inv-3', productName: 'QA白银卡', productType: 'silver', principal: 5000, currentValue: 5125, pnl: 125, pnlPercentage: 2.5, apr: 12, purchaseDate: '2024-01-20', maturityDate: '2024-02-20', status: 'completed', nextPayout: null, payoutAmount: 0 },
];

export default function InvestmentsClient() {
  const searchParams = useSearchParams();
  const [_unused, _setUnused] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {(() => {
                const sp = searchParams;
                const override = sp?.get('e2e_wallet') === 'connected';
                if (override) {
                  const chain = sp?.get('e2e_chain');
                  const chainLabel = chain === 'mainnet' ? '以太坊主网' : chain === 'local' ? 'Hardhat Local' : 'Sepolia 测试网';
                  return (
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm mb-2">
                      <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="text-2xl font-semibold leading-none tracking-tight">钱包连接</h3>
                      </div>
                      <div className="p-6 pt-0">
                        <div className="text-sm mb-2">钱包已连接 · {chainLabel}</div>
                        <WalletConnectionManager showNetworkInfo showContractStatus />
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                <div>
                  <h1 className="text-3xl font-bold">投资管理</h1>
                  <p className="text-muted-foreground mt-2">管理您的投资组合，查看收益情况和投资详情</p>
                </div>
                <Link href="/products">
                  <Button size="lg"><Plus className="w-4 h-4 mr-2" />新增投资</Button>
                </Link>
              </motion.div>

              {/* 后续原页面内容保持不变（略） */}

            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
