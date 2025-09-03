import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { PrismaModule } from '../prisma/prisma.module'

// 核心监控服务
import { MonitoringService } from './services/monitoring.service'

// 整合的业务服务
import { ReportsService } from './services/reports.service'
import { NotificationsService } from './services/notifications.service'

// 控制器
import { MonitoringController } from './controllers/monitoring.controller'
import { ReportsController } from './controllers/reports.controller'
import { NotificationsController } from './controllers/notifications.controller'

// 导入性能优化服务
import { PerformanceOptimizerService } from '../common/performance/performance-optimizer.service'
import { OptimizedQueriesService } from '../common/database/optimized-queries.service'
import { DatabaseService } from '../database/database.service'

@Module({
  imports: [
    ConfigModule,
    PrismaModule
  ],
  providers: [
    // 核心监控服务
    MonitoringService,
    // 整合的业务服务
    ReportsService,
    NotificationsService,
    // 性能优化服务
    PerformanceOptimizerService,
    OptimizedQueriesService,
    DatabaseService
  ],
  controllers: [
    MonitoringController,
    ReportsController,
    NotificationsController
  ],
  exports: [
    MonitoringService,
    ReportsService,
    NotificationsService
  ]
})
export class MonitoringModule {}