/* eslint-disable no-console, no-magic-numbers */
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
  enableDeduplication: boolean // 新增去重功能
  environment: 'development' | 'production' | 'test' // 新增环境感知
}

class Logger {
  private config: LoggerConfig = {
    level: (() => {
      const env = process.env.NODE_ENV;
      switch (env) {
        case 'development': return LogLevel.DEBUG;
        case 'test': return LogLevel.WARN;
        case 'production': return LogLevel.ERROR;
        default: return LogLevel.INFO;
      }
    })(),
    enableConsole: true,
    enableRemote: process.env.NODE_ENV === 'production',
    enableLocalStorage: process.env.NODE_ENV !== 'production',
    maxLocalStorageLogs: 1000,
    verbose: process.env.NODE_ENV === 'development',
    performanceThreshold: 1000, // ms
    enableDeduplication: true,
    environment: (process.env.NODE_ENV as any) || 'development',
  };

  private logBuffer: LogEntry[] = [];
  private timers: Map<string, number> = new Map();
  private sessionId: string;
  private userId?: string;
  private loggedMessages: Set<string> = new Set(); // 用于去重

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadConfig();
    this.setupGlobalErrorHandler();
    this.setupPerformanceObserver();
  }

  // 根据环境获取默认日志级别
  private static getEnvironmentLogLevel(): LogLevel {
    const env = process.env.NODE_ENV;
    switch (env) {
      case 'development':
        return LogLevel.DEBUG;
      case 'test':
        return LogLevel.WARN;
      case 'production':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  // 加载配置
  private loadConfig() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return; // 服务端渲染时跳过localStorage操作
    }

    const savedConfig = localStorage.getItem('logger_config');
    if (savedConfig) {
      try {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      } catch (error) {
        console.error('Failed to load logger config:', error);
      }
    }
  }

  // 保存配置
  public setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
    localStorage.setItem('logger_config', JSON.stringify(this.config));
    this.log(LogLevel.INFO, 'Logger', 'Config updated', { config: this.config });
  }

  // 设置用户ID
  public setUserId(userId: string) {
    this.userId = userId;
    this.log(LogLevel.INFO, 'Logger', 'User ID set', { userId });
  }

  // 生成会话ID
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  // 生成请求ID
  public generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  }

  // 核心日志方法
  private log(
    level: LogLevel,
    module: string,
    message: string,
    metadata?: any,
    error?: Error,
  ) {
    if (level < this.config.level) return;

    // 检查去重
    if (this.config.enableDeduplication) {
      const messageKey = `${level}-${module}-${message}`;
      if (this.loggedMessages.has(messageKey)) {
        return; // 跳过重复消息
      }
      this.loggedMessages.add(messageKey);
      
      // 限制去重缓存大小
      if (this.loggedMessages.size > 500) {
        // 清空一半缓存
        const messages = Array.from(this.loggedMessages);
        this.loggedMessages.clear();
        messages.slice(-250).forEach(msg => this.loggedMessages.add(msg));
      }
    }

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
    };

    // 控制台输出
    if (this.config.enableConsole) {
      this.consoleLog(entry);
    }

    // 保存到本地存储
    if (this.config.enableLocalStorage) {
      this.saveToLocalStorage(entry);
    }

    // 发送到远程服务器
    if (this.config.enableRemote) {
      this.sendToRemote(entry);
    }

    // 添加到缓冲区
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 100) {
      this.logBuffer.shift();
    }
  }

  // 控制台输出
  private consoleLog(entry: LogEntry) {
    const style = this.getConsoleStyle(entry.level);
    const prefix = `[${entry.levelName}] [${entry.module}]`;

    if (this.config.verbose) {
      console.groupCollapsed(
        `%c${prefix} ${entry.message}`,
        style,
      );
      console.log('Timestamp:', entry.timestamp);
      console.log('Session:', entry.sessionId);
      if (entry.userId) console.log('User:', entry.userId);
      if (entry.metadata) console.log('Metadata:', entry.metadata);
      if (entry.error) console.error('Error:', entry.error);
      if (entry.stack) console.log('Stack:', entry.stack);
      console.log('URL:', entry.url);
      console.groupEnd();
    } else {
      const logFunction = this.getConsoleFunction(entry.level);
      logFunction(`%c${prefix}`, style, entry.message, entry.metadata || '');
    }
  }

  // 获取控制台样式
  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG: {
        return 'color: #6B7280; font-weight: normal;';
      }
      case LogLevel.INFO: {
        return 'color: #3B82F6; font-weight: normal;';
      }
      case LogLevel.WARN: {
        return 'color: #F59E0B; font-weight: bold;';
      }
      case LogLevel.ERROR: {
        return 'color: #EF4444; font-weight: bold;';
      }
      case LogLevel.FATAL: {
        return 'color: #FFFFFF; background-color: #DC2626; font-weight: bold; padding: 2px 4px;';
      }
      default: {
        return '';
      }
    }
  }

  // 获取控制台函数
  private getConsoleFunction(level: LogLevel): (...arguments_: any[]) => void {
    switch (level) {
      case LogLevel.DEBUG: {
        return console.debug;
      }
      case LogLevel.INFO: {
        return console.info;
      }
      case LogLevel.WARN: {
        return console.warn;
      }
      case LogLevel.ERROR:
      case LogLevel.FATAL: {
        return console.error;
      }
      default: {
        return console.log;
      }
    }
  }

  // 保存到本地存储
  private saveToLocalStorage(entry: LogEntry) {
    try {
      const logs = this.getLocalStorageLogs();
      logs.push(entry);

      // 限制日志数量
      if (logs.length > this.config.maxLocalStorageLogs) {
        logs.splice(0, logs.length - this.config.maxLocalStorageLogs);
      }

      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to save log to localStorage:', error);
    }
  }

  // 获取本地存储的日志
  public getLocalStorageLogs(): LogEntry[] {
    try {
      const logs = localStorage.getItem('app_logs');
      return logs ? JSON.parse(logs) : [];
    } catch (error) {
      console.error('Failed to get logs from localStorage:', error);
      return [];
    }
  }

  // 清除本地日志
  public clearLocalStorageLogs() {
    localStorage.removeItem('app_logs');
    this.info('Logger', 'Local storage logs cleared');
  }

  // 发送到远程服务器
  private async sendToRemote(entry: LogEntry) {
    if (!this.config.remoteEndpoint) return;

    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      console.error('Failed to send log to remote:', error);
    }
  }

  // 公共日志方法
  public debug(module: string, message: string, metadata?: any) {
    this.log(LogLevel.DEBUG, module, message, metadata);
  }

  public info(module: string, message: string, metadata?: any) {
    this.log(LogLevel.INFO, module, message, metadata);
  }

  public warn(module: string, message: string, metadata?: any) {
    this.log(LogLevel.WARN, module, message, metadata);
  }

  public error(module: string, message: string, error?: Error | any, metadata?: any) {
    this.log(LogLevel.ERROR, module, message, metadata, error);
  }

  public fatal(module: string, message: string, error?: Error | any, metadata?: any) {
    this.log(LogLevel.FATAL, module, message, metadata, error);
  }

  // 性能计时
  public time(label: string) {
    this.timers.set(label, performance.now());
    this.debug('Performance', `Timer started: ${label}`);
  }

  public timeEnd(label: string, metadata?: any) {
    const start = this.timers.get(label);
    if (!start) {
      this.warn('Performance', `Timer not found: ${label}`);
      return;
    }

    const duration = performance.now() - start;
    this.timers.delete(label);

    const level = duration > this.config.performanceThreshold ? LogLevel.WARN : LogLevel.INFO;
    this.log(level, 'Performance', `Timer ended: ${label}`, {
      ...metadata,
      duration: `${duration.toFixed(2)}ms`,
      durationMs: duration,
    });

    return duration;
  }

  // 分组日志
  public group(module: string, groupName: string) {
    if (this.config.enableConsole && this.config.verbose) {
      console.group(`[${module}] ${groupName}`);
    }
    this.debug(module, `Group started: ${groupName}`);
  }

  public groupEnd(module: string, groupName: string) {
    if (this.config.enableConsole && this.config.verbose) {
      console.groupEnd();
    }
    this.debug(module, `Group ended: ${groupName}`);
  }

  // 表格输出
  public table(module: string, data: any[], columns?: string[]) {
    if (this.config.enableConsole) {
      console.table(data, columns);
    }
    this.info(module, 'Table data', { data, columns });
  }

  // API日志
  public logApiRequest(method: string, url: string, data?: any, headers?: any) {
    const requestId = this.generateRequestId();
    this.info('API', `${method} ${url}`, {
      requestId,
      method,
      url,
      data,
      headers,
    });
    return requestId;
  }

  public logApiResponse(requestId: string, status: number, data?: any, duration?: number) {
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'API', `Response ${status}`, {
      requestId,
      status,
      data,
      duration: duration ? `${duration}ms` : undefined,
    });
  }

  public logApiError(requestId: string, error: any) {
    this.error('API', 'Request failed', error, { requestId });
  }

  // WebSocket日志
  public logWsConnect(url: string) {
    this.info('WebSocket', `Connected to ${url}`);
  }

  public logWsDisconnect(url: string, reason?: string) {
    this.warn('WebSocket', `Disconnected from ${url}`, { reason });
  }

  public logWsMessage(direction: 'send' | 'receive', data: any) {
    this.debug('WebSocket', `Message ${direction}`, { data });
  }

  public logWsError(error: any) {
    this.error('WebSocket', 'WebSocket error', error);
  }

  // 用户操作日志
  public logUserAction(action: string, target?: string, metadata?: any) {
    this.info('UserAction', action, {
      target,
      ...metadata,
    });
  }

  // 页面性能日志
  public logPagePerformance() {
    if (!window.performance) return;

    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    const connectTime = perfData.responseEnd - perfData.requestStart;
    const renderTime = perfData.domComplete - perfData.domLoading;

    this.info('Performance', 'Page performance metrics', {
      pageLoadTime: `${pageLoadTime}ms`,
      connectTime: `${connectTime}ms`,
      renderTime: `${renderTime}ms`,
      domContentLoaded: `${perfData.domContentLoadedEventEnd - perfData.navigationStart}ms`,
    });
  }

  // 设置全局错误处理
  private setupGlobalErrorHandler() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined') {
      return; // 服务端渲染时跳过window操作
    }

    window.addEventListener('error', (event) => {
      this.error('Global', 'Uncaught error', event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Global', 'Unhandled promise rejection', new Error(event.reason), {
        reason: event.reason,
      });
    });
  }

  // 设置性能观察器
  private setupPerformanceObserver() {
    // 检查是否在浏览器环境
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      // 监控长任务
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) {
            this.warn('Performance', 'Long task detected', {
              duration: `${entry.duration.toFixed(2)}ms`,
              name: entry.name,
              startTime: entry.startTime,
            });
          }
        }
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // 监控资源加载
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming;
          if (resourceEntry.duration > this.config.performanceThreshold) {
            this.warn('Performance', 'Slow resource loading', {
              name: resourceEntry.name,
              duration: `${resourceEntry.duration.toFixed(2)}ms`,
              type: resourceEntry.initiatorType,
            });
          }
        }
      });
      resourceObserver.observe({ entryTypes: ['resource'] });
    } catch (error) {
      console.warn('Failed to setup performance observer:', error);
    }
  }

  // 获取日志统计
  public getStats(): any {
    const logs = this.getLocalStorageLogs();
    const stats = {
      total: logs.length,
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0,
      modules: new Set<string>(),
      recentErrors: [] as LogEntry[],
    };

    for (const log of logs) {
      switch (log.level) {
        case LogLevel.DEBUG: { stats.debug++; break;
        }
        case LogLevel.INFO: { stats.info++; break;
        }
        case LogLevel.WARN: { stats.warn++; break;
        }
        case LogLevel.ERROR: { stats.error++; break;
        }
        case LogLevel.FATAL: { stats.fatal++; break;
        }
      }
      if (log.module) stats.modules.add(log.module);
      if (log.level >= LogLevel.ERROR) {
        stats.recentErrors.push(log);
      }
    }

    stats.recentErrors = stats.recentErrors.slice(-10);
    return stats;
  }

  // 导出日志
  public exportLogs(format: 'json' | 'csv' = 'json'): string {
    const logs = this.getLocalStorageLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    }

      // CSV格式
      const headers = ['timestamp', 'level', 'module', 'message', 'userId', 'sessionId', 'url'];
      const rows = logs.map(log => [
        log.timestamp,
        log.levelName,
        log.module || '',
        log.message,
        log.userId || '',
        log.sessionId,
        log.url || '',
      ]);

      return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      ].join('\n');
  }

  // Web3 专用日志方法
  public logWalletConnection(address: string, chainId: number) {
    this.info('Wallet', `Connected: ${address}`, { address, chainId });
  }

  public logWalletDisconnection() {
    this.info('Wallet', 'Disconnected');
  }

  public logTransactionStart(hash: string, type: string) {
    this.info('Transaction', `Started: ${type}`, { hash, type });
  }

  public logTransactionSuccess(hash: string, type: string) {
    this.info('Transaction', `Success: ${type}`, { hash, type });
  }

  public logTransactionError(error: any, type: string) {
    this.error('Transaction', `Failed: ${type}`, error, { type });
  }

  public logContractCall(contractName: string, method: string, args?: any[]) {
    this.debug('Contract', `Call: ${contractName}.${method}`, { contractName, method, args });
  }

  // 清除去重缓存的方法
  public clearDeduplicationCache() {
    this.loggedMessages.clear();
    this.debug('Logger', 'Deduplication cache cleared');
  }
}

// 创建单例实例
const logger = new Logger();

// 导出实例和类型
export default logger;
export { Logger };
