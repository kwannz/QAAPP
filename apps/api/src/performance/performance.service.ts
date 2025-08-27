import { Injectable } from '@nestjs/common';

@Injectable()
export class PerformanceService {
  private performanceMetrics = new Map<string, any>();
  private responseTimes: number[] = [];
  private requestCounts = new Map<string, number>();

  startTimer(requestId: string): void {
    this.performanceMetrics.set(requestId, {
      startTime: Date.now(),
      memoryUsage: process.memoryUsage()
    });
  }

  endTimer(requestId: string, endpoint: string): void {
    const metrics = this.performanceMetrics.get(requestId);
    if (!metrics) return;

    const responseTime = Date.now() - metrics.startTime;
    this.responseTimes.push(responseTime);
    
    // Keep only last 1000 response times
    if (this.responseTimes.length > 1000) {
      this.responseTimes.shift();
    }

    // Count requests per endpoint
    const currentCount = this.requestCounts.get(endpoint) || 0;
    this.requestCounts.set(endpoint, currentCount + 1);

    this.performanceMetrics.delete(requestId);
  }

  getPerformanceStats(): any {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
        arrayBuffers: Math.round(memUsage.arrayBuffers / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system
      },
      responseTimes: {
        average: this.calculateAverage(this.responseTimes),
        p50: this.calculatePercentile(this.responseTimes, 50),
        p95: this.calculatePercentile(this.responseTimes, 95),
        p99: this.calculatePercentile(this.responseTimes, 99),
        min: Math.min(...this.responseTimes),
        max: Math.max(...this.responseTimes)
      },
      requests: {
        total: Array.from(this.requestCounts.values()).reduce((sum, count) => sum + count, 0),
        byEndpoint: Object.fromEntries(this.requestCounts.entries())
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    };
  }

  private calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    return Math.round(numbers.reduce((sum, num) => sum + num, 0) / numbers.length);
  }

  private calculatePercentile(numbers: number[], percentile: number): number {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  getHealthCheck(): any {
    const stats = this.getPerformanceStats();
    const avgResponseTime = stats.responseTimes.average;
    const memoryUsage = (stats.memory.heapUsed / stats.memory.heapTotal) * 100;

    return {
      status: this.determineHealthStatus(avgResponseTime, memoryUsage),
      checks: {
        responseTime: {
          status: avgResponseTime < 2000 ? 'healthy' : avgResponseTime < 5000 ? 'warning' : 'critical',
          value: avgResponseTime,
          threshold: 2000,
          unit: 'ms'
        },
        memoryUsage: {
          status: memoryUsage < 80 ? 'healthy' : memoryUsage < 90 ? 'warning' : 'critical',
          value: Math.round(memoryUsage),
          threshold: 80,
          unit: '%'
        },
        uptime: {
          status: 'healthy',
          value: Math.round(stats.uptime),
          unit: 'seconds'
        }
      },
      timestamp: new Date().toISOString()
    };
  }

  private determineHealthStatus(avgResponseTime: number, memoryUsage: number): string {
    if (avgResponseTime > 5000 || memoryUsage > 90) {
      return 'critical';
    }
    if (avgResponseTime > 2000 || memoryUsage > 80) {
      return 'warning';
    }
    return 'healthy';
  }

  generatePerformanceReport(period: string): any {
    const stats = this.getPerformanceStats();
    
    return {
      period,
      summary: {
        totalRequests: stats.requests.total,
        averageResponseTime: stats.responseTimes.average,
        uptime: stats.uptime,
        memoryUsage: stats.memory.heapUsed,
        healthStatus: this.getHealthCheck().status
      },
      details: {
        responseTimes: stats.responseTimes,
        memoryMetrics: stats.memory,
        topEndpoints: this.getTopEndpoints(10),
        slowestEndpoints: this.getSlowestEndpoints(5)
      },
      recommendations: this.generateRecommendations(stats),
      generatedAt: new Date().toISOString()
    };
  }

  private getTopEndpoints(limit: number): Array<{endpoint: string, requests: number}> {
    return Array.from(this.requestCounts.entries())
      .map(([endpoint, count]) => ({ endpoint, requests: count }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit);
  }

  private getSlowestEndpoints(limit: number): Array<{endpoint: string, avgTime: number}> {
    // Mock implementation - in real system, track per-endpoint times
    return [
      { endpoint: '/reports/generate', avgTime: 3500 },
      { endpoint: '/commissions/calculate', avgTime: 2800 },
      { endpoint: '/agents/performance', avgTime: 1900 },
      { endpoint: '/admin/export', avgTime: 1600 },
      { endpoint: '/notifications/send-bulk', avgTime: 1200 }
    ].slice(0, limit);
  }

  private generateRecommendations(stats: any): string[] {
    const recommendations: string[] = [];

    if (stats.responseTimes.average > 2000) {
      recommendations.push('Consider optimizing database queries and adding caching');
    }

    if (stats.memory.heapUsed / stats.memory.heapTotal > 0.8) {
      recommendations.push('Memory usage is high. Consider garbage collection optimization');
    }

    if (stats.responseTimes.p99 > 10000) {
      recommendations.push('99th percentile response time is high. Investigate slow operations');
    }

    const topEndpoint = this.getTopEndpoints(1)[0];
    if (topEndpoint && topEndpoint.requests > 1000) {
      recommendations.push(`High traffic on ${topEndpoint.endpoint}. Consider load balancing`);
    }

    if (recommendations.length === 0) {
      recommendations.push('System performance is optimal. No immediate actions required');
    }

    return recommendations;
  }

  clearMetrics(): void {
    this.responseTimes.length = 0;
    this.requestCounts.clear();
    this.performanceMetrics.clear();
  }
}