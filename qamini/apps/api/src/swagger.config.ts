import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('QA Investment Platform API')
    .setDescription(`
      完整的QA投资平台后端API文档
      
      ## 功能模块
      
      ### 🔐 认证系统
      - JWT认证
      - 角色权限控制 (USER/AGENT/ADMIN)
      - 登录/注册/密码重置
      
      ### 👥 代理商管理
      - 代理商申请与审批
      - 层级结构管理
      - 绩效分析与报告
      - 佣金计算与支付
      
      ### 💰 佣金系统
      - 佣金计算规则
      - 支付处理
      - 历史记录查询
      - 统计分析报告
      
      ### 📋 订单管理
      - 投资订单处理
      - 风险评估
      - 审批流程
      - 批量操作
      
      ### ⚙️ 系统配置
      - 业务参数配置
      - 安全策略设置
      - 支付方式管理
      - 通知设置
      
      ### 📢 通知系统
      - 用户通知管理
      - 模板管理
      - 批量推送
      - 投递统计
      
      ### 📊 报表系统
      - 财务报表生成
      - 绩效分析报告
      - 数据导出功能
      - 调度系统
      
      ### 🔧 监控系统
      - 性能监控
      - 健康检查
      - 系统统计
      - 告警管理
      
      ## API规范
      
      - 所有API遵循RESTful设计
      - 使用标准HTTP状态码
      - 支持分页查询
      - 完整的错误处理
      - 统一的响应格式
      
      ## 权限说明
      
      - 🟢 公开接口：无需认证
      - 🟡 用户接口：需要有效JWT Token
      - 🔴 管理员接口：需要ADMIN角色权限
    `)
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"',
      },
      'JWT-auth',
    )
    .addTag('auth', '🔐 认证系统 - 用户认证与权限管理')
    .addTag('agents', '👥 代理商管理 - 代理商申请、审批、绩效管理')
    .addTag('commissions', '💰 佣金系统 - 佣金计算、支付、统计')
    .addTag('orders', '📋 订单管理 - 投资订单处理与管理')
    .addTag('config', '⚙️ 系统配置 - 业务参数与系统设置')
    .addTag('notifications', '📢 通知系统 - 消息推送与模板管理')
    .addTag('reports', '📊 报表系统 - 财务报表与数据分析')
    .addTag('performance', '🔧 性能监控 - 系统性能与健康检查')
    .addTag('health', '❤️ 健康检查 - 系统状态监控')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // 自定义Swagger UI配置
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
    },
    customSiteTitle: 'QA投资平台API文档',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js',
    ],
    customCssUrl: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
    ],
  });
}