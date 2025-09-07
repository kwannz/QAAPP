/**
 * Verbose Logging Service for Backend API
 * 
 * Provides comprehensive logging capabilities with database tracking,
 * performance monitoring, and structured log output
 */

import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
  VERBOSE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  CRITICAL = 5
}

export interface DatabaseOperation {
  operation: string;
  table: string;
  query?: string;
  parameters?: any[];
  executionTime: number;
  rowsAffected?: number;
  success: boolean;
  error?: string;
}

export interface ApiRequestInfo {
  method: string;
  url: string;
  headers?: Record<string, string>;
  body?: any;
  userId?: string;
  ip?: string;
  userAgent?: string;
  responseStatus?: number;
  responseTime?: number;
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  module: string;
  message: string;
  data?: any;
  requestId?: string;
  userId?: string;
  sessionId: string;
  performanceMetrics?: {
    cpuUsage?: number;
    memoryUsage?: number;
    heapUsed?: number;
    heapTotal?: number;
    external?: number;
    arrayBuffers?: number;
  };
  databaseMetrics?: DatabaseOperation;
  apiMetrics?: ApiRequestInfo;
}

@Injectable()
export class VerboseLoggerService implements LoggerService {
  private logLevel: LogLevel;
  private enableFileOutput: boolean;
  private enableDatabaseLogging: boolean;
  private logDirectory: string;
  private sessionId: string;
  private performanceTracker = new Map<string, number>();

  constructor(private configService: ConfigService) {
    this.logLevel = this.getLogLevelFromConfig();
    this.enableFileOutput = this.configService.get('ENABLE_FILE_LOGGING', 'true') === 'true';
    this.enableDatabaseLogging = this.configService.get('ENABLE_DB_LOGGING', 'true') === 'true';
    this.logDirectory = path.resolve(process.cwd(), 'logs');
    this.sessionId = this.generateSessionId();
    
    this.ensureLogDirectory();
    this.info('VerboseLogger', 'Backend verbose logger initialized', {
      logLevel: LogLevel[this.logLevel],
      fileOutput: this.enableFileOutput,
      dbLogging: this.enableDatabaseLogging,
      sessionId: this.sessionId
    });
  }

  private getLogLevelFromConfig(): LogLevel {
    const level = this.configService.get('LOG_LEVEL', 'INFO').toUpperCase();
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
    return `api-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLogEntry(logEntry: LogEntry): string {
    const timestamp = logEntry.timestamp.toISOString();
    const level = LogLevel[logEntry.level].padEnd(8);
    const module = logEntry.module.padEnd(15);
    
    let formatted = `[${timestamp}] [${level}] [${module}] ${logEntry.message}`;
    
    if (logEntry.requestId) {
      formatted += ` [REQ:${logEntry.requestId}]`;
    }
    
    if (logEntry.userId) {
      formatted += ` [USER:${logEntry.userId}]`;
    }

    if (logEntry.data) {
      try {
        formatted += `\n${JSON.stringify(logEntry.data, null, 2)}`;
      } catch (error) {
        formatted += `\n[DATA SERIALIZATION ERROR: ${error instanceof Error ? error.message : String(error)}]`;
      }
    }

    return formatted;
  }

  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case LogLevel.VERBOSE: return '\x1b[90m'; // Grey
      case LogLevel.DEBUG: return '\x1b[36m';   // Cyan
      case LogLevel.INFO: return '\x1b[32m';    // Green
      case LogLevel.WARN: return '\x1b[33m';    // Yellow
      case LogLevel.ERROR: return '\x1b[31m';   // Red
      case LogLevel.CRITICAL: return '\x1b[41m\x1b[37m'; // Red background, white text
      default: return '\x1b[0m'; // Reset
    }
  }

  private getPerformanceMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memoryUsage: memUsage.rss,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      external: memUsage.external,
      arrayBuffers: memUsage.arrayBuffers,
      cpuUsage: cpuUsage.user + cpuUsage.system,
    };
  }

  private async writeToFile(logEntry: LogEntry): Promise<void> {
    if (!this.enableFileOutput) return;

    try {
      const date = new Date().toISOString().split('T')[0];
      const filename = `app-verbose-${date}.log`;
      const filepath = path.join(this.logDirectory, filename);
      
      const logLine = this.formatLogEntry(logEntry) + '\n';
      await fs.promises.appendFile(filepath, logLine);

      // Special files for specific log types
      if (logEntry.databaseMetrics) {
        const dbLogFile = path.join(this.logDirectory, `database-${date}.log`);
        const dbLogLine = JSON.stringify({
          timestamp: logEntry.timestamp,
          ...logEntry.databaseMetrics
        }) + '\n';
        await fs.promises.appendFile(dbLogFile, dbLogLine);
      }

      if (logEntry.apiMetrics) {
        const apiLogFile = path.join(this.logDirectory, `api-requests-${date}.log`);
        const apiLogLine = JSON.stringify({
          timestamp: logEntry.timestamp,
          ...logEntry.apiMetrics
        }) + '\n';
        await fs.promises.appendFile(apiLogFile, apiLogLine);
      }

    } catch (error) {
      // Silent fail for file logging
      console.error('[LOG FILE ERROR]', error instanceof Error ? error.message : String(error));
    }
  }

  private createLogEntry(
    level: LogLevel,
    module: string,
    message: string,
    data?: any,
    requestId?: string,
    userId?: string
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      module,
      message,
      data,
      requestId,
      userId,
      sessionId: this.sessionId,
      performanceMetrics: this.getPerformanceMetrics(),
    };
  }

  private async processLogEntry(logEntry: LogEntry): Promise<void> {
    if (!this.shouldLog(logEntry.level)) return;

    // Console output with colors
    const color = this.getConsoleColor(logEntry.level);
    const reset = '\x1b[0m';
    const formattedMessage = this.formatLogEntry(logEntry);
    
    console.log(`${color}${formattedMessage}${reset}`);

    // File output
    await this.writeToFile(logEntry);
  }

  // Standard logging methods
  async verbose(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.VERBOSE, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  async debug(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.DEBUG, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  async info(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.INFO, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  async warn(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.WARN, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  async error(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.ERROR, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  async critical(module: string, message: string, data?: any, requestId?: string, userId?: string): Promise<void> {
    const logEntry = this.createLogEntry(LogLevel.CRITICAL, module, message, data, requestId, userId);
    await this.processLogEntry(logEntry);
  }

  // NestJS LoggerService interface implementation
  log(message: string, context?: string): void {
    this.info(context || 'App', message);
  }

  // Performance tracking
  startTiming(operation: string): void {
    this.performanceTracker.set(operation, Date.now());
    this.verbose('Performance', `Started timing: ${operation}`);
  }

  async endTiming(operation: string, module: string = 'Performance', data?: any): Promise<number> {
    const startTime = this.performanceTracker.get(operation);
    if (!startTime) {
      await this.warn('Performance', `No start time found for operation: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.performanceTracker.delete(operation);

    await this.info(module, `${operation} completed in ${duration}ms`, {
      operation,
      duration,
      ...data
    });

    return duration;
  }

