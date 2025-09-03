'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  User, 
  Shield, 
  Activity,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { cn } from '@/lib/utils'

interface AuditLog {
  id: string
  timestamp: string
  user?: string
  action: string
  resource: string
  result: 'success' | 'failure' | 'warning'
  ip?: string
  userAgent?: string
  details?: any
  type?: 'system' | 'user' | 'admin' | 'security'
}

interface AuditTableProps {
  logs: AuditLog[]
  type: 'system' | 'user' | 'general' | 'security'
  onViewDetails?: (log: AuditLog) => void
  onMarkAbnormal?: (logIds: string[]) => void
  className?: string
  showActions?: boolean
}

const typeIcons = {
  system: Shield,
  user: User,
  security: AlertTriangle,
  admin: Shield,
  general: Activity
}

const resultIcons = {
  success: CheckCircle,
  failure: XCircle,
  warning: AlertTriangle
}

const resultColors = {
  success: 'text-green-600',
  failure: 'text-red-600',
  warning: 'text-yellow-600'
}

export function AuditTable({
  logs,
  type,
  onViewDetails,
  onMarkAbnormal,
  className,
  showActions = true
}: AuditTableProps) {
  const [selectedLogs, setSelectedLogs] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentLogs = logs.slice(startIndex, endIndex)
  const totalPages = Math.ceil(logs.length / itemsPerPage)

  const handleSelectLog = (logId: string) => {
    setSelectedLogs(prev =>
      prev.includes(logId)
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    )
  }

  const handleSelectAll = () => {
    setSelectedLogs(
      selectedLogs.length === currentLogs.length
        ? []
        : currentLogs.map(log => log.id)
    )
  }

  const handleMarkAbnormal = () => {
    if (selectedLogs.length > 0 && onMarkAbnormal) {
      onMarkAbnormal(selectedLogs)
      setSelectedLogs([])
    }
  }

  const TypeIcon = typeIcons[type]

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center space-x-2">
          <TypeIcon className="h-5 w-5" />
          <span>
            {type === 'system' && '系统审计日志'}
            {type === 'user' && '用户审计日志'}
            {type === 'security' && '安全审计日志'}
            {type === 'general' && '通用审计日志'}
          </span>
          <span className="text-sm text-gray-500">({logs.length} 条记录)</span>
        </CardTitle>
        
        {showActions && selectedLogs.length > 0 && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAbnormal}
              className="text-orange-600 hover:bg-orange-50"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              标记异常 ({selectedLogs.length})
            </Button>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">暂无审计记录</p>
          </div>
        ) : (
          <>
            {/* 表格 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    {showActions && (
                      <th className="w-12 p-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedLogs.length === currentLogs.length && currentLogs.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                      </th>
                    )}
                    <th className="p-3 text-left font-medium text-gray-900">时间</th>
                    <th className="p-3 text-left font-medium text-gray-900">操作</th>
                    <th className="p-3 text-left font-medium text-gray-900">资源</th>
                    <th className="p-3 text-left font-medium text-gray-900">用户</th>
                    <th className="p-3 text-left font-medium text-gray-900">结果</th>
                    <th className="p-3 text-left font-medium text-gray-900">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {currentLogs.map((log, index) => {
                    const ResultIcon = resultIcons[log.result]
                    const resultColor = resultColors[log.result]
                    const isSelected = selectedLogs.includes(log.id)
                    
                    return (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className={cn(
                          'border-b border-gray-100 hover:bg-gray-50 transition-colors',
                          isSelected && 'bg-blue-50'
                        )}
                      >
                        {showActions && (
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectLog(log.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="p-3 text-gray-900">
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {new Date(log.timestamp).toLocaleString('zh-CN')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {log.ip || '未知IP'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="font-medium text-gray-900">{log.action}</span>
                        </td>
                        <td className="p-3 text-gray-600">{log.resource}</td>
                        <td className="p-3 text-gray-600">{log.user || '系统'}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <ResultIcon className={cn('h-4 w-4', resultColor)} />
                            <span className={cn('text-sm font-medium', resultColor)}>
                              {log.result === 'success' && '成功'}
                              {log.result === 'failure' && '失败'}
                              {log.result === 'warning' && '警告'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          {onViewDetails && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewDetails(log)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-700">
                  显示 {startIndex + 1}-{Math.min(endIndex, logs.length)} 条，共 {logs.length} 条记录
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  
                  <span className="flex items-center px-3 py-1 text-sm">
                    第 {currentPage} / {totalPages} 页
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}