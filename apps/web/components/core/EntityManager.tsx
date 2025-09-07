'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Eye, Download, Upload, RefreshCw, X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';


import type { TableColumn, TableAction, BatchAction } from './DataTable';
import { DataTable } from './DataTable';
import type { FormField } from './FormBuilder';
import { FormBuilder } from './FormBuilder';
import { cn } from '@/lib/utils';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui';
import { logger } from '@/lib/verbose-logger';


export interface EntityPermissions {
  canView?: boolean
  canCreate?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canExport?: boolean
  canBulkDelete?: boolean
  canBulkEdit?: boolean
}

export interface EntityActions<T = any> {
  onCreate?: (data: any) => Promise<void>
  onUpdate?: (id: string, data: any) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  onBulkDelete?: (ids: string[]) => Promise<void>
  onExport?: () => Promise<void>
  onImport?: (file: File) => Promise<void>
  onRefresh?: () => Promise<void>
  customActions?: ({
    label: string
    icon?: ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    show?: (item: T) => boolean
    bulk?: false
  } | {
    label: string
    icon?: ReactNode
    onClick: (selectedRows: T[]) => void
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
    bulk: true
  })[]
}

interface EntityManagerProperties<T = any> {
  entityType: string
  entityName: string
  entityNamePlural: string
  data: T[]
  loading?: boolean
  columns: TableColumn<T>[]
  formFields: FormField[]
  permissions: EntityPermissions
  actions: EntityActions<T>
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  searchable?: boolean
  filters?: {
    key: string
    label: string
    options: { label: string; value: string }[]
  }[]
  emptyMessage?: string
  className?: string
  title?: string
  description?: string
}

type ModalType = 'create' | 'edit' | 'view' | 'delete' | 'bulkDelete' | null

