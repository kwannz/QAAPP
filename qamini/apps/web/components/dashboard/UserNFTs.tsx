'use client';

import { motion } from 'framer-motion';
import {
  Wallet,
  Clock,
  TrendingUp,
  Gift,
  ExternalLink,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { formatUnits } from 'viem';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
} from '@/components/ui';

import { apiClient } from '../../lib/api-client';
import type { ProductType } from '../../lib/contracts/addresses';
import { PRODUCT_CONFIG } from '../../lib/contracts/addresses';
import { useQACard } from '../../lib/hooks/use-contracts';
import { useSafeWalletStatus } from '../../lib/hooks/useSafeWalletConnection';

interface NFTCardProperties {
  tokenId: bigint
  onClaim?: () => void
}

interface PositionCardProperties {
  position: any
  onClaim?: () => void
}

function NFTCard({ tokenId, onClaim }: NFTCardProperties) {
  const qaCard = useQACard();
  const { data: cardInfo } = qaCard.getCardInfo(tokenId);
  const { data: pendingReward } = qaCard.getPendingReward(tokenId);

  if (!cardInfo) return null;

  const productConfig = PRODUCT_CONFIG[cardInfo.productType as ProductType];
  const principal = Number.parseFloat(formatUnits(cardInfo.principal, 6));
  const reward = pendingReward ? Number.parseFloat(formatUnits(pendingReward, 6)) : 0;

  // 计算投资进度
  const startTime = Number(cardInfo.startTime) * 1000;
  const duration = Number(cardInfo.duration) * 24 * 60 * 60 * 1000;
  const endTime = startTime + duration;
  const now = Date.now();
  const progress = Math.min((now - startTime) / duration * 100, 100);
  const daysLeft = Math.max(Math.ceil((endTime - now) / (24 * 60 * 60 * 1000)), 0);

  const handleClaim = async () => {
    try {
      toast.loading('请在钱包中确认领取交易...');
      await qaCard.claimReward(tokenId);

      if (qaCard.isConfirming) {
        toast.loading('等待交易确认...');
      }

      if (qaCard.isSuccess) {
        toast.success('收益领取成功！');
        onClaim?.();
      }
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(error?.message?.includes('User rejected') ? '交易已被用户取消' : '领取失败，请重试');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* 渐变背景 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${productConfig.color} opacity-5`} />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{productConfig.icon}</span>
              <div>
                <CardTitle className="text-lg">{productConfig.name}</CardTitle>
                <Badge variant={cardInfo.isActive ? 'default' : 'secondary'}>
                  {cardInfo.isActive ? '活跃' : '已结束'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">NFT #{tokenId.toString()}</p>
              <p className="font-semibold text-green-600">{productConfig.apr}% APR</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* 投资信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                投资本金
              </p>
              <p className="font-semibold">{principal.toLocaleString()} USDT</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Gift className="w-3 h-3" />
                待领收益
              </p>
              <p className="font-semibold text-green-600">
                {reward > 0 ? `+${reward.toFixed(4)} USDT` : '0 USDT'}
              </p>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                投资进度
              </span>
              <span className="font-medium">
                {cardInfo.isActive ? `${daysLeft}天后到期` : '已到期'}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${productConfig.color} transition-all duration-300`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{new Date(startTime).toLocaleDateString()}</span>
              <span>{new Date(endTime).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleClaim}
              disabled={reward <= 0 || !cardInfo.isActive || qaCard.isPending}
              className="flex-1"
              size="sm"
            >
              {qaCard.isPending
? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              )
: (
                <Gift className="w-3 h-3 mr-1" />
              )}
              领取收益
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://opensea.io/assets/ethereum/${qaCard}/${tokenId}`, '_blank')}
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>

          {/* 状态提示 */}
          {!cardInfo.isActive && (
            <Alert>
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                此投资已到期，请及时领取最终收益
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function PositionCard({ position, onClaim }: PositionCardProperties) {
  const qaCard = useQACard();
  const [isClaimingReward, setIsClaimingReward] = useState(false);

  // 使用API数据，如果没有cardInfo则使用position数据
  const productType = position.product?.type || position.productType;
  const productConfig = PRODUCT_CONFIG[productType as ProductType] || {
    name: position.product?.name || '未知产品',
    icon: '📊',
    color: 'from-gray-400 to-gray-600',
    apr: position.product?.apr || 0,
    duration: position.product?.duration || 0,
  };

  const principal = Number.parseFloat(position.principal || '0');
  const currentValue = Number.parseFloat(position.currentValue || position.principal || '0');
  const pendingReward = Number.parseFloat(position.pendingReward || '0');

  // 计算投资进度
  const startTime = new Date(position.startDate || position.createdAt).getTime();
  const endTime = new Date(position.endDate).getTime();
  const now = Date.now();
  const progress = Math.min((now - startTime) / (endTime - startTime) * 100, 100);
  const daysLeft = Math.max(Math.ceil((endTime - now) / (24 * 60 * 60 * 1000)), 0);

  const handleClaim = async () => {
    if (!position.tokenId || pendingReward <= 0) return;

    setIsClaimingReward(true);
    try {
      toast.loading('请在钱包中确认领取交易...');
      await qaCard.claimReward(BigInt(position.tokenId));

      if (qaCard.isConfirming) {
        toast.loading('等待交易确认...');
      }

      if (qaCard.isSuccess) {
        toast.success('收益领取成功！');
        onClaim?.();

        // 刷新持仓数据
        window.location.reload(); // 简单的刷新，实际应该只刷新组件数据
      }
    } catch (error: any) {
      console.error('Claim failed:', error);
      toast.error(error?.message?.includes('User rejected') ? '交易已被用户取消' : '领取失败，请重试');
    } finally {
      setIsClaimingReward(false);
    }
  };

  const isActive = position.status === 'ACTIVE';
  const isMatured = progress >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* 渐变背景 */}
        <div className={`absolute inset-0 bg-gradient-to-br ${productConfig.color} opacity-5`} />

        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{productConfig.icon}</span>
              <div>
                <CardTitle className="text-lg">{productConfig.name}</CardTitle>
                <Badge variant={isActive ? 'default' : 'secondary'}>
                  {isActive ? (isMatured ? '已到期' : '活跃') : '已结束'}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              {position.tokenId && (
                <p className="text-sm text-muted-foreground">NFT #{position.tokenId}</p>
              )}
              <p className="font-semibold text-green-600">{productConfig.apr}% APR</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* 投资信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Wallet className="w-3 h-3" />
                投资本金
              </p>
              <p className="font-semibold">{principal.toLocaleString()} USDT</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                当前价值
              </p>
              <p className="font-semibold text-green-600">{currentValue.toLocaleString()} USDT</p>
            </div>
          </div>

          {/* 待领收益 */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Gift className="w-3 h-3" />
                待领收益
              </span>
              <span className="font-semibold text-green-600">
                {pendingReward > 0 ? `+${pendingReward.toFixed(4)} USDT` : '0 USDT'}
              </span>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                投资进度
              </span>
              <span className="font-medium">
                {isActive ? (daysLeft > 0 ? `${daysLeft}天后到期` : '已到期') : '已完成'}
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${productConfig.color} transition-all duration-300`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{new Date(startTime).toLocaleDateString()}</span>
              <span>{new Date(endTime).toLocaleDateString()}</span>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleClaim}
              disabled={pendingReward <= 0 || !isActive || isClaimingReward}
              className="flex-1"
              size="sm"
            >
              {isClaimingReward
? (
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              )
: (
                <Gift className="w-3 h-3 mr-1" />
              )}
              领取收益
            </Button>

            {position.tokenId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://opensea.io/assets/ethereum/${position.tokenId}`, '_blank')}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* 状态提示 */}
          {isMatured && isActive && (
            <Alert>
              <AlertCircle className="h-3 w-3" />
              <AlertDescription className="text-xs">
                投资已到期，请及时领取收益
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function UserNFTs() {
  const { address, isConnected } = useSafeWalletStatus();
  const qaCard = useQACard();
  const [userPositions, setUserPositions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 获取用户持有的所有投资持仓
  useEffect(() => {
    const fetchUserPositions = async () => {
      if (!address || !isConnected) return;

      setIsLoading(true);
      try {
        // 通过后端API获取用户的持仓数据
        const response = await apiClient.get('/positions/my-positions');
        const positions = response.data || [];

        // 如果有持仓，获取对应的NFT信息
        const positionsWithNFTData = await Promise.all(
          positions.map(async (position: any) => {
            if (position.tokenId) {
              try {
                // 从智能合约获取NFT的实时数据
                const { data: cardInfo } = qaCard.getCardInfo(BigInt(position.tokenId));
                const { data: pendingReward } = qaCard.getPendingReward(BigInt(position.tokenId));

                return {
                  ...position,
                  cardInfo,
                  pendingReward: pendingReward || '0',
                };
              } catch (error) {
                console.warn(`Failed to fetch NFT data for token ${position.tokenId}:`, error);
                return position;
              }
            }
            return position;
          }),
        );

        setUserPositions(positionsWithNFTData);
      } catch (error) {
        console.error('Failed to fetch user positions:', error);

        // 如果API失败，尝试直接从区块链获取
        try {
          const balance = Number(qaCard.balance || 0);
          if (balance > 0) {
            // 这里需要实现获取用户NFT tokenIds的逻辑
            // 由于合约没有提供tokensOfOwner方法，我们需要通过事件日志获取
            toast.error('暂时无法获取NFT数据，请联系技术支持');
          }
        } catch (contractError) {
          console.error('Contract query failed:', contractError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPositions();
  }, [address, isConnected, qaCard.balance]);

  const handleClaimSuccess = () => {
    // 刷新数据
    toast.success('收益领取成功！');
  };

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">请先连接钱包查看您的投资凭证</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>我的投资凭证</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (userPositions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>我的投资凭证</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">您还没有任何投资持仓</p>
          <p className="text-sm text-muted-foreground">
            购买投资产品后，您将获得相应的NFT作为投资凭证
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>我的投资凭证</CardTitle>
          <Badge variant="outline">
            {userPositions.length} 个持仓
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userPositions.map((position) => (
            <PositionCard
              key={position.id}
              position={position}
              onClaim={handleClaimSuccess}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
