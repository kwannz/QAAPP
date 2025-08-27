"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    app.useGlobalPipes(new common_1.ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        disableErrorMessages: process.env.NODE_ENV === 'production',
    }));
    app.enableCors({
        origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
        credentials: true,
    });
    app.setGlobalPrefix('api');
    if (process.env.NODE_ENV !== 'production') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('QA Fixed Income Platform API')
            .setDescription('QA固定收益投资平台后端API文档')
            .setVersion('1.0')
            .addBearerAuth()
            .addTag('认证', '用户认证和授权相关接口')
            .addTag('用户管理', '用户信息管理接口')
            .addTag('审计日志', '操作日志和审计追踪接口')
            .addTag('产品管理', '投资产品管理接口')
            .addTag('订单管理', '订单处理和管理接口')
            .addTag('仓位管理', '用户仓位管理接口')
            .addTag('分红管理', '收益分红管理接口')
            .addTag('佣金管理', '推荐和代理佣金接口')
            .addTag('钱包管理', '用户钱包地址管理接口')
            .addTag('系统管理', '系统配置和管理接口')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document, {
            swaggerOptions: {
                persistAuthorization: true,
            },
        });
        console.log('📚 Swagger文档地址: http://localhost:3001/api/docs');
    }
    app.getHttpAdapter().get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || '1.0.0',
        });
    });
    const port = configService.get('PORT', 3001);
    await app.listen(port);
    console.log('🚀 QA Fixed Income Platform API 启动成功!');
    console.log(`📍 服务地址: http://localhost:${port}`);
    console.log(`🔗 API地址: http://localhost:${port}/api`);
    console.log(`❤️  健康检查: http://localhost:${port}/health`);
}
bootstrap().catch(error => {
    console.error('❌ 应用启动失败:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map