import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  // Mock notification data
  private mockNotifications = [
    {
      id: 'notif-001',
      userId: 'usr-001',
      type: 'ORDER_APPROVED',
      title: '订单已批准',
      message: '您的投资订单 #ORD-001 已经批准，金额：$10,000',
      priority: 'HIGH',
      status: 'UNREAD',
      channels: ['EMAIL', 'PUSH'],
      data: { orderId: 'ord-001', amount: 10000 },
      createdAt: '2024-01-20T10:30:00Z',
      readAt: null
    },
    {
      id: 'notif-002',
      userId: 'usr-001',
      type: 'COMMISSION_PAYMENT',
      title: '佣金已到账',
      message: '您的1月份佣金 $500 已发放到您的账户',
      priority: 'MEDIUM',
      status: 'READ',
      channels: ['EMAIL'],
      data: { amount: 500, period: '2024-01' },
      createdAt: '2024-01-15T08:00:00Z',
      readAt: '2024-01-15T09:30:00Z'
    },
    {
      id: 'notif-003',
      userId: 'agt-001',
      type: 'SYSTEM_MAINTENANCE',
      title: '系统维护通知',
      message: '系统将于今晚22:00-02:00进行维护，期间可能无法使用部分功能',
      priority: 'URGENT',
      status: 'UNREAD',
      channels: ['EMAIL', 'PUSH', 'SMS'],
      data: { startTime: '2024-01-21T22:00:00Z', endTime: '2024-01-22T02:00:00Z' },
      createdAt: '2024-01-20T15:00:00Z',
      readAt: null
    }
  ];

  // Mock notification templates
  private mockTemplates = [
    {
      id: 'tpl-001',
      name: '订单批准通知',
      type: 'ORDER_APPROVED',
      title: '订单已批准',
      content: '您的投资订单 #{orderId} 已经批准，金额：${amount}',
      variables: ['orderId', 'amount'],
      channels: ['EMAIL', 'PUSH'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'tpl-002',
      name: '佣金发放通知',
      type: 'COMMISSION_PAYMENT',
      title: '佣金已到账',
      content: '您的{period}佣金 ${amount} 已发放到您的账户',
      variables: ['period', 'amount'],
      channels: ['EMAIL'],
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z'
    }
  ];

  // Mock campaigns
  private mockCampaigns = [
    {
      id: 'camp-001',
      name: '新年促销通知',
      templateId: 'tpl-003',
      targetAudience: 'ALL',
      status: 'SCHEDULED',
      scheduledFor: '2024-02-01T09:00:00Z',
      channels: ['EMAIL', 'PUSH'],
      recipientCount: 1250,
      createdAt: '2024-01-20T10:00:00Z'
    }
  ];

  async getUserNotifications(userId: string, filters: any) {
    let filtered = this.mockNotifications.filter(n => n.userId === userId);

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(n => n.status.toLowerCase() === filters.status.toLowerCase());
    }

    const total = filtered.length;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    return {
      data: filtered.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalNotifications: total,
        unreadCount: filtered.filter(n => n.status === 'UNREAD').length,
        highPriorityCount: filtered.filter(n => n.priority === 'HIGH' || n.priority === 'URGENT').length
      }
    };
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    return {
      success: true,
      message: 'Notification marked as read',
      notificationId,
      readAt: new Date().toISOString()
    };
  }

  async markAllNotificationsAsRead(userId: string) {
    const userNotifications = this.mockNotifications.filter(n => n.userId === userId && n.status === 'UNREAD');
    
    return {
      success: true,
      message: 'All notifications marked as read',
      markedCount: userNotifications.length,
      readAt: new Date().toISOString()
    };
  }

  async getNotificationStats(userId: string) {
    const userNotifications = this.mockNotifications.filter(n => n.userId === userId);
    
    return {
      userId,
      stats: {
        total: userNotifications.length,
        unread: userNotifications.filter(n => n.status === 'UNREAD').length,
        read: userNotifications.filter(n => n.status === 'READ').length,
        byPriority: {
          urgent: userNotifications.filter(n => n.priority === 'URGENT').length,
          high: userNotifications.filter(n => n.priority === 'HIGH').length,
          medium: userNotifications.filter(n => n.priority === 'MEDIUM').length,
          low: userNotifications.filter(n => n.priority === 'LOW').length
        },
        byType: {
          orderUpdates: userNotifications.filter(n => n.type.includes('ORDER')).length,
          commissionPayments: userNotifications.filter(n => n.type.includes('COMMISSION')).length,
          systemAlerts: userNotifications.filter(n => n.type.includes('SYSTEM')).length
        }
      }
    };
  }

  async getNotificationPreferences(userId: string) {
    return {
      userId,
      preferences: {
        email: true,
        push: true,
        sms: false,
        types: {
          orderUpdates: true,
          commissionPayments: true,
          systemAlerts: true,
          promotions: false
        },
        schedule: {
          quietHoursEnabled: true,
          quietHoursStart: '22:00',
          quietHoursEnd: '08:00',
          timezone: 'UTC'
        }
      },
      lastUpdated: '2024-01-15T10:00:00Z'
    };
  }

  async updateNotificationPreferences(userId: string, preferences: any) {
    return {
      success: true,
      message: 'Notification preferences updated successfully',
      userId,
      updatedPreferences: preferences,
      updatedAt: new Date().toISOString()
    };
  }

  async deleteNotification(userId: string, notificationId: string) {
    return {
      success: true,
      message: 'Notification deleted successfully',
      userId,
      notificationId,
      deletedAt: new Date().toISOString()
    };
  }

  async getAdminNotifications(filters: any) {
    let filtered = [...this.mockNotifications];

    if (filters.type) {
      filtered = filtered.filter(n => n.type === filters.type);
    }

    if (filters.status) {
      filtered = filtered.filter(n => n.status.toLowerCase() === filters.status.toLowerCase());
    }

    if (filters.recipient) {
      filtered = filtered.filter(n => n.userId === filters.recipient);
    }

    const total = filtered.length;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    return {
      data: filtered.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalNotifications: this.mockNotifications.length,
        pendingCount: this.mockNotifications.filter(n => n.status === 'PENDING').length,
        sentCount: this.mockNotifications.filter(n => n.status !== 'PENDING').length,
        failedCount: this.mockNotifications.filter(n => n.status === 'FAILED').length
      }
    };
  }

  async sendNotification(notificationData: any) {
    const notification = {
      id: 'notif-' + Date.now(),
      ...notificationData,
      status: notificationData.scheduledFor ? 'SCHEDULED' : 'SENT',
      createdAt: new Date().toISOString(),
      sentAt: notificationData.scheduledFor ? null : new Date().toISOString()
    };

    return {
      success: true,
      message: 'Notification sent successfully',
      notification: {
        id: notification.id,
        status: notification.status,
        createdAt: notification.createdAt,
        sentAt: notification.sentAt
      },
      delivery: {
        channels: notificationData.channels,
        estimatedDelivery: notificationData.scheduledFor || new Date().toISOString()
      }
    };
  }

  async sendBulkNotifications(bulkData: any) {
    return {
      success: true,
      message: 'Bulk notifications sent successfully',
      batchId: 'batch-' + Date.now(),
      summary: {
        totalRecipients: bulkData.recipientIds.length,
        successfulSends: bulkData.recipientIds.length - 1,
        failedSends: 1,
        channels: bulkData.channels
      },
      results: bulkData.recipientIds.map((recipientId, index) => ({
        recipientId,
        status: index === 0 ? 'failed' : 'sent',
        error: index === 0 ? 'Invalid email address' : null,
        sentAt: index === 0 ? null : new Date().toISOString()
      }))
    };
  }

  async getNotificationTemplates() {
    return {
      data: this.mockTemplates,
      total: this.mockTemplates.length,
      categories: [
        { type: 'ORDER_APPROVED', name: '订单批准', count: 1 },
        { type: 'COMMISSION_PAYMENT', name: '佣金发放', count: 1 },
        { type: 'SYSTEM_MAINTENANCE', name: '系统维护', count: 0 },
        { type: 'PROMOTIONAL', name: '促销活动', count: 0 }
      ]
    };
  }

  async createNotificationTemplate(templateData: any) {
    const template = {
      id: 'tpl-' + Date.now(),
      ...templateData,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Notification template created successfully',
      template: {
        id: template.id,
        name: template.name,
        type: template.type,
        createdAt: template.createdAt
      }
    };
  }

  async updateNotificationTemplate(templateId: string, templateData: any) {
    return {
      success: true,
      message: 'Notification template updated successfully',
      templateId,
      updatedFields: Object.keys(templateData),
      updatedAt: new Date().toISOString()
    };
  }

  async deleteNotificationTemplate(templateId: string) {
    return {
      success: true,
      message: 'Notification template deleted successfully',
      templateId,
      deletedAt: new Date().toISOString()
    };
  }

  async getAdminNotificationStats(filters: any) {
    return {
      period: filters.period || '30d',
      overview: {
        totalSent: 15420,
        successRate: 97.8,
        bounceRate: 1.2,
        openRate: 68.5,
        clickRate: 23.4
      },
      byChannel: {
        email: {
          sent: 12340,
          delivered: 12100,
          opened: 8200,
          clicked: 2890
        },
        push: {
          sent: 2850,
          delivered: 2790,
          opened: 1950,
          clicked: 520
        },
        sms: {
          sent: 230,
          delivered: 225,
          opened: 215,
          clicked: 45
        }
      },
      byType: {
        orderUpdates: { count: 6200, successRate: 98.5 },
        commissionPayments: { count: 3400, successRate: 99.2 },
        systemAlerts: { count: 2800, successRate: 96.8 },
        promotions: { count: 3020, successRate: 95.1 }
      },
      trends: {
        dailyVolume: [
          { date: '2024-01-15', sent: 520, delivered: 510 },
          { date: '2024-01-16', sent: 680, delivered: 665 },
          { date: '2024-01-17', sent: 450, delivered: 440 },
          { date: '2024-01-18', sent: 720, delivered: 705 },
          { date: '2024-01-19', sent: 590, delivered: 580 }
        ]
      }
    };
  }

  async getDeliveryReport(filters: any) {
    return {
      reportId: 'report-' + Date.now(),
      filters,
      summary: {
        totalNotifications: 1540,
        successfulDeliveries: 1510,
        failedDeliveries: 30,
        successRate: 98.1
      },
      deliveryDetails: [
        {
          notificationId: 'notif-001',
          recipientId: 'usr-001',
          channel: 'EMAIL',
          status: 'DELIVERED',
          sentAt: '2024-01-20T10:30:00Z',
          deliveredAt: '2024-01-20T10:30:15Z',
          openedAt: '2024-01-20T11:15:30Z'
        },
        {
          notificationId: 'notif-002',
          recipientId: 'usr-002',
          channel: 'PUSH',
          status: 'FAILED',
          sentAt: '2024-01-20T10:30:00Z',
          error: 'Device token invalid',
          retryCount: 2
        }
      ],
      metrics: {
        averageDeliveryTime: '12.5 seconds',
        retryRate: 2.1,
        bounceRate: 1.9
      }
    };
  }

  async retryFailedNotifications(retryData: any) {
    return {
      success: true,
      message: 'Failed notifications retry initiated',
      retryBatchId: 'retry-' + Date.now(),
      summary: {
        totalRetried: retryData.notificationIds?.length || 15,
        successfulRetries: 12,
        stillFailed: 3,
        retryMethod: retryData.channel || 'ALL_CHANNELS'
      },
      results: [
        {
          notificationId: 'notif-002',
          status: 'success',
          retriedAt: new Date().toISOString()
        },
        {
          notificationId: 'notif-003',
          status: 'failed',
          error: 'Permanent delivery failure',
          retriedAt: new Date().toISOString()
        }
      ]
    };
  }

  async scheduleCampaign(campaignData: any) {
    const campaign = {
      id: 'camp-' + Date.now(),
      ...campaignData,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString()
    };

    return {
      success: true,
      message: 'Campaign scheduled successfully',
      campaign: {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        scheduledFor: campaign.scheduledFor,
        createdAt: campaign.createdAt
      },
      estimatedReach: {
        totalRecipients: campaignData.customRecipients?.length || 1250,
        channels: campaignData.channels
      }
    };
  }

  async getCampaigns(filters: any) {
    let filtered = [...this.mockCampaigns];

    if (filters.status) {
      filtered = filtered.filter(c => c.status.toLowerCase() === filters.status.toLowerCase());
    }

    const total = filtered.length;
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 20;
    const offset = (page - 1) * limit;

    return {
      data: filtered.slice(offset, offset + limit),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      summary: {
        totalCampaigns: this.mockCampaigns.length,
        scheduled: this.mockCampaigns.filter(c => c.status === 'SCHEDULED').length,
        active: this.mockCampaigns.filter(c => c.status === 'ACTIVE').length,
        completed: this.mockCampaigns.filter(c => c.status === 'COMPLETED').length
      }
    };
  }

  async cancelCampaign(campaignId: string) {
    return {
      success: true,
      message: 'Campaign cancelled successfully',
      campaignId,
      cancelledAt: new Date().toISOString(),
      refundedCredits: 1250
    };
  }
}