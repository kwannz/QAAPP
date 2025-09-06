// Finance服务映射接口和工具函数

// 数据库到DTO映射工具函数
export class FinanceMappingUtils {
  /**
   * 将数据库的null值转换为undefined
   */
  static nullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  /**
   * 映射数据库Position到MockPosition
   */
  static mapDatabasePositionToMock(position: any): any {
    return {
      ...position,
      nextPayoutAt: this.nullToUndefined(position.nextPayoutAt),
      nftTokenId: this.nullToUndefined(position.nftTokenId),
      metadata: this.nullToUndefined(position.metadata),
    };
  }

  /**
   * 映射数据库Payout到MockPayout
   */
  static mapDatabasePayoutToMock(payout: any): any {
    return {
      ...payout,
      claimedAt: this.nullToUndefined(payout.claimedAt),
      txHash: this.nullToUndefined(payout.txHash),
    };
  }
}

// Mock类型定义
export interface MockPosition {
  id: string;
  userId: string;
  productId: string;
  orderId: string;
  principal: number;
  startDate: Date;
  endDate: Date;
  nextPayoutAt?: Date;
  nftTokenId?: number;
  nftTokenUri?: string;
  status: 'ACTIVE' | 'REDEEMING' | 'CLOSED' | 'DEFAULTED';
  totalPaid: number;
  lastPayoutAt?: Date;
  maturityAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

export interface MockPayout {
  id: string;
  userId: string;
  positionId: string;
  amount: number;
  periodStart: Date;
  periodEnd: Date;
  status: string;
  isClaimable: boolean;
  claimedAt?: Date;
  txHash?: string;
  createdAt: Date;
  updatedAt: Date;
}