'use client';

import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Calendar,
  Upload,
  X,
  Plus,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';

import { 
  Badge, 
  Button, 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Checkbox, 
  Input, 
  Label, 
  Select, 
  Textarea 
} from '@/components/ui';
import { cn } from '@/lib/utils';

export interface FormField {
  key: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'file' | 'switch'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  description?: string
  defaultValue?: any
  validation?: {
    pattern?: RegExp
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    custom?: (value: any) => string | null
  }
  options?: { label: string; value: any; disabled?: boolean }[]
  dependencies?: {
    field: string
    condition: (value: any) => boolean
    action: 'show' | 'hide' | 'enable' | 'disable'
  }[]
  grid?: {
    span?: number
    order?: number
  }
  className?: string
}

interface FormBuilderProperties {
  fields: FormField[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  onCancel?: () => void
  loading?: boolean
  title?: string
  description?: string
  submitLabel?: string
  cancelLabel?: string
  className?: string
  layout?: 'vertical' | 'horizontal' | 'grid'
  gridCols?: number
  validateOnChange?: boolean
  resetOnSubmit?: boolean
}

interface FormErrors {
  [key: string]: string
}

export function FormBuilder({
  fields,
  onSubmit,
  onCancel,
  loading = false,
  title,
  description,
  submitLabel = '提交',
  cancelLabel = '取消',
  className,
  layout = 'vertical',
  gridCols = 2,
  validateOnChange = true,
  resetOnSubmit = false,
}: FormBuilderProperties) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [isDirty, setIsDirty] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    const initialData: Record<string, any> = {};
    for (const field of fields) {
      if (field.defaultValue !== undefined) {
        initialData[field.key] = field.defaultValue;
      } else if (field.type === 'checkbox') {
        initialData[field.key] = false;
      } else if (field.type === 'number') {
        initialData[field.key] = 0;
      } else {
        initialData[field.key] = '';
      }
    }
    setFormData(initialData);
  }, [fields]);

  // 字段验证
  const validateField = (field: FormField, value: any): string | null => {
    // 必填验证
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label}是必填项`;
    }

    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    const { validation } = field;
    if (!validation) return null;

    // 长度验证
    if (validation.minLength && String(value).length < validation.minLength) {
      return `${field.label}至少需要 ${validation.minLength} 个字符`;
    }
    if (validation.maxLength && String(value).length > validation.maxLength) {
      return `${field.label}不能超过 ${validation.maxLength} 个字符`;
    }

    // 数值验证
    if (field.type === 'number') {
      const numberValue = Number(value);
      if (validation.min !== undefined && numberValue < validation.min) {
        return `${field.label}不能小于 ${validation.min}`;
      }
      if (validation.max !== undefined && numberValue > validation.max) {
        return `${field.label}不能大于 ${validation.max}`;
      }
    }

    // 正则验证
    if (validation.pattern && !validation.pattern.test(String(value))) {
      return `${field.label}格式不正确`;
    }

    // 自定义验证
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  };

  // 处理字段值变化
  const handleFieldChange = (field: FormField, value: any) => {
    setFormData(previous => ({
      ...previous,
      [field.key]: value,
    }));
    setIsDirty(true);

    if (validateOnChange) {
      const error = validateField(field, value);
      setErrors(previous => ({
        ...previous,
        [field.key]: error || '',
      }));
    }
  };

  // 检查字段是否应该显示
  const shouldShowField = (field: FormField): boolean => {
    if (!field.dependencies) return true;

    return field.dependencies.every(dep => {
      const depValue = formData[dep.field];
      const conditionMet = dep.condition(depValue);
      return dep.action === 'show' ? conditionMet : !conditionMet;
    });
  };

  // 检查字段是否应该启用
  const shouldEnableField = (field: FormField): boolean => {
    if (field.disabled) return false;
    if (!field.dependencies) return true;

    return field.dependencies.every(dep => {
      const depValue = formData[dep.field];
      const conditionMet = dep.condition(depValue);
      if (dep.action === 'enable') return conditionMet;
      if (dep.action === 'disable') return !conditionMet;
      return true;
    });
  };

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let hasErrors = false;

    for (const field of fields) {
      if (!shouldShowField(field)) continue;

      const error = validateField(field, formData[field.key]);
      if (error) {
        newErrors[field.key] = error;
        hasErrors = true;
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      if (resetOnSubmit) {
        setFormData({});
        setIsDirty(false);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // 渲染字段
  const renderField = (field: FormField) => {
    if (!shouldShowField(field)) return null;

    const value = formData[field.key];
    const error = errors[field.key];
    const disabled = !shouldEnableField(field) || loading;

    const fieldId = `field-${field.key}`;
    const commonProperties = {
      id: fieldId,
      name: field.key,
      disabled,
      className: cn(
        'w-full',
        error && 'border-red-500',
        field.className,
      ),
    };

    let fieldElement: ReactNode;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'number': {
        fieldElement = (
          <Input
            {...commonProperties}
            type={field.type}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field,
              field.type === 'number' ? Number(e.target.value) : e.target.value,
            )}
          />
        );
        break;
      }

      case 'password': {
        fieldElement = (
          <div className="relative">
            <Input
              {...commonProperties}
              type={showPasswords[field.key] ? 'text' : 'password'}
              placeholder={field.placeholder}
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
              onClick={() => setShowPasswords(previous => ({
                ...previous,
                [field.key]: !previous[field.key],
              }))}
            >
              {showPasswords[field.key]
? (
                <EyeOff className="h-4 w-4" />
              )
: (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
        break;
      }

      case 'textarea': {
        fieldElement = (
          <Textarea
            {...commonProperties}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            rows={3}
          />
        );
        break;
      }

      case 'select': {
        fieldElement = (
          <select
            {...commonProperties}
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">请选择...</option>
            {field.options?.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
        );
        break;
      }

      case 'checkbox': {
        fieldElement = (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={value || false}
              onCheckedChange={(checked) => handleFieldChange(field, checked)}
              disabled={disabled}
            />
            <label
              htmlFor={fieldId}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </label>
          </div>
        );
        break;
      }

      case 'radio': {
        fieldElement = (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${fieldId}-${option.value}`}
                  name={field.key}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleFieldChange(field, e.target.value)}
                  disabled={disabled || option.disabled}
                  className="text-blue-600"
                />
                <label
                  htmlFor={`${fieldId}-${option.value}`}
                  className="text-sm font-medium"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        break;
      }

      case 'date': {
        fieldElement = (
          <div className="relative">
            <Input
              {...commonProperties}
              type="date"
              value={value || ''}
              onChange={(e) => handleFieldChange(field, e.target.value)}
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        );
        break;
      }

      case 'file': {
        fieldElement = (
          <div className="space-y-2">
            <Input
              {...commonProperties}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                handleFieldChange(field, file);
              }}
            />
            {value && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Upload className="h-4 w-4" />
                {value.name}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleFieldChange(field, null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        );
        break;
      }

      default: {
        fieldElement = (
          <Input
            {...commonProperties}
            placeholder={field.placeholder}
            value={value || ''}
            onChange={(e) => handleFieldChange(field, e.target.value)}
          />
        );
      }
    }

    return (
      <motion.div
        key={field.key}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={cn(
          'space-y-2',
          field.grid?.span && `col-span-${field.grid.span}`,
          field.grid?.order && `order-${field.grid.order}`,
        )}
      >
        {field.type !== 'checkbox' && (
          <div className="flex items-center gap-2">
            <Label htmlFor={fieldId} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.description && (
              <div className="group relative">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {field.description}
                </div>
              </div>
            )}
          </div>
        )}

        {fieldElement}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-2 text-sm text-red-600"
          >
            <AlertCircle className="h-4 w-4" />
            {error}
          </motion.div>
        )}
      </motion.div>
    );
  };

  const visibleFields = fields.filter(field => shouldShowField(field));
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <Card className={cn('w-full', className)}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && (
            <p className="text-sm text-gray-600">{description}</p>
          )}
        </CardHeader>
      )}

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={cn(
            layout === 'grid' && `grid gap-4 grid-cols-1 md:grid-cols-${gridCols}`,
            layout === 'horizontal' && 'space-y-4',
            layout === 'vertical' && 'space-y-4',
          )}
          >
            {visibleFields.map(field => renderField(field))}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center space-x-4">
              {isDirty && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  表单有未保存的更改
                </div>
              )}
              {!hasErrors && isDirty && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  表单验证通过
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelLabel}
                </Button>
              )}
              <Button
                type="submit"
                disabled={loading || hasErrors || !isDirty}
                className="flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                )}
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// 预定义字段类型
export const FieldTypes = {
  email: (key: string, label = '邮箱', required = true): FormField => ({
    key,
    label,
    type: 'email',
    required,
    placeholder: '请输入邮箱地址',
    validation: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  }),

  password: (key: string, label = '密码', required = true): FormField => ({
    key,
    label,
    type: 'password',
    required,
    placeholder: '请输入密码',
    validation: {
      minLength: 6,
      maxLength: 50,
    },
  }),

  phone: (key: string, label = '手机号', required = true): FormField => ({
    key,
    label,
    type: 'text',
    required,
    placeholder: '请输入手机号',
    validation: {
      pattern: /^1[3-9]\d{9}$/,
    },
  }),

  money: (key: string, label: string, required = true): FormField => ({
    key,
    label,
    type: 'number',
    required,
    placeholder: '请输入金额',
    validation: {
      min: 0,
    },
  }),

  select: (key: string, label: string, options: { label: string; value: any }[], required = true): FormField => ({
    key,
    label,
    type: 'select',
    required,
    options,
  }),

  multiSelect: (key: string, label: string, options: { label: string; value: any }[]): FormField => ({
    key,
    label,
    type: 'checkbox',
    options,
    defaultValue: [],
  }),
};

