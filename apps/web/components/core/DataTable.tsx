'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CheckSquare,
  Square,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import type { ReactNode } from 'react';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, cn } from '@/components/ui';
const THOUSANDS_THRESHOLD = 1000;
const MAX_ROW_ACTIONS = 2;
const MAX_PAGINATION_BUTTONS = 5;
const PAGE_OFFSET = 2;

// Audit-specific types and configurations
export interface AuditLog {
  id: string
  timestamp: string
  user?: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ip?: string
  userAgent?: string
  details?: any
}

const auditResultIcons = {
  success: CheckCircle,
  failure: XCircle,
  warning: AlertTriangle,
};

const auditResultColors = {
  success: 'text-green-600',
  failure: 'text-red-600',
  warning: 'text-yellow-600',
};

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => ReactNode
  width?: string
  className?: string
  searchable?: boolean
}

export interface TableAction<T = any> {
  label: string
  icon?: ReactNode
  onClick: (row: T) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  show?: (row: T) => boolean
  loading?: boolean
}

export interface BatchAction<T = any> {
  label: string
  icon?: ReactNode
  onClick: (selectedRows: T[]) => void
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  disabled?: boolean
  loading?: boolean
}

interface TableFilter {
  key: string
  label: string
  options: { label: string; value: string }[]
  value?: string
}

interface DataTableProperties<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  actions?: TableAction<T>[]
  batchActions?: BatchAction<T>[]
  filters?: TableFilter[]
  searchable?: boolean
  selectable?: boolean
  exportable?: boolean
  title?: string
  description?: string
  className?: string
  emptyMessage?: string
  onExport?: () => void
}

