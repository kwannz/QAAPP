'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Label } from '@/components/ui';
import { 
  Settings, 
  Briefcase, 
  Shield, 
  CreditCard, 
  Bell, 
  Save,
  RotateCcw,
  Download,
  Upload,
  History,
  TestTube,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface ConfigData {
  system: any;
  business: any;
  security: any;
  payment: any;
  notifications: any;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('system');
  const [configData, setConfigData] = useState<ConfigData>({
    system: {
      siteName: 'QA Investment Platform',
      siteUrl: 'https://qa-investment.com',
      supportEmail: 'support@qa-investment.com',
      maintenanceMode: false,
      allowRegistration: true,
      maxFileUpload: 10485760,
      defaultLanguage: 'en',
      timezone: 'UTC'
    },
    business: {
      minimumInvestment: 1000,
      maximumInvestment: 1000000,
      defaultRiskLevel: 'MEDIUM',
      kycRequired: true,
      autoApprovalLimit: 10000,
      commissionRates: {
        level1: 3.0,
        level2: 2.5,
        level3: 2.0,
        level4: 1.5,
        level5: 1.0
      }
    },
    security: {
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSymbols: true
      },
      sessionTimeout: 3600,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      enableRateLimit: true,
      rateLimitWindow: 900,
      rateLimitMax: 100
    },
    payment: {
      enabledMethods: ['BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTOCURRENCY'],
      defaultCurrency: 'USD',
      minimumAmount: 100,
      maximumAmount: 100000,
      processingFee: 2.5,
      withdrawalLimit: 50000,
      autoProcessingThreshold: 5000
    },
    notifications: {
      emailEnabled: true,
      smsEnabled: false,
      pushEnabled: true,
      emailProvider: 'sendgrid',
      smsProvider: 'twilio'
    }
  });

  const [testResults, setTestResults] = useState<any>({});
  const [isTesting, setIsTesting] = useState(false);

  const configTabs = [
    { id: 'system', name: '系统设置', icon: Settings, description: '基本系统设置和通用配置' },
    { id: 'business', name: '业务设置', icon: Briefcase, description: '投资限额、佣金费率和业务规则' },
    { id: 'security', name: '安全设置', icon: Shield, description: '认证、授权和安全策略' },
    { id: 'payment', name: '支付设置', icon: CreditCard, description: '支付方式、限额和处理设置' },
    { id: 'notifications', name: '通知设置', icon: Bell, description: '邮件、短信和推送通知设置' }
  ];

  const handleConfigChange = (category: string, field: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleNestedConfigChange = (category: string, parentField: string, field: string, value: any) => {
    setConfigData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [parentField]: {
          ...prev[category][parentField],
          [field]: value
        }
      }
    }));
  };

  const handleSaveConfig = async (category: string) => {
    try {
      // Mock API call
      console.log(`Saving ${category} configuration:`, configData[category]);
      // Here you would make an API call to save the configuration
      alert(`${category}配置已保存成功！`);
    } catch (error) {
      console.error('Failed to save configuration:', error);
      alert('保存配置失败，请重试。');
    }
  };

  const handleTestConfig = async (category: string) => {
    setIsTesting(true);
    try {
      // Mock API call for testing configuration
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockResults = {
        system: { passed: 5, warnings: 0, errors: 0 },
        business: { passed: 4, warnings: 1, errors: 0 },
        security: { passed: 3, warnings: 2, errors: 0 },
        payment: { passed: 4, warnings: 1, errors: 0 },
        notifications: { passed: 3, warnings: 1, errors: 1 }
      };
      setTestResults({ ...testResults, [category]: mockResults[category] });
    } catch (error) {
      console.error('Configuration test failed:', error);
    } finally {
      setIsTesting(false);
    }
  };

  const handleResetToDefaults = async (category: string) => {
    if (confirm(`确定要将${category}配置重置为默认值吗？此操作不可撤销。`)) {
      // Reset to default values
      const defaults = {
        system: {
          siteName: 'QA Investment Platform',
          siteUrl: 'https://qa-investment.com',
          supportEmail: 'support@qa-investment.com',
          maintenanceMode: false,
          allowRegistration: true,
          maxFileUpload: 10485760,
          defaultLanguage: 'en',
          timezone: 'UTC'
        },
        business: {
          minimumInvestment: 1000,
          maximumInvestment: 1000000,
          defaultRiskLevel: 'MEDIUM',
          kycRequired: true,
          autoApprovalLimit: 10000,
          commissionRates: {
            level1: 3.0,
            level2: 2.5,
            level3: 2.0,
            level4: 1.5,
            level5: 1.0
          }
        }
      };
      
      if (defaults[category]) {
        setConfigData(prev => ({
          ...prev,
          [category]: defaults[category]
        }));
        alert(`${category}配置已重置为默认值。`);
      }
    }
  };

  const renderSystemConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">站点名称</Label>
          <Input
            id="siteName"
            value={configData.system.siteName}
            onChange={(e) => handleConfigChange('system', 'siteName', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="siteUrl">站点URL</Label>
          <Input
            id="siteUrl"
            value={configData.system.siteUrl}
            onChange={(e) => handleConfigChange('system', 'siteUrl', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">支持邮箱</Label>
          <Input
            id="supportEmail"
            type="email"
            value={configData.system.supportEmail}
            onChange={(e) => handleConfigChange('system', 'supportEmail', e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">时区</Label>
          <select
            id="timezone"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={configData.system.timezone}
            onChange={(e) => handleConfigChange('system', 'timezone', e.target.value)}
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">Eastern Time</option>
            <option value="America/Los_Angeles">Pacific Time</option>
            <option value="Asia/Shanghai">China Standard Time</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">系统选项</h4>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.system.maintenanceMode}
              onChange={(e) => handleConfigChange('system', 'maintenanceMode', e.target.checked)}
            />
            <span>维护模式</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.system.allowRegistration}
              onChange={(e) => handleConfigChange('system', 'allowRegistration', e.target.checked)}
            />
            <span>允许用户注册</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderBusinessConfig = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="minInvestment">最小投资金额</Label>
          <Input
            id="minInvestment"
            type="number"
            value={configData.business.minimumInvestment}
            onChange={(e) => handleConfigChange('business', 'minimumInvestment', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxInvestment">最大投资金额</Label>
          <Input
            id="maxInvestment"
            type="number"
            value={configData.business.maximumInvestment}
            onChange={(e) => handleConfigChange('business', 'maximumInvestment', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="autoApprovalLimit">自动审批限额</Label>
          <Input
            id="autoApprovalLimit"
            type="number"
            value={configData.business.autoApprovalLimit}
            onChange={(e) => handleConfigChange('business', 'autoApprovalLimit', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultRiskLevel">默认风险等级</Label>
          <select
            id="defaultRiskLevel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={configData.business.defaultRiskLevel}
            onChange={(e) => handleConfigChange('business', 'defaultRiskLevel', e.target.value)}
          >
            <option value="LOW">低风险</option>
            <option value="MEDIUM">中风险</option>
            <option value="HIGH">高风险</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">佣金费率设置</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(configData.business.commissionRates).map(([level, rate]) => (
            <div key={level} className="space-y-2">
              <Label>{level.replace('level', '等级 ')} (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={rate}
                onChange={(e) => handleNestedConfigChange('business', 'commissionRates', level, Number(e.target.value))}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.business.kycRequired}
            onChange={(e) => handleConfigChange('business', 'kycRequired', e.target.checked)}
          />
          <span>必需KYC验证</span>
        </label>
      </div>
    </div>
  );

  const renderSecurityConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">密码策略</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minLength">最小长度</Label>
            <Input
              id="minLength"
              type="number"
              value={configData.security.passwordPolicy.minLength}
              onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'minLength', Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.security.passwordPolicy.requireUppercase}
              onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireUppercase', e.target.checked)}
            />
            <span>需要大写字母</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.security.passwordPolicy.requireLowercase}
              onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireLowercase', e.target.checked)}
            />
            <span>需要小写字母</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.security.passwordPolicy.requireNumbers}
              onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireNumbers', e.target.checked)}
            />
            <span>需要数字</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={configData.security.passwordPolicy.requireSymbols}
              onChange={(e) => handleNestedConfigChange('security', 'passwordPolicy', 'requireSymbols', e.target.checked)}
            />
            <span>需要特殊符号</span>
          </label>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="sessionTimeout">会话超时时间 (秒)</Label>
          <Input
            id="sessionTimeout"
            type="number"
            value={configData.security.sessionTimeout}
            onChange={(e) => handleConfigChange('security', 'sessionTimeout', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxLoginAttempts">最大登录尝试次数</Label>
          <Input
            id="maxLoginAttempts"
            type="number"
            value={configData.security.maxLoginAttempts}
            onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.security.enableTwoFactor}
            onChange={(e) => handleConfigChange('security', 'enableTwoFactor', e.target.checked)}
          />
          <span>启用双因素认证</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.security.enableRateLimit}
            onChange={(e) => handleConfigChange('security', 'enableRateLimit', e.target.checked)}
          />
          <span>启用访问速率限制</span>
        </label>
      </div>
    </div>
  );

  const renderPaymentConfig = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-medium">支付方式</h4>
        <div className="space-y-3">
          {['BANK_TRANSFER', 'CREDIT_CARD', 'CRYPTOCURRENCY'].map(method => (
            <label key={method} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={configData.payment.enabledMethods.includes(method)}
                onChange={(e) => {
                  const methods = configData.payment.enabledMethods;
                  if (e.target.checked) {
                    handleConfigChange('payment', 'enabledMethods', [...methods, method]);
                  } else {
                    handleConfigChange('payment', 'enabledMethods', methods.filter(m => m !== method));
                  }
                }}
              />
              <span>
                {method === 'BANK_TRANSFER' && '银行转账'}
                {method === 'CREDIT_CARD' && '信用卡'}
                {method === 'CRYPTOCURRENCY' && '加密货币'}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="minAmount">最小金额</Label>
          <Input
            id="minAmount"
            type="number"
            value={configData.payment.minimumAmount}
            onChange={(e) => handleConfigChange('payment', 'minimumAmount', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxAmount">最大金额</Label>
          <Input
            id="maxAmount"
            type="number"
            value={configData.payment.maximumAmount}
            onChange={(e) => handleConfigChange('payment', 'maximumAmount', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="processingFee">处理费率 (%)</Label>
          <Input
            id="processingFee"
            type="number"
            step="0.1"
            value={configData.payment.processingFee}
            onChange={(e) => handleConfigChange('payment', 'processingFee', Number(e.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="withdrawalLimit">提现限额</Label>
          <Input
            id="withdrawalLimit"
            type="number"
            value={configData.payment.withdrawalLimit}
            onChange={(e) => handleConfigChange('payment', 'withdrawalLimit', Number(e.target.value))}
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationConfig = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.notifications.emailEnabled}
            onChange={(e) => handleConfigChange('notifications', 'emailEnabled', e.target.checked)}
          />
          <span>启用邮件通知</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.notifications.smsEnabled}
            onChange={(e) => handleConfigChange('notifications', 'smsEnabled', e.target.checked)}
          />
          <span>启用短信通知</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={configData.notifications.pushEnabled}
            onChange={(e) => handleConfigChange('notifications', 'pushEnabled', e.target.checked)}
          />
          <span>启用推送通知</span>
        </label>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="emailProvider">邮件服务商</Label>
          <select
            id="emailProvider"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={configData.notifications.emailProvider}
            onChange={(e) => handleConfigChange('notifications', 'emailProvider', e.target.value)}
          >
            <option value="sendgrid">SendGrid</option>
            <option value="ses">Amazon SES</option>
            <option value="mailgun">Mailgun</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="smsProvider">短信服务商</Label>
          <select
            id="smsProvider"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={configData.notifications.smsProvider}
            onChange={(e) => handleConfigChange('notifications', 'smsProvider', e.target.value)}
          >
            <option value="twilio">Twilio</option>
            <option value="nexmo">Nexmo</option>
            <option value="aliyun">阿里云短信</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderConfigSection = () => {
    switch (activeTab) {
      case 'system': return renderSystemConfig();
      case 'business': return renderBusinessConfig();
      case 'security': return renderSecurityConfig();
      case 'payment': return renderPaymentConfig();
      case 'notifications': return renderNotificationConfig();
      default: return renderSystemConfig();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="mt-2 text-sm text-gray-600">管理平台配置和系统设置</p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出配置
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            导入配置
          </Button>
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            配置历史
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 左侧菜单 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">配置类别</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {configTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm text-left hover:bg-gray-50 ${
                        activeTab === tab.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <div>
                        <div className={`font-medium ${activeTab === tab.id ? 'text-blue-700' : 'text-gray-900'}`}>
                          {tab.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{tab.description}</div>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* 右侧内容区 */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{configTabs.find(tab => tab.id === activeTab)?.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTestConfig(activeTab)}
                    disabled={isTesting}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {isTesting ? '测试中...' : '测试配置'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleResetToDefaults(activeTab)}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    重置默认
                  </Button>
                  <Button size="sm" onClick={() => handleSaveConfig(activeTab)}>
                    <Save className="h-4 w-4 mr-2" />
                    保存配置
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                {configTabs.find(tab => tab.id === activeTab)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 测试结果显示 */}
              {testResults[activeTab] && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">配置测试结果</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        通过: {testResults[activeTab].passed}
                      </span>
                      <span className="flex items-center text-yellow-600">
                        <AlertTriangle className="h-4 w-4 mr-1" />
                        警告: {testResults[activeTab].warnings}
                      </span>
                      <span className="flex items-center text-red-600">
                        <Info className="h-4 w-4 mr-1" />
                        错误: {testResults[activeTab].errors}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* 配置表单 */}
              {renderConfigSection()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}