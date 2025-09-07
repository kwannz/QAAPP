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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogContext = exports.LogLevel = exports.createWinstonConfig = void 0;
const winston = __importStar(require("winston"));
require("winston-daily-rotate-file");
const customFormat = winston.format.combine(winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
}), winston.format.errors({ stack: true }), winston.format.json(), winston.format.printf((info) => {
    const { timestamp, level, message, context, trace, ...meta } = info;
    const logObject = {
        timestamp,
        level: level.toUpperCase(),
        context: context || 'Application',
        message,
        ...(trace && { trace }),
        ...(typeof meta === 'object' && meta ? meta : {})
    };
    return JSON.stringify(logObject, null, 0);
}));
const developmentFormat = winston.format.combine(winston.format.timestamp({
    format: 'HH:mm:ss'
}), winston.format.colorize(), winston.format.printf(({ timestamp, level, message, context }) => {
    const ctx = context ? `[${context}]` : '';
    return `${timestamp} ${level} ${ctx} ${message}`;
}));
const createRotatingFileTransport = (filename, level) => {
    return new winston.transports.DailyRotateFile({
        filename: `logs/${filename}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        maxSize: '20m',
        maxFiles: '14d',
        level: level,
        format: customFormat,
        auditFile: `logs/.${filename}-audit.json`
    });
};
const createWinstonConfig = (isDevelopment = false) => {
    const transports = [];
    if (isDevelopment) {
        transports.push(new winston.transports.Console({
            format: developmentFormat
        }));
    }
    else {
        transports.push(new winston.transports.Console({
            format: winston.format.combine(winston.format.timestamp(), winston.format.colorize(), winston.format.simple())
        }), createRotatingFileTransport('error', 'error'), createRotatingFileTransport('warn', 'warn'), createRotatingFileTransport('combined'), createRotatingFileTransport('access', 'info'), createRotatingFileTransport('performance', 'info'));
    }
    return {
        level: isDevelopment ? 'debug' : 'info',
        format: customFormat,
        defaultMeta: {
            service: 'qa-app-api',
            version: process.env.APP_VERSION || '1.0.0',
            environment: process.env.NODE_ENV || 'development'
        },
        transports,
        exitOnError: false,
        exceptionHandlers: isDevelopment ? [] : [
            createRotatingFileTransport('exceptions')
        ],
        rejectionHandlers: isDevelopment ? [] : [
            createRotatingFileTransport('rejections')
        ]
    };
};
exports.createWinstonConfig = createWinstonConfig;
var LogLevel;
(function (LogLevel) {
    LogLevel["ERROR"] = "error";
    LogLevel["WARN"] = "warn";
    LogLevel["INFO"] = "info";
    LogLevel["HTTP"] = "http";
    LogLevel["DEBUG"] = "debug";
    LogLevel["VERBOSE"] = "verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var LogContext;
(function (LogContext) {
    LogContext["AUTH"] = "Auth";
    LogContext["ORDER"] = "Order";
    LogContext["PAYMENT"] = "Payment";
    LogContext["CACHE"] = "Cache";
    LogContext["DATABASE"] = "Database";
    LogContext["PERFORMANCE"] = "Performance";
    LogContext["SECURITY"] = "Security";
    LogContext["API"] = "API";
    LogContext["WEBSOCKET"] = "WebSocket";
    LogContext["BLOCKCHAIN"] = "Blockchain";
})(LogContext || (exports.LogContext = LogContext = {}));
//# sourceMappingURL=winston.config.js.map