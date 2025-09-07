"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerboseLoggerService = exports.LogLevel = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["VERBOSE"] = 0] = "VERBOSE";
    LogLevel[LogLevel["DEBUG"] = 1] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 5] = "CRITICAL";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
let VerboseLoggerService = class VerboseLoggerService {
    constructor(configService) {
        this.configService = configService;
        this.performanceTracker = new Map();
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
    getLogLevelFromConfig() {
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
    generateSessionId() {
        return `api-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    }
    ensureLogDirectory() {
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }
    }
    shouldLog(level) {
        return level >= this.logLevel;
    }
    formatLogEntry(logEntry) {
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
            }
            catch (error) {
                formatted += `\n[DATA SERIALIZATION ERROR: ${error instanceof Error ? error.message : String(error)}]`;
            }
        }
        return formatted;
    }
    getConsoleColor(level) {
        switch (level) {
            case LogLevel.VERBOSE: return '\x1b[90m';
            case LogLevel.DEBUG: return '\x1b[36m';
            case LogLevel.INFO: return '\x1b[32m';
            case LogLevel.WARN: return '\x1b[33m';
            case LogLevel.ERROR: return '\x1b[31m';
            case LogLevel.CRITICAL: return '\x1b[41m\x1b[37m';
            default: return '\x1b[0m';
        }
    }
    getPerformanceMetrics() {
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
    async writeToFile(logEntry) {
        if (!this.enableFileOutput)
            return;
        try {
            const date = new Date().toISOString().split('T')[0];
            const filename = `app-verbose-${date}.log`;
            const filepath = path.join(this.logDirectory, filename);
            const logLine = this.formatLogEntry(logEntry) + '\n';
            await fs.promises.appendFile(filepath, logLine);
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
        }
        catch (error) {
            console.error('[LOG FILE ERROR]', error instanceof Error ? error.message : String(error));
        }
    }
    createLogEntry(level, module, message, data, requestId, userId) {
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
    async processLogEntry(logEntry) {
        if (!this.shouldLog(logEntry.level))
            return;
        const color = this.getConsoleColor(logEntry.level);
        const reset = '\x1b[0m';
        const formattedMessage = this.formatLogEntry(logEntry);
        console.log(`${color}${formattedMessage}${reset}`);
        await this.writeToFile(logEntry);
    }
    async verbose(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.VERBOSE, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    async debug(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.DEBUG, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    async info(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.INFO, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    async warn(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.WARN, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    async error(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.ERROR, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    async critical(module, message, data, requestId, userId) {
        const logEntry = this.createLogEntry(LogLevel.CRITICAL, module, message, data, requestId, userId);
        await this.processLogEntry(logEntry);
    }
    log(message, context) {
        this.info(context || 'App', message);
    }
    startTiming(operation) {
        this.performanceTracker.set(operation, Date.now());
        this.verbose('Performance', `Started timing: ${operation}`);
    }
    async endTiming(operation, module = 'Performance', data) {
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
    async trackDatabaseOperation(operation, table, query, parameters, executionTime, rowsAffected, error) {
        const dbOperation = {
            operation,
            table,
            query,
            parameters,
            executionTime: executionTime || 0,
            rowsAffected,
            success: !error,
            error: error?.message
        };
        const logEntry = this.createLogEntry(error ? LogLevel.ERROR : LogLevel.VERBOSE, 'Database', `${operation} on ${table}${error ? ` FAILED: ${error.message}` : ` completed in ${executionTime}ms`}`, { rows: rowsAffected });
        logEntry.databaseMetrics = dbOperation;
        await this.processLogEntry(logEntry);
    }
    async trackApiRequest(apiInfo) {
        const level = apiInfo.responseStatus && apiInfo.responseStatus >= 400 ? LogLevel.WARN : LogLevel.INFO;
        const message = `${apiInfo.method} ${apiInfo.url} - ${apiInfo.responseStatus}${apiInfo.responseTime ? ` (${apiInfo.responseTime}ms)` : ''}`;
        const logEntry = this.createLogEntry(level, 'API', message, {
            headers: apiInfo.headers,
            body: apiInfo.body,
            ip: apiInfo.ip,
            userAgent: apiInfo.userAgent
        }, undefined, apiInfo.userId);
        logEntry.apiMetrics = apiInfo;
        await this.processLogEntry(logEntry);
    }
    async trackTransaction(transactionId, operation, startTime, success, error) {
        const duration = Date.now() - startTime;
        const level = success ? LogLevel.INFO : LogLevel.ERROR;
        await this.processLogEntry({
            ...this.createLogEntry(level, 'Transaction', `${operation} ${success ? 'SUCCESS' : 'FAILED'} (${duration}ms)`, {
                transactionId,
                duration,
                error: error?.message,
                stack: error?.stack
            })
        });
    }
    async trackUserAction(userId, action, resource, data) {
        await this.info('UserAction', `User ${userId} performed ${action} on ${resource}`, {
            userId,
            action,
            resource,
            timestamp: Date.now(),
            ...data
        });
    }
    async logSystemHealth() {
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
    getSystemStats() {
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
    async trackError(error, module, context, requestId, userId) {
        await this.error(module, `Error: ${error.message}`, {
            error: error.name,
            message: error.message,
            stack: error.stack,
            context
        }, requestId, userId);
    }
};
exports.VerboseLoggerService = VerboseLoggerService;
exports.VerboseLoggerService = VerboseLoggerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], VerboseLoggerService);
//# sourceMappingURL=verbose-logger.service.js.map