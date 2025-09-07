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
exports.enhanceLogContext = exports.SENSITIVE_FIELDS = exports.LOG_LEVELS = exports.createLoggingConfig = void 0;
const winston = __importStar(require("winston"));
const path = __importStar(require("path"));
const createLoggingConfig = (configService) => {
    const isProduction = configService.get('NODE_ENV') === 'production';
    const isDevelopment = configService.get('NODE_ENV') === 'development';
    const baseFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.json());
    const consoleFormat = winston.format.combine(winston.format.colorize(), winston.format.timestamp({ format: 'HH:mm:ss.SSS' }), winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        const contextStr = context ? `[${context}]` : '[Application]';
        return `[${timestamp}] ${level} ${contextStr}: ${message}${metaStr}`;
    }));
    const productionFormat = winston.format.combine(baseFormat, winston.format.prettyPrint({ depth: 3 }));
    const transports = [];
    if (isDevelopment || !isProduction) {
        transports.push(new winston.transports.Console({
            format: consoleFormat,
            level: configService.get('LOG_LEVEL', 'info')
        }));
    }
    if (isProduction) {
        const logDir = configService.get('LOG_DIR', './logs');
        transports.push(new winston.transports.File({
            filename: path.join(logDir, 'application.log'),
            format: productionFormat,
            maxsize: 50 * 1024 * 1024,
            maxFiles: 10,
            tailable: true,
            level: 'info'
        }));
        transports.push(new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            format: productionFormat,
            maxsize: 20 * 1024 * 1024,
            maxFiles: 5,
            level: 'error'
        }));
        transports.push(new winston.transports.File({
            filename: path.join(logDir, 'audit.log'),
            format: winston.format.combine(winston.format.timestamp(), winston.format.json(), winston.format.prettyPrint()),
            maxsize: 100 * 1024 * 1024,
            maxFiles: 30,
            level: 'info'
        }));
    }
    if (configService.get('ELASTICSEARCH_URL')) {
    }
    return {
        level: configService.get('LOG_LEVEL', 'info'),
        format: isProduction ? productionFormat : consoleFormat,
        transports,
        defaultMeta: {
            service: 'qa-app-api',
            environment: configService.get('NODE_ENV', 'development'),
            version: configService.get('APP_VERSION', '1.0.0'),
            instance: configService.get('INSTANCE_ID', 'default'),
        }
    };
};
exports.createLoggingConfig = createLoggingConfig;
exports.LOG_LEVELS = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
};
exports.SENSITIVE_FIELDS = [
    'password',
    'token',
    'authorization',
    'cookie',
    'secret',
    'key',
    'apiKey',
    'accessToken',
    'refreshToken',
    'jwt',
    'privateKey',
    'mnemonic'
];
const enhanceLogContext = (baseContext, additionalContext) => {
    return {
        ...baseContext,
        ...additionalContext,
        timestamp: new Date().toISOString(),
    };
};
exports.enhanceLogContext = enhanceLogContext;
//# sourceMappingURL=logging.config.js.map