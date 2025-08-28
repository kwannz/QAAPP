import { Injectable, Logger } from '@nestjs/common';

export interface SimpleMetric {
  name: string;
  value: number;
  timestamp: Date;
  labels?: Record<string, string>;
}

@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);
  
  // 简化的指标存储
  private metrics = new Map<string, SimpleMetric>();
  private requests: number = 0;
  private errors: number = 0;

  constructor() {
    this.logger.log('Simple metrics service initialized');
  }

  /**
   * 记录HTTP请求
   */
  recordRequest(method: string, path: string, statusCode: number, duration: number): void {
    this.requests++;
    
    if (statusCode >= 400) {
      this.errors++;
    }

    // 记录基本指标
    this.setMetric('http_requests_total', this.requests, { method, path });
    this.setMetric('http_request_duration_ms', duration, { method, path });
  }

  /**
   * 记录业务指标 - 简化版
   */
  recordBusinessMetric(name: string, value: number, category: string): void {
    this.setMetric(name, value, { category });
  }

  /**
   * 设置简单指标
   */
  private setMetric(name: string, value: number, labels?: Record<string, string>): void {
    const key = this.buildKey(name, labels);
    this.metrics.set(key, {
      name,
      value,
      timestamp: new Date(),
      labels
    });

    // 保持最近100个指标
    if (this.metrics.size > 100) {
      const firstKey = this.metrics.keys().next().value;
      this.metrics.delete(firstKey);
    }
  }

  /**
   * 获取系统状态 - 简化版
   */
  getSystemStatus(): {
    totalRequests: number;
    totalErrors: number;
    errorRate: number;
    uptime: string;
    timestamp: Date;
  } {
    const uptimeMs = process.uptime() * 1000;
    const errorRate = this.requests > 0 ? (this.errors / this.requests) * 100 : 0;

    return {
      totalRequests: this.requests,
      totalErrors: this.errors,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime: this.formatUptime(uptimeMs),
      timestamp: new Date()
    };
  }

  /**
   * 获取所有指标
   */
  getAllMetrics(): SimpleMetric[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private buildKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    
    const labelString = Object.entries(labels)
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    
    return `${name}{${labelString}}`;
  }

  private formatUptime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}