'use client';

import { Search, Filter, X, Calendar, Download } from 'lucide-react';
import { useState } from 'react';

import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/utils';

interface FilterOption {
  value: string
  label: string
  count?: number
}

interface FilterConfig {
  id: string
  label: string
  type: 'select' | 'date' | 'daterange' | 'search'
  options?: FilterOption[]
  placeholder?: string
}

interface FilterPanelProperties {
  filters: FilterConfig[]
  values: Record<string, any>
  onChange: (filterValues: Record<string, any>) => void
  onSearch?: (searchTerm: string) => void
  onExport?: () => void
  searchPlaceholder?: string
  className?: string
  showExport?: boolean
}

export function FilterPanel({
  filters,
  values,
  onChange,
  onSearch,
  onExport,
  searchPlaceholder = '搜索...',
  className,
  showExport = true,
}: FilterPanelProperties) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterId: string, value: any) => {
    onChange({
      ...values,
      [filterId]: value,
    });
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const clearFilters = () => {
    const clearedValues = Object.fromEntries(Object.keys(values).map((key) => [key, filters.find(f => f.id === key)?.type === 'search' ? '' : 'all']));
    onChange(clearedValues);
    setSearchTerm('');
    onSearch?.('');
  };

  const activeFilterCount = Object.entries(values).filter(
    ([_key, value]) => value && value !== 'all' && value !== '',
  ).length;

  return (
    <div className={cn('space-y-4 rounded-lg bg-white p-4 shadow-sm', className)}>
      {/* 搜索栏和操作按钮 */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="relative"
          >
            <Filter className="mr-2 h-4 w-4" />
            筛选
            {activeFilterCount > 0 && (
              <span className="ml-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {showExport && onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
          )}
        </div>
      </div>

      {/* 筛选器面板 */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filters.map((filter) => (
              <div key={filter.id}>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {filter.label}
                </label>

                {filter.type === 'select' && filter.options && (
                  <select
                    value={values[filter.id] || 'all'}
                    onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">全部</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                      </option>
                    ))}
                  </select>
                )}

                {filter.type === 'date' && (
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={values[filter.id] || ''}
                      onChange={(e) => handleFilterChange(filter.id, e.target.value)}
                      className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                )}

                {filter.type === 'daterange' && (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={values[`${filter.id}_start`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.id}_start`, e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="开始"
                    />
                    <input
                      type="date"
                      value={values[`${filter.id}_end`] || ''}
                      onChange={(e) => handleFilterChange(`${filter.id}_end`, e.target.value)}
                      className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                      placeholder="结束"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeFilterCount > 0 && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-600"
              >
                <X className="mr-2 h-4 w-4" />
                清除筛选
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
