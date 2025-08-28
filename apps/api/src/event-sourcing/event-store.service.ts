import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@qa-app/database';

export interface DomainEvent {
  id: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventData: any;
  eventVersion: number;
  timestamp: Date;
  userId?: number;
  correlationId?: string;
  causationId?: string;
  metadata?: Record<string, any>;
}

export interface Snapshot {
  id: string;
  aggregateId: string;
  aggregateType: string;
  aggregateVersion: number;
  snapshotData: any;
  timestamp: Date;
}

export interface EventStream {
  aggregateId: string;
  aggregateType: string;
  events: DomainEvent[];
  version: number;
}

@Injectable()
export class EventStoreService {
  private readonly logger = new Logger(EventStoreService.name);

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2
  ) {}

  /**
   * 保存事件到事件存储
   */
  async saveEvents(
    aggregateId: string,
    aggregateType: string,
    events: Omit<DomainEvent, 'id' | 'timestamp'>[],
    expectedVersion: number
  ): Promise<void> {
    return this.prisma.$transaction(async (tx) => {
      // 检查并发冲突
      const currentVersion = await this.getAggregateVersion(aggregateId, aggregateType, tx);
      
      if (currentVersion !== expectedVersion) {
        throw new Error(
          `Concurrency conflict: expected version ${expectedVersion}, but current version is ${currentVersion}`
        );
      }

      // 保存事件
      const savedEvents: DomainEvent[] = [];
      
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const eventVersion = expectedVersion + i + 1;
        
        const savedEvent = await tx.event.create({
          data: {
            id: this.generateEventId(),
            aggregateId,
            aggregateType,
            eventType: event.eventType,
            eventData: event.eventData,
            eventVersion,
            timestamp: new Date(),
            userId: event.userId,
            correlationId: event.correlationId,
            causationId: event.causationId,
            metadata: event.metadata
          }
        });

        savedEvents.push(savedEvent as DomainEvent);
      }

      // 更新聚合版本
      await tx.aggregateVersion.upsert({
        where: {
          aggregateId_aggregateType: {
            aggregateId,
            aggregateType
          }
        },
        create: {
          aggregateId,
          aggregateType,
          version: expectedVersion + events.length
        },
        update: {
          version: expectedVersion + events.length
        }
      });

      // 异步发布事件
      process.nextTick(() => {
        savedEvents.forEach(event => {
          this.publishEvent(event);
        });
      });

      this.logger.debug(`Saved ${events.length} events for aggregate ${aggregateId}`);
    });
  }

  /**
   * 获取聚合的事件流
   */
  async getEventStream(
    aggregateId: string,
    aggregateType: string,
    fromVersion?: number
  ): Promise<EventStream> {
    const where: any = {
      aggregateId,
      aggregateType
    };

    if (fromVersion !== undefined) {
      where.eventVersion = {
        gt: fromVersion
      };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: {
        eventVersion: 'asc'
      }
    });

    const version = await this.getAggregateVersion(aggregateId, aggregateType);

    return {
      aggregateId,
      aggregateType,
      events: events as DomainEvent[],
      version
    };
  }

  /**
   * 获取多个聚合的事件
   */
  async getEventsForAggregates(
    aggregateIds: string[],
    aggregateType: string,
    fromTimestamp?: Date,
    toTimestamp?: Date
  ): Promise<DomainEvent[]> {
    const where: any = {
      aggregateId: {
        in: aggregateIds
      },
      aggregateType
    };

    if (fromTimestamp || toTimestamp) {
      where.timestamp = {};
      if (fromTimestamp) {
        where.timestamp.gte = fromTimestamp;
      }
      if (toTimestamp) {
        where.timestamp.lte = toTimestamp;
      }
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: [
        { aggregateId: 'asc' },
        { eventVersion: 'asc' }
      ]
    });

    return events as DomainEvent[];
  }

  /**
   * 按事件类型查询事件
   */
  async getEventsByType(
    eventTypes: string[],
    fromTimestamp?: Date,
    limit?: number
  ): Promise<DomainEvent[]> {
    const where: any = {
      eventType: {
        in: eventTypes
      }
    };

    if (fromTimestamp) {
      where.timestamp = {
        gte: fromTimestamp
      };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: {
        timestamp: 'asc'
      },
      take: limit
    });

    return events as DomainEvent[];
  }

  /**
   * 创建快照
   */
  async createSnapshot(
    aggregateId: string,
    aggregateType: string,
    aggregateVersion: number,
    snapshotData: any
  ): Promise<Snapshot> {
    const snapshot = await this.prisma.snapshot.create({
      data: {
        id: this.generateSnapshotId(),
        aggregateId,
        aggregateType,
        aggregateVersion,
        snapshotData,
        timestamp: new Date()
      }
    });

    this.logger.debug(`Created snapshot for aggregate ${aggregateId} at version ${aggregateVersion}`);

    return snapshot as Snapshot;
  }

  /**
   * 获取最新快照
   */
  async getLatestSnapshot(
    aggregateId: string,
    aggregateType: string
  ): Promise<Snapshot | null> {
    const snapshot = await this.prisma.snapshot.findFirst({
      where: {
        aggregateId,
        aggregateType
      },
      orderBy: {
        aggregateVersion: 'desc'
      }
    });

    return snapshot as Snapshot | null;
  }

  /**
   * 清理旧快照
   */
  async cleanupOldSnapshots(
    aggregateId: string,
    aggregateType: string,
    keepCount: number = 3
  ): Promise<void> {
    const snapshots = await this.prisma.snapshot.findMany({
      where: {
        aggregateId,
        aggregateType
      },
      orderBy: {
        aggregateVersion: 'desc'
      },
      select: {
        id: true
      },
      skip: keepCount
    });

    if (snapshots.length > 0) {
      const idsToDelete = snapshots.map(s => s.id);
      await this.prisma.snapshot.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      });

      this.logger.debug(`Cleaned up ${snapshots.length} old snapshots for aggregate ${aggregateId}`);
    }
  }

  /**
   * 重放事件到投影
   */
  async replayEvents(
    aggregateType?: string,
    fromTimestamp?: Date,
    batchSize: number = 1000
  ): Promise<void> {
    this.logger.log(`Starting event replay${aggregateType ? ` for ${aggregateType}` : ''}`);

    const where: any = {};
    if (aggregateType) {
      where.aggregateType = aggregateType;
    }
    if (fromTimestamp) {
      where.timestamp = { gte: fromTimestamp };
    }

    let skip = 0;
    let hasMore = true;

    while (hasMore) {
      const events = await this.prisma.event.findMany({
        where,
        orderBy: {
          timestamp: 'asc'
        },
        skip,
        take: batchSize
      });

      if (events.length === 0) {
        hasMore = false;
        continue;
      }

      // 批量发布事件进行重投影
      for (const event of events) {
        this.eventEmitter.emit(`replay.${event.eventType}`, event);
      }

      skip += events.length;
      hasMore = events.length === batchSize;

      this.logger.debug(`Replayed batch of ${events.length} events (total processed: ${skip})`);

      // 避免内存压力，添加小延迟
      await this.delay(10);
    }

    this.logger.log(`Event replay completed. Total events processed: ${skip}`);
  }

  /**
   * 获取事件统计信息
   */
  async getEventStatistics(
    fromDate?: Date,
    toDate?: Date
  ): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByAggregate: Record<string, number>;
    averageEventsPerDay: number;
  }> {
    const where: any = {};
    if (fromDate || toDate) {
      where.timestamp = {};
      if (fromDate) where.timestamp.gte = fromDate;
      if (toDate) where.timestamp.lte = toDate;
    }

    const [
      totalEvents,
      eventsByType,
      eventsByAggregate
    ] = await Promise.all([
      this.prisma.event.count({ where }),
      this.prisma.event.groupBy({
        by: ['eventType'],
        where,
        _count: {
          eventType: true
        }
      }),
      this.prisma.event.groupBy({
        by: ['aggregateType'],
        where,
        _count: {
          aggregateType: true
        }
      })
    ]);

    const eventsByTypeMap = eventsByType.reduce((acc, item) => {
      acc[item.eventType] = item._count.eventType;
      return acc;
    }, {} as Record<string, number>);

    const eventsByAggregateMap = eventsByAggregate.reduce((acc, item) => {
      acc[item.aggregateType] = item._count.aggregateType;
      return acc;
    }, {} as Record<string, number>);

    // 计算平均每日事件数
    const daysDiff = fromDate && toDate 
      ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
      : 1;
    const averageEventsPerDay = totalEvents / daysDiff;

    return {
      totalEvents,
      eventsByType: eventsByTypeMap,
      eventsByAggregate: eventsByAggregateMap,
      averageEventsPerDay
    };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    isHealthy: boolean;
    eventCount: number;
    latestEventTime?: Date;
    issues: string[];
  }> {
    const issues: string[] = [];

    try {
      const eventCount = await this.prisma.event.count();
      const latestEvent = await this.prisma.event.findFirst({
        orderBy: { timestamp: 'desc' },
        select: { timestamp: true }
      });

      // 检查是否有最近的事件
      if (latestEvent) {
        const timeSinceLastEvent = Date.now() - latestEvent.timestamp.getTime();
        const maxIdleTime = 24 * 60 * 60 * 1000; // 24小时

        if (timeSinceLastEvent > maxIdleTime) {
          issues.push(`No events in the last ${Math.round(timeSinceLastEvent / (60 * 60 * 1000))} hours`);
        }
      }

      // 检查版本一致性
      const versionCheck = await this.prisma.$queryRaw`
        SELECT 
          av.aggregateId,
          av.aggregateType,
          av.version as expected_version,
          COALESCE(MAX(e.eventVersion), 0) as actual_version
        FROM AggregateVersion av
        LEFT JOIN Event e ON e.aggregateId = av.aggregateId AND e.aggregateType = av.aggregateType
        GROUP BY av.aggregateId, av.aggregateType, av.version
        HAVING av.version != COALESCE(MAX(e.eventVersion), 0)
        LIMIT 5
      `;

      if (Array.isArray(versionCheck) && versionCheck.length > 0) {
        issues.push(`Found ${versionCheck.length} version inconsistencies`);
      }

      return {
        isHealthy: issues.length === 0,
        eventCount,
        latestEventTime: latestEvent?.timestamp,
        issues
      };

    } catch (error) {
      return {
        isHealthy: false,
        eventCount: 0,
        issues: [`Health check failed: ${error.message}`]
      };
    }
  }

  /**
   * 私有辅助方法
   */
  private async getAggregateVersion(
    aggregateId: string,
    aggregateType: string,
    tx?: any
  ): Promise<number> {
    const client = tx || this.prisma;
    
    const versionRecord = await client.aggregateVersion.findUnique({
      where: {
        aggregateId_aggregateType: {
          aggregateId,
          aggregateType
        }
      }
    });

    return versionRecord?.version || 0;
  }

  private publishEvent(event: DomainEvent): void {
    // 发布到应用内事件总线
    this.eventEmitter.emit(event.eventType, event);
    this.eventEmitter.emit(`${event.aggregateType}.${event.eventType}`, event);
    
    // 发布到全局事件流
    this.eventEmitter.emit('domain.event', event);
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSnapshotId(): string {
    return `snap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}