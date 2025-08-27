import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: process.env.NODE_ENV === 'production',
    }),
  );

  // CORS 配置
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // API 前缀
  app.setGlobalPrefix('api');

  // Swagger 文档配置
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
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

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    console.log('📚 Swagger文档地址: http://localhost:3001/api/docs');
  }

  // 健康检查端点
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