// 表单模板
export const FormTemplates = {
  user: (): FormField[] => [
    FieldTypes.email('email'),
    {
      key: 'name',
      label: '姓名',
      type: 'text',
      required: true,
      placeholder: '请输入姓名',
    },
    FieldTypes.phone('phone'),
    {
      key: 'role',
      label: '角色',
      type: 'select',
      required: true,
      options: [
        { label: '用户', value: 'USER' },
        { label: '代理', value: 'AGENT' },
        { label: '管理员', value: 'ADMIN' },
      ],
    },
  ],

  product: (): FormField[] => [
    {
      key: 'name',
      label: '产品名称',
      type: 'text',
      required: true,
      placeholder: '请输入产品名称',
    },
    {
      key: 'description',
      label: '产品描述',
      type: 'textarea',
      placeholder: '请输入产品描述',
    },
    FieldTypes.money('price', '价格'),
    {
      key: 'category',
      label: '分类',
      type: 'select',
      required: true,
      options: [
        { label: '基础产品', value: 'BASIC' },
        { label: '高级产品', value: 'PREMIUM' },
        { label: '企业产品', value: 'ENTERPRISE' },
      ],
    },
    {
      key: 'isActive',
      label: '启用状态',
      type: 'checkbox',
      defaultValue: true,
    },
  ],

  commission: (): FormField[] => [
    FieldTypes.money('amount', '佣金金额'),
    {
      key: 'rate',
      label: '佣金比例',
      type: 'number',
      required: true,
      placeholder: '请输入佣金比例',
      validation: {
        min: 0,
        max: 100,
      },
    },
    {
      key: 'type',
      label: '佣金类型',
      type: 'select',
      required: true,
      options: [
        { label: '直接销售', value: 'DIRECT_SALE' },
        { label: '推荐奖励', value: 'REFERRAL_BONUS' },
        { label: '绩效奖金', value: 'PERFORMANCE_BONUS' },
      ],
    },
  ],
};
