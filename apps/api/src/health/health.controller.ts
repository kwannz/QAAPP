import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'QA App API',
      version: '1.0.0',
    };
  }

  @Get('api')
  getApiHealth() {
    return {
      status: 'healthy',
      service: 'API Service',
      endpoints: [
        '/api/auth',
        '/api/users', 
        '/api/products',
        '/api/orders',
      ],
      timestamp: new Date().toISOString(),
    };
  }
}