type SortDirection = 'asc' | 'desc' | null

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  actions = [],
  batchActions = [],
  filters = [],
  searchable = true,
  selectable = false,
  exportable = false,
  title,
  description,
  className,
  emptyMessage = '暂无数据',
  onExport,
}: DataTableProperties<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<T>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Derived pagination numbers
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;
  const buttonCount = pagination ? Math.min(MAX_PAGINATION_BUTTONS, totalPages) : 0;

  // 处理排序
  const handleSort = (column: keyof T) => {
    if (!columns.find(col => col.key === column)?.sortable) return;

    if (sortColumn === column) {
      setSortDirection(previous =>
        previous === 'asc' ? 'desc' : (previous === 'desc' ? null : 'asc'),
      );
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // 处理行选择
  const handleRowSelect = (row: T) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(row)) {
      newSelected.delete(row);
    } else {
      newSelected.add(row);
    }
    setSelectedRows(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === filteredAndSortedData.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filteredAndSortedData));
    }
  };

  // 数据处理
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 搜索过滤
    if (searchTerm && searchable) {
      const searchableColumns = columns.filter(col => col.searchable !== false);
      result = result.filter(row =>
        searchableColumns.some(col =>
          String(row[col.key])
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
        ),
      );
    }

    // 筛选器过滤
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && value !== 'all') {
        result = result.filter(row => String(row[key]) === value);
      }
    }

    // 排序
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }

        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (sortDirection === 'asc') {
          return aString.localeCompare(bString, 'zh-CN');
        }
          return bString.localeCompare(aString, 'zh-CN');
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, activeFilters, columns, searchable]);

  const getSortIcon = (column: keyof T) => {
    if (!columns.find(col => col.key === column)?.sortable) return null;

    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    if (sortDirection === 'asc') return <ArrowUp className="h-4 w-4" />;
    if (sortDirection === 'desc') return <ArrowDown className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4" />;
  };

  const formatValue = async (value: any, column: TableColumn<T>, row: T) => {
    if (column.render) {
      return column.render(value, row);
    }

    if (typeof value === 'boolean') {
      return value
? (
        <CheckSquare className="h-4 w-4 text-green-600" />
      )
: (
        <Square className="h-4 w-4 text-gray-400" />
      );
    }

    if (typeof value === 'number' && value > THOUSANDS_THRESHOLD) {
      return value.toLocaleString('zh-CN');
    }

    return String(value);
  };

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent className="space-y-4">
        {/* 工具栏 */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            {/* 搜索 */}
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            )}

            {/* 筛选器 */}
            {filters.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                筛选 {Object.values(activeFilters).some(v => v && v !== 'all') &&
                  `(${Object.values(activeFilters).filter(v => v && v !== 'all').length})`}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 批量操作 */}
            {selectable && selectedRows.size > 0 && (
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-gray-500">
                  已选择 {selectedRows.size} 项
                </span>
                {batchActions.map((action) => (
                  <Button
                    key={action.label}
                    variant={action.variant || 'outline'}
                    size="sm"
                    onClick={() => action.onClick([...selectedRows])}
                    disabled={action.disabled || action.loading}
                    className="flex items-center gap-2"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                ))}
              </div>
            )}

            {/* 导出 */}
            {exportable && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                导出
              </Button>
            )}
          </div>
        </div>

        {/* 筛选器面板 */}
        <AnimatePresence>
          {showFilters && filters.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      {filter.label}
                    </label>
                    <select
                      value={activeFilters[filter.key] || 'all'}
                      onChange={(e) =>
                        setActiveFilters(previous => ({
                          ...previous,
                          [filter.key]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                    >
                      <option value="all">全部</option>
                      {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表格 */}
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {selectable && (
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  {columns.map((column) => (
                    <th
                      key={String(column.key)}
                      className={cn(
                        'px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider',
                        column.sortable && 'cursor-pointer hover:bg-gray-100',
                        column.width && { width: column.width },
                        column.className,
                      )}
                      style={column.width ? { width: column.width } : undefined}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.label}</span>
                        {getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="w-32 px-4 py-3 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading
? (
                  <tr>
                    <td
colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                        className="px-4 py-12 text-center text-gray-500"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                        <span>加载中...</span>
                      </div>
                    </td>
                  </tr>
                )
: (filteredAndSortedData.length === 0
? (
                  <tr>
                    <td
colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                        className="px-4 py-12 text-center text-gray-500"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                )
: (
                  filteredAndSortedData.map((row, index) => {
                    const rowKey = String((row as any)[columns[0].key] ?? index);
                    return (
                    <motion.tr
                      key={rowKey}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        selectedRows.has(row) && 'bg-blue-50',
                      )}
                    >
                      {selectable && (
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(row)}
                            onChange={() => handleRowSelect(row)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      {columns.map((column) => (
                        <td
                          key={String(column.key)}
                          className={cn('px-4 py-4 text-sm text-gray-900', column.className)}
                        >
                          {formatValue(row[column.key], column, row)}
                        </td>
                      ))}
                      {actions.length > 0 && (
                        <td className="px-4 py-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            {actions
                              .filter(action => !action.show || action.show(row))
                              .slice(0, MAX_ROW_ACTIONS)
                              .map((action) => (
                                <Button
                                  key={String(action.label)}
                                  variant={action.variant || 'outline'}
                                  size="sm"
                                  onClick={() => action.onClick(row)}
                                  disabled={action.loading}
                                  className="flex items-center gap-1"
                                >
                                  {action.icon}
                                  {action.label}
                                </Button>
                              ))}
                            {actions.filter(action => !action.show || action.show(row)).length > MAX_ROW_ACTIONS && (
                              <Button variant="outline" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      )}
                    </motion.tr>
                    );
                  })
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 分页 */}
        {pagination && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-700">
              <span>每页显示</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange(Number(e.target.value))}
                className="border border-gray-200 rounded px-2 py-1"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>条记录</span>
              <span className="text-gray-500">
                共 {pagination.total} 条
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: buttonCount })
                  .map((_, index) => {
                    const pageNumber = pagination.page + index - PAGE_OFFSET;
                    if (pageNumber < 1 || pageNumber > Math.ceil(pagination.total / pagination.pageSize)) {
                      return null;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => pagination.onPageChange(pageNumber)}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// 预定义的常用列类型
export const ColumnTypes = {
  id: (key = 'id'): TableColumn => ({
    key: key as any,
    label: 'ID',
    width: '80px',
    className: 'font-mono text-xs',
  }),

  email: (key = 'email'): TableColumn => ({
    key: key as any,
    label: '邮箱',
    sortable: true,
    searchable: true,
    className: 'font-mono',
  }),

  money: (key: string, label = '金额'): TableColumn => ({
    key: key as any,
    label,
    sortable: true,
    render: (value) => (
      <span className="font-mono text-green-600">
        ¥{Number(value).toLocaleString('zh-CN')}
      </span>
    ),
  }),

  status: (key = 'status', statusMap?: Record<string, { label: string; color: string }>): TableColumn => ({
    key: key as any,
    label: '状态',
    render: (value) => {
      const config = statusMap?.[value] || {
        label: value,
        color: 'gray',
      };

      return (
        <Badge variant="secondary" className={`bg-${config.color}-100 text-${config.color}-800`}>
          {config.label}
        </Badge>
      );
    },
  }),

  date: (key: string, label = '日期'): TableColumn => ({
    key: key as any,
    label,
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString('zh-CN'),
  }),

  dateTime: (key: string, label = '时间'): TableColumn => ({
    key: key as any,
    label,
    sortable: true,
    render: (value) => new Date(value).toLocaleString('zh-CN'),
  }),
};

// 常用操作
export const CommonActions = {
  view: (onClick: (row: any) => void): TableAction => ({
    label: '查看',
    icon: <Eye className="h-4 w-4" />,
    onClick,
    variant: 'outline',
  }),

  edit: (onClick: (row: any) => void): TableAction => ({
    label: '编辑',
    icon: <Edit className="h-4 w-4" />,
    onClick,
    variant: 'outline',
  }),

  delete: (onClick: (row: any) => void): TableAction => ({
    label: '删除',
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: 'destructive',
  }),
};

// Specialized AuditTable wrapper for backward compatibility
interface AuditTableProperties {
  logs: AuditLog[]
  type: 'security' | 'finance' | 'system' | 'all'
  onViewDetails?: (log: AuditLog) => void
  onMarkAbnormal?: (logIds: string[]) => void
  className?: string
  showActions?: boolean
}

export function AuditTable({
  logs,
  type,
  onViewDetails,
  onMarkAbnormal,
  className,
  showActions = true,
}: AuditTableProperties) {
  const columns: TableColumn<AuditLog>[] = [
    ColumnTypes.dateTime('timestamp', '时间'),
    {
      key: 'user',
      label: '用户',
      render: (value) => value || '系统',
    },
    {
      key: 'action',
      label: '操作',
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: 'resource',
      label: '资源',
    },
    {
      key: 'result',
      label: '结果',
      render: (value: 'success' | 'failure' | 'warning') => {
        const Icon = auditResultIcons[value];
        const color = auditResultColors[value];
        return (
          <div className="flex items-center gap-2">
            <Icon className={cn('w-4 h-4', color)} />
            <span className={cn('capitalize', color)}>
              {value === 'success' ? '成功' : (value === 'failure' ? '失败' : '警告')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'ip',
      label: 'IP地址',
      render: (value) => value ? <Badge variant="secondary">{value}</Badge> : '-',
    },
  ];

  const actions: TableAction<AuditLog>[] = [];

  if (onViewDetails && showActions) {
    actions.push({
      label: '详情',
      icon: <Eye className="h-4 w-4" />,
      onClick: onViewDetails,
      variant: 'outline',
    });
  }

  const batchActions: BatchAction<AuditLog>[] = [];

  if (onMarkAbnormal && showActions) {
    batchActions.push({
      label: '标记异常',
      icon: <AlertTriangle className="h-4 w-4" />,
      onClick: (rows) => onMarkAbnormal(rows.map(r => r.id)),
      variant: 'destructive',
    });
  }

  return (
    <DataTable<AuditLog>
      data={logs}
      columns={columns}
      actions={actions}
      batchActions={batchActions}
      selectable={showActions}
      searchable
      exportable
      title={`${type === 'all' ? '全部' : type === 'security' ? '安全' : type === 'finance' ? '金融' : '系统'}审计日志`}
      emptyMessage="暂无审计记录"
      className={className}
      pagination={{
        page: 1,
        pageSize: 20,
        total: logs.length,
        onPageChange: () => {},
        onPageSizeChange: () => {},
      }}
    />
  );
}
