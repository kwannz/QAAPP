"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const global_exception_filter_1 = require("./common/filters/global-exception.filter");
const response_interceptor_1 = require("./common/interceptors/response.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https:"],
            },
        },
        hsts: {
            maxAge: 31536000,
            includeSubDomains: true,
        },
    }));
    app.use((0, compression_1.default)());
    app.use('/api', (req, res, next) => {
        req.setMaxListeners(0);
        if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
            return res.status(413).json({ error: 'Request too large' });
        }
        next();
    });
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new response_interceptor_1.ResponseInterceptor());
    app.useGlobalPipes(new validation_pipe_1.CustomValidationPipe());
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3002',
            'http://localhost:3003',
            'http://localhost:3005'
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Request-ID',
            'X-Correlation-ID',
        ],
    });
    app.setGlobalPrefix('api', {
        exclude: ['/health', '/'],
    });
    app.use((req, res, next) => {
        res.header('X-Content-Type-Options', 'nosniff');
        res.header('X-Frame-Options', 'DENY');
        res.header('X-XSS-Protection', '1; mode=block');
        next();
    });
    const port = configService.get('PORT', 3001);
    const environment = configService.get('NODE_ENV', 'development');
    await app.listen(port);
    logger.log(`🚀 API Application is running on: http://localhost:${port}`);
    logger.log(`📋 Health check: http://localhost:${port}/health`);
    logger.log(`🔗 API endpoints: http://localhost:${port}/api`);
    logger.log(`🌍 Environment: ${environment}`);
    logger.log(`🔒 CORS enabled for: ${configService.get('CORS_ORIGIN', 'http://localhost:3003')}`);
}
bootstrap();
//# sourceMappingURL=main.js.map