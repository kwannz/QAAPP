import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationsService],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserNotifications', () => {
    it('should return user notifications with pagination', async () => {
      const userId = 'usr-001';
      const filters = { page: 1, limit: 20 };

      const result = await service.getUserNotifications(userId, filters);

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result).toHaveProperty('summary');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.pagination).toHaveProperty('total');
      expect(result.summary).toHaveProperty('unreadCount');
    });

    it('should filter notifications by type', async () => {
      const userId = 'usr-001';
      const filters = { type: 'ORDER_APPROVED', page: 1, limit: 20 };

      const result = await service.getUserNotifications(userId, filters);

      result.data.forEach(notification => {
        expect(notification.type).toBe('ORDER_APPROVED');
      });
    });

    it('should filter notifications by status', async () => {
      const userId = 'usr-001';
      const filters = { status: 'UNREAD', page: 1, limit: 20 };

      const result = await service.getUserNotifications(userId, filters);

      result.data.forEach(notification => {
        expect(notification.status).toBe('UNREAD');
      });
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read', async () => {
      const userId = 'usr-001';
      const notificationId = 'notif-001';

      const result = await service.markNotificationAsRead(userId, notificationId);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('notificationId', notificationId);
      expect(result).toHaveProperty('readAt');
    });
  });

  describe('markAllNotificationsAsRead', () => {
    it('should mark all notifications as read', async () => {
      const userId = 'usr-001';

      const result = await service.markAllNotificationsAsRead(userId);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('markedCount');
      expect(result).toHaveProperty('readAt');
      expect(typeof result.markedCount).toBe('number');
    });
  });

  describe('getNotificationStats', () => {
    it('should return notification statistics', async () => {
      const userId = 'usr-001';

      const result = await service.getNotificationStats(userId);

      expect(result).toHaveProperty('userId', userId);
      expect(result).toHaveProperty('stats');
      expect(result.stats).toHaveProperty('total');
      expect(result.stats).toHaveProperty('unread');
      expect(result.stats).toHaveProperty('read');
      expect(result.stats).toHaveProperty('byPriority');
      expect(result.stats).toHaveProperty('byType');
      expect(typeof result.stats.total).toBe('number');
    });
  });

  describe('sendNotification', () => {
    it('should send notification successfully', async () => {
      const notificationData = {
        recipientId: 'usr-001',
        recipientType: 'USER' as const,
        type: 'ORDER_APPROVED',
        title: 'Order Approved',
        message: 'Your order has been approved',
        priority: 'HIGH' as const,
        channels: ['EMAIL', 'PUSH'] as ('EMAIL' | 'PUSH' | 'SMS')[]
      };

      const result = await service.sendNotification(notificationData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('notification');
      expect(result).toHaveProperty('delivery');
      expect(result.notification).toHaveProperty('id');
      expect(result.notification).toHaveProperty('status');
    });

    it('should schedule notification for future delivery', async () => {
      const notificationData = {
        recipientId: 'usr-001',
        recipientType: 'USER' as const,
        type: 'PROMOTIONAL',
        title: 'Special Offer',
        message: 'Limited time offer',
        priority: 'MEDIUM' as const,
        channels: ['EMAIL'] as ('EMAIL' | 'PUSH' | 'SMS')[],
        scheduledFor: '2024-02-01T09:00:00Z'
      };

      const result = await service.sendNotification(notificationData);

      expect(result.notification.status).toBe('SCHEDULED');
      expect(result.delivery.estimatedDelivery).toBe(notificationData.scheduledFor);
    });
  });

  describe('sendBulkNotifications', () => {
    it('should send bulk notifications', async () => {
      const bulkData = {
        recipientIds: ['usr-001', 'usr-002', 'usr-003'],
        type: 'SYSTEM_MAINTENANCE',
        title: 'System Maintenance',
        message: 'Scheduled maintenance tonight',
        priority: 'URGENT' as const,
        channels: ['EMAIL', 'PUSH'] as ('EMAIL' | 'PUSH' | 'SMS')[]
      };

      const result = await service.sendBulkNotifications(bulkData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('batchId');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary.totalRecipients).toBe(3);
      expect(result.results).toBeInstanceOf(Array);
    });
  });

  describe('getNotificationTemplates', () => {
    it('should return notification templates', async () => {
      const result = await service.getNotificationTemplates();

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('categories');
      expect(result.data).toBeInstanceOf(Array);
      expect(result.categories).toBeInstanceOf(Array);
    });
  });

  describe('createNotificationTemplate', () => {
    it('should create notification template', async () => {
      const templateData = {
        name: 'Test Template',
        type: 'TEST_TYPE',
        title: 'Test Title',
        content: 'Test content with {variable}',
        variables: ['variable'],
        channels: ['EMAIL'] as ('EMAIL' | 'PUSH' | 'SMS')[]
      };

      const result = await service.createNotificationTemplate(templateData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('template');
      expect(result.template).toHaveProperty('id');
      expect(result.template).toHaveProperty('name', templateData.name);
    });
  });

  describe('getAdminNotificationStats', () => {
    it('should return admin notification statistics', async () => {
      const filters = { period: '30d' };

      const result = await service.getAdminNotificationStats(filters);

      expect(result).toHaveProperty('period', '30d');
      expect(result).toHaveProperty('overview');
      expect(result).toHaveProperty('byChannel');
      expect(result).toHaveProperty('byType');
      expect(result).toHaveProperty('trends');
      expect(result.overview).toHaveProperty('totalSent');
      expect(result.overview).toHaveProperty('successRate');
    });
  });

  describe('scheduleCampaign', () => {
    it('should schedule campaign successfully', async () => {
      const campaignData = {
        name: 'Test Campaign',
        templateId: 'tpl-001',
        targetAudience: 'ALL' as const,
        scheduledFor: '2024-02-01T10:00:00Z',
        channels: ['EMAIL'] as ('EMAIL' | 'PUSH' | 'SMS')[]
      };

      const result = await service.scheduleCampaign(campaignData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('campaign');
      expect(result).toHaveProperty('estimatedReach');
      expect(result.campaign).toHaveProperty('id');
      expect(result.campaign.status).toBe('SCHEDULED');
    });
  });

  describe('retryFailedNotifications', () => {
    it('should retry failed notifications', async () => {
      const retryData = {
        notificationIds: ['notif-002', 'notif-003'],
        channel: 'EMAIL'
      };

      const result = await service.retryFailedNotifications(retryData);

      expect(result).toHaveProperty('success', true);
      expect(result).toHaveProperty('retryBatchId');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('results');
      expect(result.summary).toHaveProperty('totalRetried');
      expect(result.summary).toHaveProperty('successfulRetries');
    });
  });
});