/**
 * 核心组件库导出
 * Phase 3.1: 高级通用组件
 */

export { DataTable, ColumnTypes, CommonActions } from './DataTable'
export type { TableColumn, TableAction, BatchAction } from './DataTable'

export { FormBuilder, FieldTypes, FormTemplates } from './FormBuilder'
export type { FormField } from './FormBuilder'

export { EntityManager, EntityConfigs, createEntityManager } from './EntityManager'
export type { EntityPermissions, EntityActions } from './EntityManager'

// 重导出常用组件
export { MetricsCard, UserMetricsCard, RevenueMetricsCard, SystemHealthCard } from '../common/MetricsCard'
export { TabContainer } from '../common/TabContainer'
export { FilterPanel } from '../common/FilterPanel'
export { AuditTable } from '../common/AuditTable'