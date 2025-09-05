import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PortfolioManager, usePortfolioManager } from '../PortfolioManager'

// Mock external dependencies
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock UI components with simple structure
jest.mock('@/components/ui', () => ({
  Card: ({ children }: any) => <div data-testid="card">{children}</div>,
  CardContent: ({ children }: any) => <div data-testid="card-content">{children}</div>,
  CardHeader: ({ children }: any) => <div data-testid="card-header">{children}</div>,
  CardTitle: ({ children }: any) => <h3 data-testid="card-title">{children}</h3>,
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="button">
      {children}
    </button>
  ),
  Badge: ({ children, variant }: any) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  Tabs: ({ children, value, onValueChange }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid="tabs-content" data-value={value}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => (
    <button data-testid="tabs-trigger" data-value={value}>{children}</button>
  ),
  Input: ({ value, onChange, placeholder, type, min, max }: any) => (
    <input 
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      min={min}
      max={max}
      data-testid="input"
    />
  ),
}))

// Mock icons
jest.mock('lucide-react', () => ({
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  Target: () => <div data-testid="target-icon" />,
  Award: () => <div data-testid="award-icon" />,
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  CheckCircle2: () => <div data-testid="check-circle2-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Package: () => <div data-testid="package-icon" />,
  PieChart: () => <div data-testid="pie-chart-icon" />,
  Activity: () => <div data-testid="activity-icon" />,
  Info: () => <div data-testid="info-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
}))

