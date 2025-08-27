'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Server,
  Database,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Archive,
  HardDrive,
  Network,
  Users,
  TrendingUp,
  TrendingDown,
  Zap,
  Globe,
  Lock,
  RefreshCw,
  Download,
  Bell,
  Settings,
  Eye,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge
} from '@qa-app/ui'
import { AdminLayout } from '../../../components/admin/AdminLayout'
import { AdminGuard } from '../../../components/admin/AdminGuard'

interface SystemMetrics {
  uptime: string
  cpu: {
    usage: number
    cores: number
    load: number[]
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
  }
  network: {
    incoming: number
    outgoing: number
    connections: number
  }
}

interface ServiceStatus {
  name: string
  status: 'running' | 'stopped' | 'error' | 'warning'
  uptime: string
  version: string
  port?: number
  health: 'healthy' | 'degraded' | 'unhealthy'
  lastCheck: string
  metrics?: {
    responseTime: number
    errorRate: number
    throughput: number
  }
}

interface SecurityEvent {
  id: string
  type: 'login_failure' | 'unauthorized_access' | 'suspicious_activity' | 'rate_limit' | 'ddos_attempt'
  severity: 'low' | 'medium' | 'high' | 'critical'
  source: string
  description: string
  timestamp: string
  status: 'new' | 'investigating' | 'resolved' | 'ignored'
}

const mockSystemMetrics: SystemMetrics = {
  uptime: '15 days, 3 hours, 42 minutes',
  cpu: {
    usage: 23.5,
    cores: 8,
    load: [0.8, 1.2, 0.9]
  },
  memory: {
    used: 12.8,
    total: 32,
    percentage: 40
  },
  disk: {
    used: 245,
    total: 500,
    percentage: 49
  },
  network: {
    incoming: 150.5,
    outgoing: 89.2,
    connections: 342
  }
}

const mockServices: ServiceStatus[] = [
  {
    name: 'API服务器',
    status: 'running',
    uptime: '15 days',
    version: '1.0.0',
    port: 3001,
    health: 'healthy',
    lastCheck: '2024-01-20T10:30:00Z',
    metrics: {
      responseTime: 125,
      errorRate: 0.02,
      throughput: 450
    }
  },
  {
    name: 'Web服务器',
    status: 'running',
    uptime: '15 days',
    version: '1.0.0',
    port: 3000,
    health: 'healthy',
    lastCheck: '2024-01-20T10:30:00Z',
    metrics: {
      responseTime: 85,
      errorRate: 0.01,
      throughput: 680
    }
  },
  {
    name: 'PostgreSQL',
    status: 'running',
    uptime: '23 days',
    version: '15.3',
    port: 5432,
    health: 'healthy',
    lastCheck: '2024-01-20T10:29:00Z',
    metrics: {
      responseTime: 15,
      errorRate: 0.00,
      throughput: 1250
    }
  },
  {
    name: 'Redis缓存',
    status: 'running',
    uptime: '23 days',
    version: '7.0',
    port: 6379,
    health: 'degraded',
    lastCheck: '2024-01-20T10:30:00Z',
    metrics: {
      responseTime: 8,
      errorRate: 0.15,
      throughput: 2800
    }
  },
  {
    name: 'Hardhat网络',
    status: 'running',
    uptime: '12 hours',
    version: '2.19.5',
    port: 8545,
    health: 'healthy',
    lastCheck: '2024-01-20T10:30:00Z',
    metrics: {
      responseTime: 200,
      errorRate: 0.00,
      throughput: 45
    }
  }
]

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'sec-001',
    type: 'login_failure',
    severity: 'medium',
    source: '192.168.1.100',
    description: '连续5次登录失败尝试',
    timestamp: '2024-01-20T10:15:00Z',
    status: 'new'
  },
  {
    id: 'sec-002',
    type: 'suspicious_activity',
    severity: 'high',
    source: '10.0.0.50',
    description: '异常大量API请求',
    timestamp: '2024-01-20T09:45:00Z',
    status: 'investigating'
  },
  {
    id: 'sec-003',
    type: 'rate_limit',
    severity: 'low',
    source: '172.16.0.25',
    description: '触发频率限制',
    timestamp: '2024-01-20T09:30:00Z',
    status: 'resolved'
  }
]

