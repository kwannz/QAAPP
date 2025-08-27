import type { Meta, StoryObj } from '@storybook/react'
import { fn } from '@storybook/test'
import { Button } from './button'

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'QA Fixed Income Platform 的通用按钮组件，支持多种变体和状态。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'gradient', 'success', 'warning', 'premium'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
    },
  },
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: '默认按钮',
  },
}

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">默认</Button>
      <Button variant="destructive">删除</Button>
      <Button variant="outline">轮廓</Button>
      <Button variant="secondary">次要</Button>
      <Button variant="ghost">幽灵</Button>
      <Button variant="link">链接</Button>
      <Button variant="gradient">渐变</Button>
      <Button variant="success">成功</Button>
      <Button variant="warning">警告</Button>
      <Button variant="premium">高级</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">小号</Button>
      <Button size="default">默认</Button>
      <Button size="lg">大号</Button>
      <Button size="xl">特大</Button>
      <Button size="icon">🎯</Button>
    </div>
  ),
}

export const Loading: Story = {
  args: {
    loading: true,
    children: '加载中...',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    children: '禁用状态',
  },
}

export const Investment: Story = {
  name: '投资场景示例',
  render: () => (
    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">投资操作按钮</h3>
      <div className="flex flex-wrap gap-3">
        <Button variant="gradient" size="lg">
          💎 购买钻石卡
        </Button>
        <Button variant="success">
          ✅ 确认投资
        </Button>
        <Button variant="warning">
          ⚠️ 提取收益
        </Button>
        <Button variant="outline">
          📊 查看详情
        </Button>
        <Button variant="premium" loading>
          处理交易中...
        </Button>
      </div>
    </div>
  ),
}