  // Database operation tracking
  async trackDatabaseOperation(
    operation: string,
    table: string,
    query?: string,
    parameters?: any[],
    executionTime?: number,
    rowsAffected?: number,
    error?: Error
  ): Promise<void> {
    const dbOperation: DatabaseOperation = {
      operation,
      table,
      query,
      parameters,
      executionTime: executionTime || 0,
      rowsAffected,
      success: !error,
      error: error?.message
    };

    const logEntry = this.createLogEntry(
      error ? LogLevel.ERROR : LogLevel.VERBOSE,
      'Database',
      `${operation} on ${table}${error ? ` FAILED: ${error.message}` : ` completed in ${executionTime}ms`}`,
      { rows: rowsAffected }
    );

    logEntry.databaseMetrics = dbOperation;
    await this.processLogEntry(logEntry);
  }

  // API request tracking
  async trackApiRequest(apiInfo: ApiRequestInfo): Promise<void> {
    const level = apiInfo.responseStatus && apiInfo.responseStatus >= 400 ? LogLevel.WARN : LogLevel.INFO;
    const message = `${apiInfo.method} ${apiInfo.url} - ${apiInfo.responseStatus}${
      apiInfo.responseTime ? ` (${apiInfo.responseTime}ms)` : ''
    }`;

    const logEntry = this.createLogEntry(
      level,
      'API',
      message,
      {
        headers: apiInfo.headers,
        body: apiInfo.body,
        ip: apiInfo.ip,
        userAgent: apiInfo.userAgent
      },
      undefined,
      apiInfo.userId
    );

    logEntry.apiMetrics = apiInfo;
    await this.processLogEntry(logEntry);
  }

  // Transaction tracking
  async trackTransaction(
    transactionId: string,
    operation: string,
    startTime: number,
    success: boolean,
    error?: Error
  ): Promise<void> {
    const duration = Date.now() - startTime;
    const level = success ? LogLevel.INFO : LogLevel.ERROR;
    
    await this.processLogEntry({
      ...this.createLogEntry(
        level,
        'Transaction',
        `${operation} ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`,
        {
          transactionId,
          duration,
          error: error?.message,
          stack: error?.stack
        }
      )
    });
  }

  // User action tracking
  async trackUserAction(userId: string, action: string, resource: string, data?: any): Promise<void> {
    await this.info('UserAction', `User ${userId} performed ${action} on ${resource}`, {
      userId,
      action,
      resource,
      timestamp: Date.now(),
      ...data
    });
  }

  // System health monitoring
  async logSystemHealth(): Promise<void> {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    await this.verbose('SystemHealth', 'System health check', {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      uptime: `${Math.round(process.uptime())}s`,
      version: process.version,
      pid: process.pid
    });
  }

  // Get system statistics
  getSystemStats(): any {
    return {
      sessionId: this.sessionId,
      logLevel: LogLevel[this.logLevel],
      fileLogging: this.enableFileOutput,
      databaseLogging: this.enableDatabaseLogging,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage()
    };
  }

  // Error tracking with context
  async trackError(error: Error, module: string, context?: any, requestId?: string, userId?: string): Promise<void> {
    await this.error(module, `Error: ${error.message}`, {
      error: error.name,
      message: error.message,
      stack: error.stack,
      context
    }, requestId, userId);
  }
}