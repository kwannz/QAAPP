/**
 * Business Components - Consolidated business logic components
 * 整合后的业务逻辑组件，遵循 Sprint 2 集成计划
 */

// Transaction Management
export { TransactionFlow, useTransactionFlow } from './TransactionFlow'
export type { TransactionType, TransactionStep } from './TransactionFlow'

// Portfolio Management
export { PortfolioManager, usePortfolioManager } from './PortfolioManager'

// Wallet Management
export { WalletManager, useWalletManager } from './WalletManager'

// Business component utilities
export const BUSINESS_COMPONENTS = {
  TransactionFlow: 'TransactionFlow',
  PortfolioManager: 'PortfolioManager', 
  WalletManager: 'WalletManager'
} as const

export type BusinessComponentType = keyof typeof BUSINESS_COMPONENTS