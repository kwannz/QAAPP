/**
 * 功能开关系统 - 支持渐进式功能发布和A/B测试
 */

import React from 'react';
import { logger } from './verbose-logger';

type FeatureFlag =
  | 'newOperationsCenter'      // 新运营中心
  | 'newAnalyticsCenter'       // 新分析中心
  | 'unifiedDashboard'         // 统一仪表板
  | 'newMonitoringAPI'         // 新监控API
  | 'newFinanceAPI'            // 新金融API
  | 'entityManager'            // 实体管理器
  | 'dataTable'               // 通用数据表格
  | 'formBuilder'             // 表单构建器
  | 'mockServiceV2'           // 新Mock服务
  | 'performanceOptimization' // 性能优化

interface FeatureFlagConfig {
  enabled: boolean
  rolloutPercentage: number
  description: string
  environments: ('development' | 'staging' | 'production')[]
  dependencies?: FeatureFlag[]
  deprecates?: string[]
}

// 功能开关配置
const FEATURE_FLAGS: Record<FeatureFlag, FeatureFlagConfig> = {
  newOperationsCenter: {
    enabled: true,
    rolloutPercentage: 100,
    description: '新运营中心 - 整合用户、产品、订单、代理、提现管理',
    environments: ['development', 'staging'],
    dependencies: ['entityManager', 'dataTable'],
    deprecates: ['/admin/users', '/admin/products', '/admin/orders', '/admin/agents', '/admin/withdrawals'],
  },

  newAnalyticsCenter: {
    enabled: true,
    rolloutPercentage: 100,
    description: '新分析中心 - 整合佣金、报表、通知管理',
    environments: ['development', 'staging'],
    dependencies: ['dataTable', 'formBuilder'],
    deprecates: ['/admin/commissions', '/admin/reports', '/admin/notifications'],
  },

  unifiedDashboard: {
    enabled: true,
    rolloutPercentage: 100,
    description: '统一用户仪表板 - 集成个人资料、钱包、通知',
    environments: ['development', 'staging'],
    dependencies: ['formBuilder'],
    deprecates: ['/dashboard/profile', '/dashboard/wallets', '/dashboard/notifications'],
  },

  newMonitoringAPI: {
    enabled: true,
    rolloutPercentage: 100,
    description: '新监控API模块 - 整合日志、审计、告警、性能',
    environments: ['development', 'staging'],
    deprecates: ['/api/logs', '/api/audit', '/api/alerts', '/api/performance'],
  },

  newFinanceAPI: {
    enabled: true,
    rolloutPercentage: 100,
    description: '新金融API模块 - 整合订单、头寸、交易、佣金',
    environments: ['development', 'staging'],
    deprecates: ['/api/payouts', '/api/withdrawals'],
  },

  entityManager: {
    enabled: true, // 基础组件默认启用
    rolloutPercentage: 100,
    description: '通用实体管理器组件',
    environments: ['development', 'staging', 'production'],
  },

  dataTable: {
    enabled: true, // 基础组件默认启用
    rolloutPercentage: 100,
    description: '通用数据表格组件',
    environments: ['development', 'staging', 'production'],
  },

  formBuilder: {
    enabled: true, // 基础组件默认启用
    rolloutPercentage: 100,
    description: '动态表单构建器组件',
    environments: ['development', 'staging', 'production'],
  },

  mockServiceV2: {
    enabled: false,
    rolloutPercentage: 0,
    description: '集中Mock数据管理服务',
    environments: ['development'],
  },

  performanceOptimization: {
    enabled: true,
    rolloutPercentage: 100,
    description: '性能优化 - 代码分割、懒加载、图片优化',
    environments: ['development', 'staging', 'production'],
  },
};

class FeatureFlagService {
  private flags: Record<FeatureFlag, FeatureFlagConfig>;
  private userHash = 0;
  private environment: string;
  // eslint-disable-next-line no-magic-numbers
  private static readonly PERCENT_SCALE = 100;

  constructor() {
    this.flags = { ...FEATURE_FLAGS };
    this.environment = process.env.NODE_ENV || 'development';

    // 从环境变量覆盖配置
    const environmentFlags = process.env.NEXT_PUBLIC_FEATURE_FLAGS;
    if (environmentFlags) {
      const enabledFlags = environmentFlags.split(',').map(f => f.trim()) as FeatureFlag[];
      for (const flag of enabledFlags) {
        if (this.flags[flag]) {
          this.flags[flag] = { ...this.flags[flag], enabled: true, rolloutPercentage: 100 };
        }
      }
    }

    // 生成用户哈希（用于A/B测试）
    if (typeof window !== 'undefined') {
      const userId = localStorage.getItem('userId') || 'anonymous';
      this.userHash = this.hashCode(userId);
    }
  }