describe('PortfolioManager', () => {
  const mockProducts = [
    {
      id: 'prod1',
      name: 'Fixed Income Product',
      description: 'Stable returns product',
      type: 'FIXED_INCOME' as const,
      expectedReturn: 12,
      minInvestment: 1000,
      maxInvestment: 100000,
      duration: 90,
      isActive: true,
      totalInvested: 50000,
      availableCapacity: 50000,
      riskLevel: 'low' as const,
      currency: 'USDT' as const,
    },
    {
      id: 'prod2',
      name: 'Growth Product',
      description: 'Higher yield product',
      type: 'VARIABLE_YIELD' as const,
      expectedReturn: 18,
      minInvestment: 5000,
      maxInvestment: 200000,
      duration: 180,
      isActive: true,
      totalInvested: 75000,
      availableCapacity: 25000,
      riskLevel: 'high' as const,
      currency: 'ETH' as const,
    }
  ]

  const mockPositions = [
    {
      id: 'pos1',
      userId: 'user1',
      productId: 'prod1',
      orderId: 'order1',
      principal: 10000,
      startDate: '2023-12-01T00:00:00Z',
      endDate: '2024-03-01T00:00:00Z',
      nextPayoutAt: '2024-01-01T00:00:00Z',
      currentValue: 11500,
      totalEarnings: 1500,
      status: 'active' as const,
      product: mockProducts[0]
    }
  ]

  const mockSummary = {
    totalValue: 125000,
    totalEarnings: 15000,
    activePositions: 3,
    averageReturn: 14.5,
    monthlyIncome: 5000
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue('mock-token'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    })
    
    // Mock fetch responses
    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes('/finance/positions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockPositions }),
        })
      }
      if (url.includes('/finance/products')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: mockProducts }),
        })
      }
      if (url.includes('/users/me/portfolio')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSummary),
        })
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    }) as jest.Mock
  })

  describe('Component Rendering', () => {
    it('should render portfolio manager with default tabs', () => {
      render(<PortfolioManager />)
      
      expect(screen.getByText('投资组合管理')).toBeInTheDocument()
      expect(screen.getByText('总览')).toBeInTheDocument()
      expect(screen.getByText('持仓')).toBeInTheDocument()
      expect(screen.getByText('产品')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const { container } = render(
        <PortfolioManager className="custom-portfolio-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-portfolio-class')
    })
  })

  describe('Portfolio Overview', () => {
    it('should display portfolio summary correctly', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('¥125,000')).toBeInTheDocument()
        expect(screen.getByText('总资产价值')).toBeInTheDocument()
        expect(screen.getByText('¥15,000')).toBeInTheDocument()
        expect(screen.getByText('总收益')).toBeInTheDocument()
        expect(screen.getByText('3')).toBeInTheDocument()
        expect(screen.getByText('活跃投资')).toBeInTheDocument()
        expect(screen.getByText('14.5%')).toBeInTheDocument()
        expect(screen.getByText('平均收益率')).toBeInTheDocument()
      })
      
      expect(screen.getAllByText('¥5,000')).toHaveLength(2)
    })
  })

  describe('Data Loading', () => {
    it('should fetch all portfolio data on mount', () => {
      render(<PortfolioManager />)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/finance/positions',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/finance/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/users/me/portfolio',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })

    it('should not fetch data when no auth token', () => {
      window.localStorage.getItem = jest.fn().mockReturnValue(null)

      render(<PortfolioManager />)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Product Features', () => {
    it('should show risk levels with appropriate badges', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('低风险')).toBeInTheDocument()
        expect(screen.getByText('高风险')).toBeInTheDocument()
      })
    })

    it('should display investment progress percentages', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument() // Fixed Income: 50000/(50000+50000)
        expect(screen.getByText('75.0%')).toBeInTheDocument() // Growth: 75000/(75000+25000)
      })
    })
  })

  describe('Analytics Display', () => {
    it('should show portfolio distribution and trends', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('投资组合分布')).toBeInTheDocument()
        expect(screen.getByText('收益趋势')).toBeInTheDocument()
        expect(screen.getByText('收益趋势图表 - 等待图表库集成')).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading spinner during data fetch', () => {
      // Mock a slow response
      global.fetch = jest.fn().mockImplementation(() => 
        new Promise(resolve => {
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          }), 1000)
        })
      ) as jest.Mock

      render(<PortfolioManager />)

      expect(screen.getByText('加载投资头寸中...')).toBeInTheDocument()
    })
  })

  describe('UI Interactions', () => {
    it('should have refresh button', () => {
      render(<PortfolioManager />)
      
      expect(screen.getByText('刷新数据')).toBeInTheDocument()
    })

    it('should display investment buttons for products', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        const investButtons = screen.getAllByText('立即投资')
        expect(investButtons).toHaveLength(2) // Two products
      })
    })
  })

  describe('Modal Functionality', () => {
    it('should open product investment modal when invest button clicked', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        const investButtons = screen.getAllByText('立即投资')
        fireEvent.click(investButtons[0])
      })

      expect(screen.getByText('投资 Fixed Income Product')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('投资金额')).toBeInTheDocument()
    })

    it('should close modal when cancel button clicked', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        const investButtons = screen.getAllByText('立即投资')
        fireEvent.click(investButtons[0])
      })

      expect(screen.getByText('投资 Fixed Income Product')).toBeInTheDocument()

      fireEvent.click(screen.getByText('取消'))

      expect(screen.queryByText('投资 Fixed Income Product')).not.toBeInTheDocument()
    })

    it('should validate investment amount limits', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        const investButtons = screen.getAllByText('立即投资')
        fireEvent.click(investButtons[0])
      })

      const amountInput = screen.getByTestId('input')
      expect(amountInput).toHaveAttribute('min', '1000')
      expect(amountInput).toHaveAttribute('max', '100000')
    })
  })

  describe('Position Management', () => {
    it('should show position status badges correctly', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        const statusBadges = screen.getAllByTestId('badge')
        const activeBadge = statusBadges.find(badge => badge.textContent === 'active')
        expect(activeBadge).toHaveAttribute('data-variant', 'default')
      })
    })

    it('should display position details', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('开始日期:')).toBeInTheDocument()
        expect(screen.getByText('到期日期:')).toBeInTheDocument()
        expect(screen.getByText('下次分红:')).toBeInTheDocument()
      })
    })

    it('should have view details buttons', async () => {
      render(<PortfolioManager />)

      await waitFor(() => {
        expect(screen.getByText('查看详情')).toBeInTheDocument()
      })
    })
  })

  describe('Configuration Props', () => {
    it('should hide position details when showPositionDetails is false', () => {
      render(<PortfolioManager showPositionDetails={false} />)
      
      expect(screen.queryByText('持仓')).not.toBeInTheDocument()
    })

    it('should hide product catalog when showProductCatalog is false', () => {
      render(<PortfolioManager showProductCatalog={false} />)
      
      expect(screen.queryByText('产品')).not.toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle individual API failures gracefully', async () => {
      global.fetch = jest.fn().mockImplementation((url: string) => {
        if (url.includes('/finance/positions')) {
          return Promise.reject(new Error('Positions API error'))
        }
        if (url.includes('/finance/products')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: [] }),
          })
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            totalValue: 125000,
            totalEarnings: 15000,
            activePositions: 3,
            averageReturn: 14.5,
            monthlyIncome: 5000
          }),
        })
      }) as jest.Mock

      render(<PortfolioManager />)

      await waitFor(() => {
        // Should still display other data that loaded successfully
        expect(screen.getByText('¥125,000')).toBeInTheDocument()
      })
    })

    it('should handle complete API failure gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Complete API failure'))

      render(<PortfolioManager />)

      // Component should still render basic UI
      expect(screen.getByText('投资组合管理')).toBeInTheDocument()
    })
  })

  describe('Basic Functionality', () => {
    it('should render main components', () => {
      render(<PortfolioManager />)
      
      expect(screen.getByText('投资组合管理')).toBeInTheDocument()
      expect(screen.getByText('刷新数据')).toBeInTheDocument()
    })

    it('should have analytics section', () => {
      render(<PortfolioManager />)

      expect(screen.getByText('投资组合分布')).toBeInTheDocument()
      expect(screen.getByText('收益趋势')).toBeInTheDocument()
      expect(screen.getByText('收益趋势图表 - 等待图表库集成')).toBeInTheDocument()
    })
  })
})

describe('usePortfolioManager Hook', () => {
  it('should return enabled state by default', () => {
    let hookResult: any
    
    const TestComponent = () => {
      hookResult = usePortfolioManager()
      return null
    }
    
    render(<TestComponent />)
    
    expect(hookResult.isEnabled).toBe(true)
  })

  it('should maintain enabled state with userId', () => {
    let hookResult: any
    
    const TestComponent = () => {
      hookResult = usePortfolioManager('user123')
      return null
    }
    
    render(<TestComponent />)
    
    expect(hookResult.isEnabled).toBe(true)
  })
})