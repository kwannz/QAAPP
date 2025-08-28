/**
 * 统一的前端日志管理系统
 * 支持多级别日志、性能监控、错误追踪等功能
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  levelName: string
  message: string
  module?: string
  action?: string
  userId?: string
  sessionId?: string
  requestId?: string
  duration?: number
  metadata?: any
  error?: Error
  stack?: string
  url?: string
  userAgent?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  enableLocalStorage: boolean
  maxLocalStorageLogs: number
  remoteEndpoint?: string
  verbose: boolean
  modules?: string[]
  performanceThreshold?: number
}

class Logger {
  private config: LoggerConfig = {
    level: LogLevel.INFO,
    enableConsole: true,
    enableRemote: false,
    enableLocalStorage: true,
    maxLocalStorageLogs: 1000,
    verbose: process.env.NODE_ENV === 'development',
    performanceThreshold: 1000, // ms
  }

  private logBuffer: LogEntry[] = []
  private timers: Map<string, number> = new Map()
  private sessionId: string
  private userId?: string

  constructor() {
    this.sessionId = this.generateSessionId()
    this.loadConfig()
    this.setupGlobalErrorHandler()
    this.setupPerformanceObserver()
  }

  // 加载配置
  private loadConfig() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return // 服务端渲染时跳过localStorage操作
    }
    
    const savedConfig = localStorage.getItem('logger_config')
    if (savedConfig) {
      try {
        this.config = { ...this.config, ...JSON.parse(savedConfig) }
      } catch (e) {
        console.error('Failed to load logger config:', e)
      }
    }
  }

  // 保存配置
  public setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config }
    localStorage.setItem('logger_config', JSON.stringify(this.config))
    this.log(LogLevel.INFO, 'Logger', 'Config updated', { config: this.config })
  }

  // 设置用户ID
  public setUserId(userId: string) {
    this.userId = userId
    this.log(LogLevel.INFO, 'Logger', 'User ID set', { userId })
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 生成请求ID
  public generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 核心日志方法
  private log(
    level: LogLevel,
    module: string,
    message: string,
    metadata?: any,
    error?: Error
  ) {
    if (level < this.config.level) return

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      levelName: LogLevel[level],
      message,
      module,
      userId: this.userId,
      sessionId: this.sessionId,
      metadata,
      error,
      stack: error?.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    // 控制台输出
    if (this.config.enableConsole) {
      this.consoleLog(entry)
    }

    // 保存到本地存储
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage(entry)
    }

    // 发送到远程服务器
    if (this.config.enableRemote) {
      this.sendToRemote(entry)
    }

    // 添加到缓冲区
    this.logBuffer.push(entry)
    if (this.logBuffer.length > 100) {
      this.logBuffer.shift()
    }
  }

  // 控制台输出
  private consoleLog(entry: LogEntry) {
    const style = this.getConsoleStyle(entry.level)
    const prefix = `[${entry.levelName}] [${entry.module}]`
    
    if (this.config.verbose) {
      console.groupCollapsed(
        `%c${prefix} ${entry.message}`,
        style
      )
      console.log('Timestamp:', entry.timestamp)
      console.log('Session:', entry.sessionId)
      if (entry.userId) console.log('User:', entry.userId)
      if (entry.metadata) console.log('Metadata:', entry.metadata)
      if (entry.error) console.error('Error:', entry.error)
      if (entry.stack) console.log('Stack:', entry.stack)
      console.log('URL:', entry.url)
      console.groupEnd()
    } else {
      const logFn = this.getConsoleFunction(entry.level)
      logFn(`%c${prefix}`, style, entry.message, entry.metadata || '')
    }
  }

  // 获取控制台样式
  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return 'color: #6B7280; font-weight: normal;'
      case LogLevel.INFO:
        return 'color: #3B82F6; font-weight: normal;'
      case LogLevel.WARN:
        return 'color: #F59E0B; font-weight: bold;'
      case LogLevel.ERROR:
        return 'color: #EF4444; font-weight: bold;'
      case LogLevel.FATAL:
        return 'color: #FFFFFF; background-color: #DC2626; font-weight: bold; padding: 2px 4px;'
      default:
        return ''
    }
  }

  // 获取控制台函数
  private getConsoleFunction(level: LogLevel): (...args: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug
      case LogLevel.INFO:
        return console.info
      case LogLevel.WARN:
        return console.warn
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return console.error
      default:
        return console.log
    }
  }

  // 保存到本地存储
  private saveToLocalStorage(entry: LogEntry) {
    try {
      const logs = this.getLocalStorageLogs()
      logs.push(entry)
      
      // 限制日志数量
      if (logs.length > this.config.maxLocalStorageLogs) {
        logs.splice(0, logs.length - this.config.maxLocalStorageLogs)
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs))
    } catch (e) {
      console.error('Failed to save log to localStorage:', e)
    }
  }

  // 获取本地存储的日志
  public getLocalStorageLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('app_logs')
      return logs ? JSON.parse(logs) : []
    } catch (e) {
      console.error('Failed to get logs from localStorage:', e)
      return []
    }
  }

  // 清除本地日志
  public clearLocalStorageLogs() {
    localStorage.removeItem('app_logs')
    this.info('Logger', 'Local storage logs cleared')
  }

  // 发送到远程服务器
  private async sendToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
    } catch (e) {
      console.error('Failed to send log to remote:', e)
    }
  }

  // 公共日志方法
  public debug(module: string, message: string, metadata?: any) {
    this.log(LogLevel.DEBUG, module, message, metadata)
  }

  public info(module: string, message: string, metadata?: any) {
    this.log(LogLevel.INFO, module, message, metadata)
  }

  public warn(module: string, message: string, metadata?: any) {
    this.log(LogLevel.WARN, module, message, metadata)
  }

  public error(module: string, message: string, error?: Error | any, metadata?: any) {
    this.log(LogLevel.ERROR, module, message, metadata, error)
  }

  public fatal(module: string, message: string, error?: Error | any, metadata?: any) {
    this.log(LogLevel.FATAL, module, message, metadata, error)
  }

  // 性能计时
  public time(label: string) {
    this.timers.set(label, performance.now())
    this.debug('Performance', `Timer started: ${label}`)
  }

  public timeEnd(label: string, metadata?: any) {
    const start = this.timers.get(label)
    if (!start) {
      this.warn('Performance', `Timer not found: ${label}`)
      return
    }

    const duration = performance.now() - start
    this.timers.delete(label)

    const level = duration > this.config.performanceThreshold! ? LogLevel.WARN : LogLevel.INFO
    this.log(level, 'Performance', `Timer ended: ${label}`, {
      ...metadata,
      duration: `${duration.toFixed(2)}ms`,
      durationMs: duration,
    })

    return duration
  }

  // 分组日志
  public group(module: string, groupName: string) {
    if (this.config.enableConsole && this.config.verbose) {
      console.group(`[${module}] ${groupName}`)
    }
    this.debug(module, `Group started: ${groupName}`)
  }

  public groupEnd(module: string, groupName: string) {
    if (this.config.enableConsole && this.config.verbose) {
      console.groupEnd()
    }
    this.debug(module, `Group ended: ${groupName}`)
  }

  // 表格输出
  public table(module: string, data: any[], columns?: string[]) {
    if (this.config.enableConsole) {
      console.table(data, columns)
    }
    this.info(module, 'Table data', { data, columns })
  }

  // API日志
  public logApiRequest(method: string, url: string, data?: any, headers?: any) {
    const requestId = this.generateRequestId()
    this.info('API', `${method} ${url}`, {
      requestId,
      method,
      url,
      data,
      headers,
    })
    return requestId
  }

  public logApiResponse(requestId: string, status: number, data?: any, duration?: number) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO
    this.log(level, 'API', `Response ${status}`, {
      requestId,
      status,
      data,
      duration: duration ? `${duration}ms` : undefined,
    })
  }

  public logApiError(requestId: string, error: any) {
    this.error('API', 'Request failed', error, { requestId })
  }

  // WebSocket日志
  public logWsConnect(url: string) {
    this.info('WebSocket', `Connected to ${url}`)
  }

  public logWsDisconnect(url: string, reason?: string) {
    this.warn('WebSocket', `Disconnected from ${url}`, { reason })
  }

  public logWsMessage(direction: 'send' | 'receive', data: any) {
    this.debug('WebSocket', `Message ${direction}`, { data })
  }

  public logWsError(error: any) {
    this.error('WebSocket', 'WebSocket error', error)
  }

  // 用户操作日志
  public logUserAction(action: string, target?: string, metadata?: any) {
    this.info('UserAction', action, {
      target,
      ...metadata,
    })
  }

  // 页面性能日志
  public logPagePerformance() {
    if (!window.performance) return

    const perfData = window.performance.timing
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
    const connectTime = perfData.responseEnd - perfData.requestStart
    const renderTime = perfData.domComplete - perfData.domLoading

    this.info('Performance', 'Page performance metrics', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
      domContentLoaded: `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
    })
  }

  // 设置全局错误处理
  private setupGlobalErrorHandler() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return // 服务端渲染时跳过window操作
    }
    
    window.addEventListener('error', (event) => {
      this.error('Global', 'Uncaught error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Global', 'Unhandled promise rejection', new Error(event.reason), {
        reason: event.reason,
      })
    })
  }

  // 设置性能观察器
  private setupPerformanceObserver() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || !window.PerformanceObserver) return

    try {
      // 监控长任务
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.warn('Performance', 'Long task detected', {
              duration: `${entry.duration.toFixed(2)}ms`,
              name: entry.name,
              startTime: entry.startTime,
            })
          }
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })

      // 监控资源加载
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming
          if (resourceEntry.duration > this.config.performanceThreshold!) {
            this.warn('Performance', 'Slow resource loading', {
              name: resourceEntry.name,
              duration: `${resourceEntry.duration.toFixed(2)}ms`,
              type: resourceEntry.initiatorType,
            })
          }
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
    } catch (e) {
      console.warn('Failed to setup performance observer:', e)
    }
  }

  // 获取日志统计
  public getStats(): any {
    const logs = this.getLocalStorageLogs()
    const stats = {
      total: logs.length,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
      modules: new Set<string>(),
      recentErrors: [] as LogEntry[],
    }

    logs.forEach(log => {
      switch (log.level) {
        case LogLevel.DEBUG: stats.debug++; break
        case LogLevel.INFO: stats.info++; break
        case LogLevel.WARN: stats.warn++; break
        case LogLevel.ERROR: stats.error++; break
        case LogLevel.FATAL: stats.fatal++; break
      }
      if (log.module) stats.modules.add(log.module)
      if (log.level >= LogLevel.ERROR) {
        stats.recentErrors.push(log)
      }
    })

    stats.recentErrors = stats.recentErrors.slice(-10)
    return stats
  }

  // 导出日志
  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLocalStorageLogs()
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2)
    } else {
      // CSV格式
      const headers = ['timestamp', 'level', 'module', 'message', 'userId', 'sessionId', 'url']
      const rows = logs.map(log => [
        log.timestamp,
        log.levelName,
        log.module || '',
        log.message,
        log.userId || '',
        log.sessionId,
        log.url || '',
      ])
      
      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
    }
  }
}

// 创建单例实例
const logger = new Logger()

// 导出实例和类型
export default logger
export { Logger }