  private hashCode(string_: string): number {
    let hash = 0;
    for (let index = 0; index < string_.length; index++) {
      const char = string_.charCodeAt(index);
      const SHIFT_BITS = 5;
      // eslint-disable-next-line no-magic-numbers
      hash = ((hash << SHIFT_BITS) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % FeatureFlagService.PERCENT_SCALE;
  }

  /**
   * 检查功能开关是否启用
   */
  isEnabled(flag: FeatureFlag): boolean {
    const config = this.flags[flag];
    if (!config) return false;

    // 环境检查
    if (!config.environments.includes(this.environment as any)) {
      return false;
    }

    // 基础启用检查
    if (!config.enabled) return false;

    // 依赖检查
    if (config.dependencies) {
      const allDependenciesMet = config.dependencies.every(dep => this.isEnabled(dep));
      if (!allDependenciesMet) return false;
    }

    // 用户分组检查（A/B测试）
    if (config.rolloutPercentage < FeatureFlagService.PERCENT_SCALE) {
      return this.userHash < config.rolloutPercentage;
    }

    return true;
  }

  /**
   * 获取所有启用的功能
   */
  getEnabledFlags(): FeatureFlag[] {
    return (Object.keys(this.flags) as FeatureFlag[]).filter(flag => this.isEnabled(flag));
  }

  /**
   * 获取功能配置
   */
  getFlagConfig(flag: FeatureFlag): FeatureFlagConfig | null {
    return this.flags[flag] || null;
  }

  /**
   * 获取已弃用的路由列表
   */
  getDeprecatedRoutes(): string[] {
    const deprecated: string[] = [];

    for (const [flag, config] of Object.entries(this.flags)) {
      if (this.isEnabled(flag as FeatureFlag) && config.deprecates) {
        deprecated.push(...config.deprecates);
      }
    }

    return deprecated;
  }

  /**
   * 动态启用功能（仅开发环境）
   */
  enableFlag(flag: FeatureFlag, percentage = 100): void {
    if (this.environment !== 'development') {
      logger.warn('FeatureFlags', 'Feature flags can only be modified in development environment');
      return;
    }

    this.flags[flag] = {
      ...this.flags[flag],
      enabled: true,
      rolloutPercentage: percentage,
    };

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      const overrides = JSON.parse(localStorage.getItem('featureFlagOverrides') || '{}');
      overrides[flag] = { enabled: true, rolloutPercentage: percentage };
      localStorage.setItem('featureFlagOverrides', JSON.stringify(overrides));
    }
  }

  /**
   * 动态禁用功能（仅开发环境）
   */
  disableFlag(flag: FeatureFlag): void {
    if (this.environment !== 'development') {
      logger.warn('FeatureFlags', 'Feature flags can only be modified in development environment');
      return;
    }

    this.flags[flag] = {
      ...this.flags[flag],
      enabled: false,
      rolloutPercentage: 0,
    };

    // 保存到本地存储
    if (typeof window !== 'undefined') {
      const overrides = JSON.parse(localStorage.getItem('featureFlagOverrides') || '{}');
      overrides[flag] = { enabled: false, rolloutPercentage: 0 };
      localStorage.setItem('featureFlagOverrides', JSON.stringify(overrides));
    }
  }

  /**
   * 重置所有功能开关（仅开发环境）
   */
  resetFlags(): void {
    if (this.environment !== 'development') return;

    this.flags = { ...FEATURE_FLAGS };
    if (typeof window !== 'undefined') {
      localStorage.removeItem('featureFlagOverrides');
    }
  }

  /**
   * 获取功能开关状态总览
   */
  getStatus(): Record<string, { enabled: boolean; percentage: number; description: string }> {
    const status: Record<string, { enabled: boolean; percentage: number; description: string }> = {};

    for (const [flag, config] of Object.entries(this.flags)) {
      status[flag] = {
        enabled: this.isEnabled(flag as FeatureFlag),
        percentage: config.rolloutPercentage,
        description: config.description,
      };
    }

    return status;
  }
}

// 创建全局实例
export const featureFlags = new FeatureFlagService();

// React Hook 用于在组件中使用功能开关
export function useFeatureFlag(flag: FeatureFlag): boolean {
  return featureFlags.isEnabled(flag);
}

// React Hook 用于获取多个功能开关状态
export function useFeatureFlags(flags: FeatureFlag[]): Record<FeatureFlag, boolean> {
  const result: Record<FeatureFlag, boolean> = {} as any;
  for (const flag of flags) {
    result[flag] = featureFlags.isEnabled(flag);
  }
  return result;
}

// 条件渲染组件
interface FeatureGateProperties {
  flag: FeatureFlag
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function FeatureGate({ flag, children, fallback = null }: FeatureGateProperties) {
  const isEnabled = useFeatureFlag(flag);
  return isEnabled 
    ? React.createElement(React.Fragment, null, children) 
    : React.createElement(React.Fragment, null, fallback);
}

// 开发工具（仅开发环境）
export const DevTools = {
  showStatus: () => {
    if (process.env.NODE_ENV !== 'development') return;
    const status = featureFlags.getStatus();
    logger.info('FeatureFlags', 'Status', status);
  },

  enable: (flag: FeatureFlag, percentage = 100) => {
    featureFlags.enableFlag(flag, percentage);
    if (process.env.NODE_ENV === 'development') {
      logger.info('FeatureFlags', `Enabled ${flag} (${percentage}%)`);
    }
  },

  disable: (flag: FeatureFlag) => {
    featureFlags.disableFlag(flag);
    if (process.env.NODE_ENV === 'development') {
      logger.info('FeatureFlags', `Disabled ${flag}`);
    }
  },

  reset: () => {
    featureFlags.resetFlags();
    if (process.env.NODE_ENV === 'development') {
      logger.info('FeatureFlags', 'Reset all feature flags');
    }
  },

  test: (flag: FeatureFlag) => {
    const isEnabled = featureFlags.isEnabled(flag);
    const config = featureFlags.getFlagConfig(flag);
    if (process.env.NODE_ENV === 'development') {
      logger.debug('FeatureFlags', `Flag: ${flag}`, { isEnabled, config });
    }
  },
};

// 在开发环境中将工具暴露到全局
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as any).featureFlags = DevTools;
}
