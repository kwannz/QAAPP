'use client';

import { motion } from 'framer-motion';
import {
  Bell,
  BellRing,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  X,
  Settings,
  Filter,
  Search,
  MoreHorizontal,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { Header } from '../../components/layout/Header';
import { useSafeToast } from '../../lib/use-safe-toast';

// Mock data for notifications
const mockNotifications = [
  {
    id: 'notif-1',
    title: '投资收益到账',
    message: '您的QA钻石卡产品已产生收益 $74.18，已自动转入您的账户',
    type: 'success',
    category: 'investment',
    createdAt: '2024-02-03T10:30:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: 'notif-2',
    title: '市场风险提醒',
    message: '检测到加密货币市场波动加剧，建议关注您的投资组合风险状况',
    type: 'warning',
    category: 'market',
    createdAt: '2024-02-03T09:15:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: 'notif-3',
    title: '新产品上线通知',
    message: 'QA白金卡现已上线！年化收益率高达20%，限时优惠中',
    type: 'info',
    category: 'product',
    createdAt: '2024-02-02T16:20:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: 'notif-4',
    title: '账户安全提醒',
    message: '检测到您的账户在新设备登录，如非本人操作请及时修改密码',
    type: 'error',
    category: 'security',
    createdAt: '2024-02-02T14:45:00Z',
    read: true,
    priority: 'high'
  },
  {
    id: 'notif-5',
    title: '投资到期提醒',
    message: '您的QA白银卡将于明天到期，收益将自动结算到您的账户',
    type: 'info',
    category: 'investment',
    createdAt: '2024-02-01T11:00:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: 'notif-6',
    title: '系统维护通知',
    message: '系统将于今晚23:00-01:00进行维护升级，期间可能影响部分功能使用',
    type: 'info',
    category: 'system',
    createdAt: '2024-01-31T18:30:00Z',
    read: true,
    priority: 'low'
  }
];

const notificationStats = {
  total: 26,
  unread: 2,
  thisWeek: 8,
  high: 4
};

export default function NotificationsPage() {
  const toast = useSafeToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'read'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'investment' | 'market' | 'product' | 'security' | 'system'>('all');
  const [notifications, setNotifications] = useState(mockNotifications);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesReadFilter = filterType === 'all' || 
                             (filterType === 'read' && notification.read) ||
                             (filterType === 'unread' && !notification.read);
    const matchesCategory = filterCategory === 'all' || notification.category === filterCategory;
    return matchesSearch && matchesReadFilter && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'info': return <Info className="w-5 h-5 text-blue-600" />;
      default: return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'info': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'normal': return 'bg-blue-100 text-blue-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'normal': return '中';
      case 'low': return '低';
      default: return priority;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'investment': return '投资';
      case 'market': return '市场';
      case 'product': return '产品';
      case 'security': return '安全';
      case 'system': return '系统';
      default: return category;
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分钟前`;
    } else if (diffInHours < 24) {
      return `${diffInHours}小时前`;
    } else if (diffInDays < 7) {
      return `${diffInDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    toast.success('已标记为已读');
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: false }
          : notif
      )
    );
    toast.success('已标记为未读');
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    toast.success('已全部标记为已读');
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(notif => notif.id !== notificationId)
    );
    toast.success('通知已删除');
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <Header />
        
        <main className="flex-1 bg-gray-50">
          <div className="qa-container py-8">
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0"
              >
                <div>
                  <h1 className="text-3xl font-bold">消息通知</h1>
                  <p className="text-muted-foreground mt-2">
                    查看您的投资消息、系统通知和重要提醒
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" onClick={handleMarkAllAsRead}>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    全部已读
                  </Button>
                  <Link href="/settings">
                    <Button variant="outline" size="lg">
                      <Settings className="w-4 h-4 mr-2" />
                      通知设置
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">全部消息</p>
                        <p className="text-2xl font-bold">{notificationStats.total}</p>
                      </div>
                      <Bell className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">未读消息</p>
                        <p className="text-2xl font-bold text-red-600">{notificationStats.unread}</p>
                      </div>
                      <BellRing className="w-8 h-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">本周消息</p>
                        <p className="text-2xl font-bold">{notificationStats.thisWeek}</p>
                      </div>
                      <Clock className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">高优先级</p>
                        <p className="text-2xl font-bold text-orange-600">{notificationStats.high}</p>
                      </div>
                      <AlertTriangle className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Search and Filters */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col md:flex-row gap-4 items-center justify-between"
              >
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="搜索通知..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部</SelectItem>
                      <SelectItem value="unread">未读</SelectItem>
                      <SelectItem value="read">已读</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={(value: any) => setFilterCategory(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="类别" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类别</SelectItem>
                      <SelectItem value="investment">投资</SelectItem>
                      <SelectItem value="market">市场</SelectItem>
                      <SelectItem value="product">产品</SelectItem>
                      <SelectItem value="security">安全</SelectItem>
                      <SelectItem value="system">系统</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Notifications List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
              >
                {filteredNotifications.map((notification, index) => (
                  <Card 
                    key={notification.id} 
                    className={`hover:shadow-md transition-all cursor-pointer ${
                      notification.read ? 'opacity-75' : 'border-l-4 border-l-blue-500'
                    } ${getTypeColor(notification.type)}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between space-x-4">
                        <div className="flex items-start space-x-3 flex-1">
                          {getTypeIcon(notification.type)}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className={`font-medium ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h3>
                              <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                                {getPriorityText(notification.priority)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {getCategoryText(notification.category)}
                              </Badge>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            
                            <p className="text-muted-foreground text-sm">
                              {notification.message}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatRelativeTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {notification.read ? (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsUnread(notification.id);
                              }}
                            >
                              <EyeOff className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>

              {filteredNotifications.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">暂无通知</h3>
                    <p className="text-gray-600">
                      {searchTerm ? '没有找到匹配的通知' : '您目前没有任何通知'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}