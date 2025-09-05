/**
 * 核心组件库导出
 * Phase 3.1: 高级通用组件
 */

export { DataTable, ColumnTypes, CommonActions, AuditTable } from './DataTable';
export type { TableColumn, TableAction, BatchAction, AuditLog } from './DataTable';

export { FormBuilder, FieldTypes, FormTemplates } from './FormBuilder';
export type { FormField } from './FormBuilder';

export { EntityManager, EntityConfigs, createEntityManager } from './EntityManager';
export type { EntityPermissions, EntityActions } from './EntityManager';

// 重导出常用组件
export { MetricsCard, UserMetricsCard, RevenueMetricsCard, SystemHealthCard } from '../ui/CardSystem';
export { TabContainer } from '../common/TabContainer';
export { FilterPanel } from '../common/FilterPanel';
