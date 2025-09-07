/* eslint-disable no-magic-numbers */
/**
 * Verbose Logging System for Frontend
 * 
 * Provides detailed logging capabilities with multiple levels and output formats
 * Supports console output with colors, file output, and centralized log management
 */

export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  CRITICAL = 5
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  userId?: string;
  sessionId: string;
  performanceMetrics?: {
    startTime?: number;
    endTime?: number;
    duration?: number;
    memoryUsage?: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enablePerformanceTracking: boolean;
  maxLogSize: number;
  modules: string[];
  sessionId: string;
}

class VerboseLogger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private performanceMarks = new Map<string, number>();
  
  constructor(config?: Partial<LoggerConfig>) {
    this.config = {
      level: this.getLogLevelFromEnv(),
      enableConsole: true,
      enablePerformanceTracking: true,
      maxLogSize: 1000,
      modules: [],
      sessionId: this.generateSessionId(),
      ...config,
    };

    this.info('VerboseLogger', 'Logger initialized', { config: this.config });
  }

  private getLogLevelFromEnv(): LogLevel {
    if (typeof window === 'undefined') return LogLevel.INFO;
    
    const level = process.env.NEXT_PUBLIC_LOG_LEVEL?.toUpperCase();
    switch (level) {
      case 'VERBOSE': return LogLevel.VERBOSE;
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'CRITICAL': return LogLevel.CRITICAL;
      default: return LogLevel.INFO;
    }
  }

  private generateSessionId(): string {
    return `web-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private shouldLog(level: LogLevel, module: string): boolean {
    if (level < this.config.level) return false;
    if (this.config.modules.length > 0 && !this.config.modules.includes(module)) {
      return false;
    }
    return true;
  }

  private formatMessage(level: LogLevel, module: string, message: string): string {
    const timestamp = new Date().toISOString();
    const levelStr = LogLevel[level].padEnd(8);
    const moduleStr = module.padEnd(15);
    return `[${timestamp}] [${levelStr}] [${moduleStr}] ${message}`;
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case LogLevel.VERBOSE:
        return 'color: #888; font-size: 11px;';
      case LogLevel.DEBUG:
        return 'color: #007ACC; font-weight: normal;';
      case LogLevel.INFO:
        return 'color: #28a745; font-weight: normal;';
      case LogLevel.WARN:
        return 'color: #ffc107; font-weight: bold;';
      case LogLevel.ERROR:
        return 'color: #dc3545; font-weight: bold;';
      case LogLevel.CRITICAL:
        return 'color: #ffffff; background-color: #dc3545; font-weight: bold; padding: 2px 4px;';
      default:
        return '';
    }
  }

  private log(level: LogLevel, module: string, message: string, data?: any): void {
    if (!this.shouldLog(level, module)) return;

    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      module,
      message,
      data,
      sessionId: this.config.sessionId,
      performanceMetrics: this.getPerformanceMetrics(),
    };

    this.logs.push(logEntry);

    // Keep logs within size limit
    if (this.logs.length > this.config.maxLogSize) {
      this.logs = this.logs.slice(-this.config.maxLogSize);
    }

    if (this.config.enableConsole && typeof window !== 'undefined') {
      const formattedMessage = this.formatMessage(level, module, message);
      const style = this.getConsoleStyle(level);
      // eslint-disable-next-line no-console
      if (data) {
        // eslint-disable-next-line no-console
        console.log(`%c${formattedMessage}`, style, data);
      } else {
        // eslint-disable-next-line no-console
        console.log(`%c${formattedMessage}`, style);
      }
    }

    // Send critical logs to monitoring service
    if (level >= LogLevel.ERROR) {
      this.sendToMonitoring(logEntry);
    }
  }

  private getPerformanceMetrics() {
    if (!this.config.enablePerformanceTracking || typeof window === 'undefined') return;

    return {
      memoryUsage: (performance as any)?.memory?.usedJSHeapSize || 0,
    };
  }

  private sendToMonitoring(logEntry: LogEntry): void {
    // In a real implementation, this would send to a monitoring service
    try {
      if (typeof window !== 'undefined' && navigator.sendBeacon) {
        const payload = JSON.stringify(logEntry);
        navigator.sendBeacon('/api/monitoring/logs', payload);
      }
    } catch {
      // Silent fail for monitoring
    }
  }

  // Public logging methods
  verbose(module: string, message: string, data?: any): void {
    this.log(LogLevel.VERBOSE, module, message, data);
  }

  debug(module: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, module, message, data);
  }

  info(module: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, module, message, data);
  }

  warn(module: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, module, message, data);
  }

  error(module: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, module, message, data);
  }

  critical(module: string, message: string, data?: any): void {
    this.log(LogLevel.CRITICAL, module, message, data);
  }

  // Performance tracking methods
  startTiming(operation: string): void {
    if (this.config.enablePerformanceTracking && typeof performance !== 'undefined') {
      this.performanceMarks.set(operation, performance.now());
      this.verbose('Performance', `Started timing: ${operation}`);
    }
  }

  endTiming(operation: string, module: string = 'Performance'): number | undefined {
    if (!this.config.enablePerformanceTracking || typeof performance === 'undefined') return;

    const startTime = this.performanceMarks.get(operation);
    if (startTime === undefined) {
      this.warn('Performance', `No start time found for operation: ${operation}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    
    this.performanceMarks.delete(operation);
    
    this.info(module, `${operation} completed in ${duration.toFixed(2)}ms`, {
      operation,
      duration,
      startTime,
      endTime,
    });

    return duration;
  }

  // Database operation tracking
  trackDatabaseOperation(operation: string, table: string, data?: any): void {
    this.verbose('Database', `${operation} on ${table}`, data);
  }

  // API request tracking
  trackApiRequest(method: string, url: string, statusCode?: number, duration?: number): void {
    const level = statusCode && statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
    this.log(level, 'API', `${method} ${url} - ${statusCode}${duration ? ` (${duration.toFixed(2)}ms)` : ''}`, {
      method,
      url,
      statusCode,
      duration,
    });
  }

  // User action tracking
  trackUserAction(action: string, component: string, data?: any): void {
    this.info('UserAction', `${action} in ${component}`, {
      action,
      component,
      timestamp: Date.now(),
      ...data,
    });
  }

  // Error tracking with stack trace
  trackError(error: Error, module: string, context?: any): void {
    this.error(module, error.message, {
      error: error.name,
      stack: error.stack,
      context,
    });
  }

  // Get logs for analysis
  getLogs(level?: LogLevel, module?: string): LogEntry[] {
    let filteredLogs = this.logs;

    if (level !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.level >= level);
    }

    if (module) {
      filteredLogs = filteredLogs.filter(log => log.module === module);
    }

    return filteredLogs;
  }

  // Export logs for analysis
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
    this.info('VerboseLogger', 'Logs cleared');
  }

  // Get system stats
  getStats(): any {
    const stats = {
      totalLogs: this.logs.length,
      sessionId: this.config.sessionId,
      logsByLevel: {} as Record<string, number>,
      logsByModule: {} as Record<string, number>,
      startTime: this.logs[0]?.timestamp,
      lastLogTime: this.logs[this.logs.length - 1]?.timestamp,
    };

    this.logs.forEach(log => {
      const levelName = LogLevel[log.level];
      stats.logsByLevel[levelName] = (stats.logsByLevel[levelName] || 0) + 1;
      stats.logsByModule[log.module] = (stats.logsByModule[log.module] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
export const logger = new VerboseLogger();

// Export helper functions for easy import
export const verbose = (module: string, message: string, data?: any) => logger.verbose(module, message, data);
export const debug = (module: string, message: string, data?: any) => logger.debug(module, message, data);
export const info = (module: string, message: string, data?: any) => logger.info(module, message, data);
export const warn = (module: string, message: string, data?: any) => logger.warn(module, message, data);
export const error = (module: string, message: string, data?: any) => logger.error(module, message, data);
export const critical = (module: string, message: string, data?: any) => logger.critical(module, message, data);

export const startTiming = (operation: string) => logger.startTiming(operation);
export const endTiming = (operation: string, module?: string) => logger.endTiming(operation, module);

export const trackDatabaseOperation = (operation: string, table: string, data?: any) => 
  logger.trackDatabaseOperation(operation, table, data);
export const trackApiRequest = (method: string, url: string, statusCode?: number, duration?: number) => 
  logger.trackApiRequest(method, url, statusCode, duration);
export const trackUserAction = (action: string, component: string, data?: any) => 
  logger.trackUserAction(action, component, data);
export const trackError = (error: Error, module: string, context?: any) => 
  logger.trackError(error, module, context);

// Window global for debugging
if (typeof window !== 'undefined') {
  (window as any).QALogger = logger;
}

export default logger;
