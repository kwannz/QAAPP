import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { NFTCard } from './nft-card';

const meta = {
  title: 'Business/NFTCard',
  component: NFTCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'NFT 投资产品卡片组件，用于展示不同类型的固定收益产品。',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['silver', 'gold', 'diamond'],
    },
  },
  args: { onPurchase: fn() },
} satisfies Meta<typeof NFTCard>;

export default meta;
type Story = StoryObj<typeof meta>

export const Silver: Story = {
  args: {
    type: 'silver',
    name: 'QA白银卡',
    apr: 12,
    lockDays: 30,
    minAmount: 100,
    maxAmount: 10_000,
    currentSupply: 1250,
    totalSupply: 10_000,
    isActive: true,
  },
};

export const Gold: Story = {
  args: {
    type: 'gold',
    name: 'QA黄金卡',
    apr: 15,
    lockDays: 60,
    minAmount: 1000,
    maxAmount: 50_000,
    currentSupply: 2800,
    totalSupply: 5000,
    isActive: true,
  },
};

export const Diamond: Story = {
  args: {
    type: 'diamond',
    name: 'QA钻石卡',
    apr: 18,
    lockDays: 90,
    minAmount: 5000,
    maxAmount: 200_000,
    currentSupply: 850,
    totalSupply: 1000,
    isActive: true,
  },
};

export const SoldOut: Story = {
  name: '售罄状态',
  args: {
    type: 'gold',
    name: 'QA黄金卡',
    apr: 15,
    lockDays: 60,
    minAmount: 1000,
    maxAmount: 50_000,
    currentSupply: 5000,
    totalSupply: 5000,
    isActive: false,
  },
};

export const AllVariants: Story = {
  name: '所有产品类型',
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <NFTCard
        type="silver"
        name="QA白银卡"
        apr={12}
        lockDays={30}
        minAmount={100}
        maxAmount={10_000}
        currentSupply={1250}
        totalSupply={10_000}
        isActive={true}
        onPurchase={() => {
          // eslint-disable-next-line no-console
          console.log('购买白银卡');
        }}
      />
      <NFTCard
        type="gold"
        name="QA黄金卡"
        apr={15}
        lockDays={60}
        minAmount={1000}
        maxAmount={50_000}
        currentSupply={2800}
        totalSupply={5000}
        isActive={true}
        onPurchase={() => {
          // eslint-disable-next-line no-console
          console.log('购买黄金卡');
        }}
      />
      <NFTCard
        type="diamond"
        name="QA钻石卡"
        apr={18}
        lockDays={90}
        minAmount={5000}
        maxAmount={200_000}
        currentSupply={950}
        totalSupply={1000}
        isActive={true}
        onPurchase={() => {
          // eslint-disable-next-line no-console
          console.log('购买钻石卡');
        }}
      />
    </div>
  ),
};

export const Inactive: Story = {
  name: '未激活状态',
  args: {
    type: 'silver',
    name: 'QA白银卡',
    apr: 12,
    lockDays: 30,
    minAmount: 100,
    maxAmount: 10_000,
    currentSupply: 0,
    totalSupply: 10_000,
    isActive: false,
  },
};