export default function AdminSystemPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>(mockSystemMetrics)
  const [services, setServices] = useState<ServiceStatus[]>(mockServices)
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(mockSecurityEvents)
  const [isLoading, setIsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  // 自动刷新
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      // 模拟指标更新
      setMetrics(prev => ({
        ...prev,
        cpu: {
          ...prev.cpu,
          usage: Math.max(5, Math.min(95, prev.cpu.usage + (Math.random() - 0.5) * 10))
        },
        memory: {
          ...prev.memory,
          percentage: Math.max(20, Math.min(90, prev.memory.percentage + (Math.random() - 0.5) * 5))
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const refreshData = async () => {
    setIsLoading(true)
    try {
      // TODO: 实际从API获取数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 模拟数据更新
      setMetrics({
        ...mockSystemMetrics,
        cpu: {
          ...mockSystemMetrics.cpu,
          usage: Math.random() * 80 + 10
        }
      })
      
      alert('系统数据已刷新')
    } catch (error) {
      console.error('Failed to refresh data:', error)
      alert('刷新失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: ServiceStatus['status']) => {
    const colors = {
      running: 'text-green-600 bg-green-100',
      stopped: 'text-red-600 bg-red-100',
      error: 'text-red-600 bg-red-100',
      warning: 'text-yellow-600 bg-yellow-100'
    }
    return colors[status]
  }

  const getHealthColor = (health: ServiceStatus['health']) => {
    const colors = {
      healthy: 'text-green-600 bg-green-100',
      degraded: 'text-yellow-600 bg-yellow-100',
      unhealthy: 'text-red-600 bg-red-100'
    }
    return colors[health]
  }

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    const colors = {
      low: 'text-blue-600 bg-blue-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100'
    }
    return colors[severity]
  }

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100'
    if (percentage >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-8">
          {/* 页面标题和操作 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold">系统监控</h1>
              <p className="text-muted-foreground mt-2">
                实时监控系统状态、服务健康度和安全事件
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-refresh"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="auto-refresh" className="text-sm text-gray-700">
                  自动刷新
                </label>
              </div>
              <Button variant="outline" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                刷新数据
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                导出报告
              </Button>
            </div>
          </motion.div>

          {/* 系统指标卡片 */}
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
                    <p className="text-sm font-medium text-muted-foreground">CPU使用率</p>
                    <p className="text-2xl font-bold">{metrics.cpu.usage.toFixed(1)}%</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.cpu.usage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.cpu.cores} 核心 • 负载: {metrics.cpu.load.join(', ')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">内存使用</p>
                    <p className="text-2xl font-bold">{metrics.memory.percentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Archive className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.memory.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.memory.used}GB / {metrics.memory.total}GB
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">磁盘使用</p>
                    <p className="text-2xl font-bold">{metrics.disk.percentage}%</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${metrics.disk.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {metrics.disk.used}GB / {metrics.disk.total}GB
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">网络流量</p>
                    <p className="text-2xl font-bold">{metrics.network.connections}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Network className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">入站: {metrics.network.incoming}MB/s</span>
                  <TrendingDown className="w-4 h-4 text-red-500 ml-3 mr-1" />
                  <span className="text-red-600">出站: {metrics.network.outgoing}MB/s</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 系统信息和运行时间 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  系统信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">运行状态</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">系统运行时间</span>
                        <span className="font-medium">{metrics.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">服务状态</span>
                        <Badge className="bg-green-100 text-green-700">全部正常</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">最后检查</span>
                        <span className="font-medium">2分钟前</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">性能指标</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">平均响应时间</span>
                        <span className="font-medium">125ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">错误率</span>
                        <span className="font-medium">0.02%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">QPS</span>
                        <span className="font-medium">450</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">环境信息</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Node.js版本</span>
                        <span className="font-medium">20.10.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">部署环境</span>
                        <span className="font-medium">Production</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">区域</span>
                        <span className="font-medium">Asia-East</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 服务状态 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  服务状态
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          {service.status === 'running' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : service.status === 'error' ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                          )}
                          <span className="font-medium">{service.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(service.status)}>
                            {service.status}
                          </Badge>
                          <Badge className={getHealthColor(service.health)}>
                            {service.health}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                        <div>
                          <span>版本: {service.version}</span>
                        </div>
                        {service.port && (
                          <div>
                            <span>端口: {service.port}</span>
                          </div>
                        )}
                        <div>
                          <span>运行时间: {service.uptime}</span>
                        </div>
                        {service.metrics && (
                          <div className="flex space-x-4">
                            <span>响应: {service.metrics.responseTime}ms</span>
                            <span>错误率: {(service.metrics.errorRate * 100).toFixed(2)}%</span>
                            <span>QPS: {service.metrics.throughput}</span>
                          </div>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 安全事件 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    安全事件
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      {securityEvents.filter(e => e.status === 'new').length} 新事件
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {event.severity === 'critical' ? (
                          <XCircle className="w-5 h-5 text-red-600" />
                        ) : event.severity === 'high' ? (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                        
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium">{event.description}</span>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity}
                            </Badge>
                            <Badge 
                              variant={event.status === 'new' ? 'destructive' : 
                                      event.status === 'investigating' ? 'outline' : 'default'}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            来源: {event.source} • 时间: {new Date(event.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          查看
                        </Button>
                        {event.status === 'new' && (
                          <Button size="sm">
                            处理
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AdminLayout>
    </AdminGuard>
  )
}