export function EntityManager<T extends Record<string, any>>({
  entityType: _entityType,
  entityName,
  entityNamePlural,
  data,
  loading = false,
  columns,
  formFields,
  permissions,
  actions,
  pagination,
  searchable = true,
  filters = [],
  emptyMessage,
  className,
  title,
  description,
}: EntityManagerProperties<T>) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  // Note: formData was previously unused; removed to reduce lint noise.
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 关闭弹窗
  const closeModal = () => {
    setModalType(null);
    setSelectedItem(null);
    setSelectedItems([]);
  };

  // 处理创建
  const handleCreate = () => {
    setModalType('create');
  };

  // 处理编辑
  const handleEdit = (item: T) => {
    setSelectedItem(item);
    setModalType('edit');
  };

  // 处理查看
  const handleView = (item: T) => {
    setSelectedItem(item);
    setModalType('view');
  };

  // 处理删除
  const handleDelete = (item: T) => {
    setSelectedItem(item);
    setModalType('delete');
  };

  // 处理批量删除
  const handleBulkDelete = (items: T[]) => {
    setSelectedItems(items);
    setModalType('bulkDelete');
  };

  // 处理表单提交
  const handleFormSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (modalType === 'create') {
        await actions.onCreate?.(data);
      } else if (modalType === 'edit' && selectedItem) {
        await actions.onUpdate?.(selectedItem.id, data);
      }
      closeModal();
      await actions.onRefresh?.();
    } catch (error) {
      logger.error('EntityManager', 'Form submission error', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 确认删除
  const confirmDelete = async () => {
    setSubmitting(true);
    try {
      if (modalType === 'delete' && selectedItem) {
        await actions.onDelete?.(selectedItem.id);
      } else if (modalType === 'bulkDelete' && selectedItems.length > 0) {
        await actions.onBulkDelete?.(selectedItems.map(item => item.id));
      }
      closeModal();
      await actions.onRefresh?.();
    } catch (error) {
      logger.error('EntityManager', 'Delete error', error);
    } finally {
      setSubmitting(false);
    }
  };

  // 处理刷新
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await actions.onRefresh?.();
    } catch (error) {
      logger.error('EntityManager', 'Refresh error', error);
    } finally {
      setRefreshing(false);
    }
  };

  // 构建表格操作
  const tableActions: TableAction<T>[] = [];

  if (permissions.canView) {
    tableActions.push({
      label: '查看',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleView,
      variant: 'outline',
    });
  }

  if (permissions.canEdit) {
    tableActions.push({
      label: '编辑',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEdit,
      variant: 'outline',
    });
  }

  if (permissions.canDelete) {
    tableActions.push({
      label: '删除',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDelete,
      variant: 'destructive',
    });
  }

  // 添加自定义操作
  if (actions.customActions) {
    const individualActions = actions.customActions.filter((action): action is {
      label: string
      icon?: ReactNode
      onClick: (item: T) => void
      variant?: 'default' | 'secondary' | 'destructive' | 'outline'
      show?: (item: T) => boolean
      bulk?: false
    } => !action.bulk);
    tableActions.push(...individualActions);
  }

  // 构建批量操作
  const batchActions: BatchAction<T>[] = [];

  if (permissions.canBulkDelete) {
    batchActions.push({
      label: '批量删除',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleBulkDelete,
      variant: 'destructive',
    });
  }

  // 添加自定义批量操作
  if (actions.customActions) {
    const bulkActions = actions.customActions.filter((action): action is {
      label: string
      icon?: ReactNode
      onClick: (selectedRows: T[]) => void
      variant?: 'default' | 'secondary' | 'destructive' | 'outline'
      bulk: true
    } => action.bulk === true);
    batchActions.push(...bulkActions);
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* 页面头部 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          {title && <h1 className="text-2xl font-bold text-gray-900">{title}</h1>}
          {description && <p className="text-gray-600 mt-1">{description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {entityNamePlural}
            </Badge>
            <Badge variant="outline" className="text-xs">
              总计 {pagination?.total || data.length} 项
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* 导入 */}
          {actions.onImport && (
            <input
              type="file"
              id="import-file"
              className="hidden"
              accept=".csv,.xlsx,.json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) actions.onImport?.(file);
              }}
            />
          )}
          {actions.onImport && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => (document.querySelector('#import-file') as HTMLElement)?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              导入
            </Button>
          )}

          {/* 导出 */}
          {permissions.canExport && actions.onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={actions.onExport}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              导出
            </Button>
          )}

          {/* 刷新 */}
          {actions.onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
              刷新
            </Button>
          )}

          {/* 创建新项目 */}
          {permissions.canCreate && actions.onCreate && (
            <Button
              onClick={handleCreate}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新建{entityName}
            </Button>
          )}
        </div>
      </div>

      {/* 数据表格 */}
      <DataTable
        data={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        actions={tableActions}
        batchActions={batchActions}
        filters={filters}
        searchable={searchable}
        selectable={permissions.canBulkDelete || batchActions.length > 0}
        exportable={false} // 由顶部导出按钮处理
        emptyMessage={emptyMessage || `暂无${entityNamePlural}数据`}
      />

      {/* 创建/编辑弹窗 */}
      <AnimatePresence>
        {(modalType === 'create' || modalType === 'edit') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <FormBuilder
                fields={formFields}
                onSubmit={handleFormSubmit}
                onCancel={closeModal}
                loading={submitting}
                title={modalType === 'create' ? `新建${entityName}` : `编辑${entityName}`}
                submitLabel={modalType === 'create' ? '创建' : '保存'}
                cancelLabel="取消"
                validateOnChange
                resetOnSubmit={modalType === 'create'}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 查看详情弹窗 */}
      <AnimatePresence>
        {modalType === 'view' && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{entityName}详情</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={closeModal}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formFields.map(field => (
                    <div key={field.key} className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        {field.label}
                      </Label>
                      <div className="p-3 bg-gray-50 rounded-md text-sm">
                        {selectedItem[field.key] !== null && selectedItem[field.key] !== undefined
                          ? String(selectedItem[field.key])
                          : '-'
                        }
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                    >
                      关闭
                    </Button>
                    {permissions.canEdit && (
                      <Button
                        onClick={() => setModalType('edit')}
                      >
                        编辑
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {(modalType === 'delete' || modalType === 'bulkDelete') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {modalType === 'delete' ? '确认删除' : '确认批量删除'}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {modalType === 'delete'
                          ? '此操作无法撤销'
                          : `将删除 ${selectedItems.length} 项，此操作无法撤销`
                        }
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-md border border-red-200">
                    {modalType === 'delete' && selectedItem
? (
                      <p className="text-sm text-red-800">
                        确定要删除{entityName}{' '}
                        <strong>{selectedItem.name || selectedItem.email || selectedItem.id}</strong>{' '}
                        吗？
                      </p>
                    )
: (
                      <p className="text-sm text-red-800">
                        确定要删除选中的 <strong>{selectedItems.length}</strong> 个{entityName}吗？
                      </p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={closeModal}
                      disabled={submitting}
                    >
                      取消
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={confirmDelete}
                      disabled={submitting}
                      className="flex items-center gap-2"
                    >
                      {submitting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      )}
                      确认删除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 预定义的实体管理器配置
export const EntityConfigs = {
  user: {
    entityType: 'user',
    entityName: '用户',
    entityNamePlural: '用户',
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canBulkDelete: true,
    },
  },

  product: {
    entityType: 'product',
    entityName: '产品',
    entityNamePlural: '产品',
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canBulkDelete: true,
    },
  },

  order: {
    entityType: 'order',
    entityName: '订单',
    entityNamePlural: '订单',
    permissions: {
      canView: true,
      canCreate: false,
      canEdit: true,
      canDelete: false,
      canExport: true,
      canBulkDelete: false,
    },
  },

  commission: {
    entityType: 'commission',
    entityName: '佣金',
    entityNamePlural: '佣金',
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canBulkDelete: true,
    },
  },

  agent: {
    entityType: 'agent',
    entityName: '代理',
    entityNamePlural: '代理',
    permissions: {
      canView: true,
      canCreate: true,
      canEdit: true,
      canDelete: true,
      canExport: true,
      canBulkDelete: true,
    },
  },

  withdrawal: {
    entityType: 'withdrawal',
    entityName: '提现',
    entityNamePlural: '提现记录',
    permissions: {
      canView: true,
      canCreate: false,
      canEdit: true, // 用于审批
      canDelete: false,
      canExport: true,
      canBulkDelete: false,
    },
  },
};

// 实体管理器工厂函数
export function createEntityManager<T>(
  config: typeof EntityConfigs[keyof typeof EntityConfigs],
  columns: TableColumn<T>[],
  formFields: FormField[],
  actions: EntityActions<T>,
) {
  return function EntityManagerComponent(properties: Omit<EntityManagerProperties<T>,
    'entityType' | 'entityName' | 'entityNamePlural' | 'columns' | 'formFields' | 'permissions' | 'actions'
  >) {
    return (
      <EntityManager
        {...config}
        {...properties}
        columns={columns}
        formFields={formFields}
        actions={actions}
      />
    );
  };
}
