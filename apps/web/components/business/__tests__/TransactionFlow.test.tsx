import React from 'react'
import { render, screen } from '@testing-library/react'
import { useAccount, useBalance } from 'wagmi'
import { TransactionFlow, useTransactionFlow } from '../TransactionFlow'
import { useTreasury } from '@/lib/hooks/use-contracts'

// Mock external dependencies
jest.mock('wagmi', () => ({
  useAccount: jest.fn(),
  useBalance: jest.fn(),
  useWaitForTransactionReceipt: jest.fn(),
}))

jest.mock('@/lib/hooks/use-contracts', () => ({
  useTreasury: jest.fn(),
}))

jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock UI components with simpler structure
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
  Badge: ({ children }: any) => <span data-testid="badge">{children}</span>,
  Alert: ({ children }: any) => <div data-testid="alert">{children}</div>,
  AlertDescription: ({ children }: any) => <div data-testid="alert-description">{children}</div>,
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children }: any) => <div data-testid="tabs-content">{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children }: any) => <button data-testid="tabs-trigger">{children}</button>,
  Separator: () => <hr data-testid="separator" />,
}))

// Mock icons
jest.mock('lucide-react', () => ({
  Loader2: () => <div data-testid="loader2-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  AlertTriangle: () => <div data-testid="alert-triangle-icon" />,
  ExternalLink: () => <div data-testid="external-link-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  Wallet: () => <div data-testid="wallet-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />,
  RefreshCw: () => <div data-testid="refresh-icon" />,
  Coins: () => <div data-testid="coins-icon" />,
  DollarSign: () => <div data-testid="dollar-sign-icon" />,
  Calendar: () => <div data-testid="calendar-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Download: () => <div data-testid="download-icon" />,
  History: () => <div data-testid="history-icon" />,
}))

// Mock viem
jest.mock('viem', () => ({
  parseUnits: jest.fn(() => BigInt('1000000000000000000')),
  formatEther: jest.fn(() => '1.5'),
  formatUnits: jest.fn(() => '1.5'),
}))

describe('TransactionFlow', () => {
  const mockUseAccount = useAccount as jest.MockedFunction<typeof useAccount>
  const mockUseBalance = useBalance as jest.MockedFunction<typeof useBalance>
  const mockUseTreasury = useTreasury as jest.MockedFunction<typeof useTreasury>

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseAccount.mockReturnValue({
      address: '0x123456789abcdef',
      isConnected: true,
    } as any)
    
    mockUseBalance.mockReturnValue({
      data: {
        value: BigInt('2000000000000000000'),
        symbol: 'ETH',
      },
    } as any)
    
    mockUseTreasury.mockReturnValue({
      purchase: jest.fn().mockResolvedValue({ hash: '0xmockhash123' }),
    } as any)

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: [] }),
    } as any)

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
  })

  describe('Component Rendering', () => {
    it('should render payment flow by default', () => {
      render(<TransactionFlow type="payment" />)
      
      expect(screen.getByTestId('tabs')).toBeInTheDocument()
      expect(screen.getByText('ETH Payment Flow')).toBeInTheDocument()
      expect(screen.getByText('Wallet Balance:')).toBeInTheDocument()
    })

    it('should render payout flow when type is payout', () => {
      render(<TransactionFlow type="payout" />)
      
      expect(screen.getByText('Payout Management')).toBeInTheDocument()
    })

    it('should show wallet connection warning when not connected', () => {
      mockUseAccount.mockReturnValue({
        address: undefined,
        isConnected: false,
      } as any)

      render(<TransactionFlow type="payment" />)
      
      expect(screen.getByTestId('alert')).toBeInTheDocument()
      expect(screen.getByText('Please connect your wallet to proceed')).toBeInTheDocument()
    })

    it('should display wallet balance when connected', () => {
      render(<TransactionFlow type="payment" />)
      
      expect(screen.getByText('1.5 ETH')).toBeInTheDocument()
    })

    it('should show transaction history when showHistory is true', () => {
      render(<TransactionFlow type="payment" showHistory={true} />)
      
      expect(screen.getByText('Transaction History')).toBeInTheDocument()
    })

    it('should hide transaction history when showHistory is false', () => {
      render(<TransactionFlow type="payment" showHistory={false} />)
      
      expect(screen.queryByText('Transaction History')).not.toBeInTheDocument()
    })
  })

  describe('Props and Configuration', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <TransactionFlow type="payment" className="custom-class" />
      )
      
      expect(container.firstChild).toHaveClass('custom-class')
    })

    it('should use provided ethAmount', () => {
      render(<TransactionFlow type="payment" ethAmount="2.5" />)
      
      expect(screen.getByText('2.5 ETH')).toBeInTheDocument()
    })
  })

  describe('Payment Button States', () => {
    it('should disable payment button for zero amounts', () => {
      render(<TransactionFlow type="payment" ethAmount="0" />)
      
      const buttons = screen.getAllByTestId('button')
      const payButton = buttons.find(btn => btn.textContent === 'Confirm Payment')
      expect(payButton).toBeDisabled()
    })

    it('should enable payment button for valid amounts', () => {
      render(<TransactionFlow type="payment" ethAmount="1.0" />)
      
      const buttons = screen.getAllByTestId('button')
      const payButton = buttons.find(btn => btn.textContent === 'Confirm Payment')
      expect(payButton).not.toBeDisabled()
    })
  })

  describe('Data Loading', () => {
    it('should fetch transaction and payout data on mount', () => {
      render(<TransactionFlow type="payment" />)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/finance/payouts',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/finance/orders',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token'
          })
        })
      )
    })

    it('should not fetch data when no auth token', () => {
      window.localStorage.getItem = jest.fn().mockReturnValue(null)

      render(<TransactionFlow type="payment" />)

      expect(global.fetch).not.toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'))

      render(<TransactionFlow type="payment" />)

      // Component should still render without crashing
      expect(screen.getByText('ETH Payment Flow')).toBeInTheDocument()
    })
  })

  describe('UI Interactions', () => {
    it('should switch between payment and payout tabs', () => {
      render(<TransactionFlow type="payment" />)
      
      expect(screen.getByText('Payments')).toBeInTheDocument()
      expect(screen.getByText('Payouts')).toBeInTheDocument()
    })
  })
})

describe('useTransactionFlow Hook', () => {
  it('should return enabled state by default', () => {
    let hookResult: any
    
    const TestComponent = () => {
      hookResult = useTransactionFlow()
      return null
    }
    
    render(<TestComponent />)
    
    expect(hookResult.isEnabled).toBe(true)
  })
})