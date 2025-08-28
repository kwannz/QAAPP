// 导出工具函数

// 将JSON数据转换为CSV格式
export function jsonToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return ''
  
  // 获取所有字段名作为表头
  const allHeaders = headers || Object.keys(data[0])
  
  // 创建CSV头部
  const csvHeader = allHeaders.join(',')
  
  // 创建CSV内容
  const csvRows = data.map(row => {
    return allHeaders.map(header => {
      const value = row[header]
      // 处理包含逗号、换行符或引号的值
      if (value === null || value === undefined) {
        return ''
      }
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    }).join(',')
  })
  
  return [csvHeader, ...csvRows].join('\n')
}

// 下载CSV文件
export function downloadCSV(data: any[], filename: string, headers?: string[]) {
  const csv = jsonToCSV(data, headers)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 下载Blob文件（用于从API获取的文件）
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 格式化审计日志数据用于导出
export function formatAuditLogsForExport(logs: any[]): any[] {
  return logs.map(log => ({
    'ID': log.id,
    '时间': new Date(log.createdAt).toLocaleString('zh-CN'),
    '操作者': log.actorEmail,
    '操作者类型': log.actorType,
    '操作': log.action,
    '资源类型': log.resourceType,
    '资源ID': log.resourceId,
    'IP地址': log.ipAddress,
    '严重程度': log.severity,
    '分类': log.category,
    '用户代理': log.userAgent,
    '元数据': JSON.stringify(log.metadata || {})
  }))
}

// 格式化系统事件数据用于导出  
export function formatSystemEventsForExport(events: any[]): any[] {
  return events.map(event => ({
    'ID': event.id,
    '时间': new Date(event.timestamp).toLocaleString('zh-CN'),
    '事件类型': event.eventType,
    '严重程度': event.severity,
    '服务': event.service,
    '组件': event.component,
    '消息': event.message,
    '状态': event.status,
    '影响用户数': event.affectedUsers,
    '响应时间(ms)': event.responseTime,
    'CPU使用率(%)': event.cpuUsage,
    '内存使用率(%)': event.memoryUsage,
    '详细信息': JSON.stringify(event.details || {})
  }))
}

// 格式化用户审计数据用于导出
export function formatUserAuditForExport(logs: any[]): any[] {
  return logs.map(log => ({
    'ID': log.id,
    '时间': new Date(log.timestamp).toLocaleString('zh-CN'),
    '用户ID': log.userId,
    '用户邮箱': log.userEmail,
    '操作': log.action,
    'IP地址': log.ipAddress,
    '设备信息': log.deviceInfo,
    '位置': log.location,
    '结果': log.result,
    '风险评分': log.riskScore,
    '异常标记': log.isAbnormal ? '是' : '否',
    '详细信息': JSON.stringify(log.details || {})
  }))
}