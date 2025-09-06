import { Controller, Get } from '@nestjs/common';
import { MetricsService } from '../common/metrics/metrics.service';
import { getErrorMessage, getErrorStack } from '../common/utils/error.utils';

@Controller('health')
export class HealthController {
  constructor(
    private readonly metricsService: MetricsService,
  ) {}

  @Get()
  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'QA App API',
      version: '1.0.0',
      message: 'API server is running'
    };
  }

  @Get('api')
  getApiHealth() {
    return {
      status: 'healthy',
      service: 'API Service',
      endpoints: [
        '/api/auth',
        '/api/health',
        '/api/mock',
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detailed')
  async getDetailedHealth() {
    try {
      const systemStatus = this.metricsService.getSystemStatus();
      
      return {
        timestamp: new Date().toISOString(),
        overall: 'healthy',
        system: {
          uptime: systemStatus.uptime,
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          requests: systemStatus.totalRequests,
          errors: systemStatus.totalErrors,
          errorRate: systemStatus.errorRate,
        },
        services: {
          auth: 'healthy',
          database: 'healthy',
          cache: 'healthy'
        }
      };
    } catch (error: unknown) {
      return {
        timestamp: new Date().toISOString(),
        overall: 'unhealthy',
        error: getErrorMessage(error),
        system: {
          uptime: `${Math.floor(process.uptime())}s`,
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development',
        }
      };
    }
  }

  @Get('metrics')
  async getMetrics() {
    try {
      const systemStatus = this.metricsService.getSystemStatus();
      const allMetrics = this.metricsService.getAllMetrics();
      
      return {
        timestamp: new Date().toISOString(),
        system: systemStatus,
        metrics: allMetrics.slice(0, 20), // 最近20个指标
      };
    } catch (error: unknown) {
      return {
        timestamp: new Date().toISOString(),
        error: getErrorMessage(error),
      };
    }
  }
}