import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Dashboard and Investment pages
 * Provides reusable methods for investment product interactions
 */
export class DashboardPage {
  readonly page: Page;
  
  // Navigation elements
  readonly userMenu: Locator;
  readonly dashboardLink: Locator;
  readonly productsLink: Locator;
  readonly portfolioLink: Locator;
  readonly transactionsLink: Locator;
  readonly profileLink: Locator;
  
  // Dashboard elements
  readonly welcomeMessage: Locator;
  readonly portfolioValue: Locator;
  readonly totalReturns: Locator;
  readonly activeInvestments: Locator;
  
  // Investment products
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly investButton: Locator;
  readonly productDetailsModal: Locator;
  
  // Investment form
  readonly investmentModal: Locator;
  readonly amountInput: Locator;
  readonly confirmInvestButton: Locator;
  readonly investmentSuccess: Locator;
  readonly investmentError: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Navigation
    this.userMenu = page.locator('[data-testid="user-menu"], .user-menu');
    this.dashboardLink = page.locator('a[href="/dashboard"], a:has-text("仪表板"), a:has-text("Dashboard")');
    this.productsLink = page.locator('a[href="/products"], a:has-text("产品"), a:has-text("Products")');
    this.portfolioLink = page.locator('a[href="/portfolio"], a:has-text("投资组合"), a:has-text("Portfolio")');
    this.transactionsLink = page.locator('a[href="/transactions"], a:has-text("交易记录"), a:has-text("Transactions")');
    this.profileLink = page.locator('a[href="/profile"], a:has-text("个人资料"), a:has-text("Profile")');
    
    // Dashboard content
    this.welcomeMessage = page.locator('[data-testid="welcome-message"], .welcome-message, h1:has-text("欢迎"), h1:has-text("Welcome")');
    this.portfolioValue = page.locator('[data-testid="portfolio-value"], .portfolio-value');
    this.totalReturns = page.locator('[data-testid="total-returns"], .total-returns');
    this.activeInvestments = page.locator('[data-testid="active-investments"], .active-investments');
    
    // Products
    this.productGrid = page.locator('[data-testid="product-grid"], .product-grid, .products-container');
    this.productCards = page.locator('[data-testid="product-card"], .product-card');
    this.investButton = page.locator('button:has-text("投资"), button:has-text("Invest"), [data-testid="invest-button"]');
    this.productDetailsModal = page.locator('[data-testid="product-details"], .product-modal, .modal');
    
    // Investment flow
    this.investmentModal = page.locator('[data-testid="investment-modal"], .investment-modal, .modal:has(input[name="amount"])');
    this.amountInput = page.locator('input[name="amount"], input[placeholder*="金额"], input[placeholder*="amount"]');
    this.confirmInvestButton = page.locator('button:has-text("确认投资"), button:has-text("Confirm Investment"), [data-testid="confirm-invest"]');
    this.investmentSuccess = page.locator('[data-testid="investment-success"], .success-message, .alert-success');
    this.investmentError = page.locator('[data-testid="investment-error"], .error-message, .alert-error');
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboard() {
    await this.page.goto('/dashboard');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to products page
   */
  async goToProducts() {
    await this.page.goto('/products');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is on dashboard
   */
  async isOnDashboard(): Promise<boolean> {
    return this.page.url().includes('/dashboard');
  }

  /**
   * Get user's portfolio value
   */
  async getPortfolioValue(): Promise<string | null> {
    if (await this.portfolioValue.count() > 0) {
      return await this.portfolioValue.textContent();
    }
    return null;
  }

  /**
   * Get list of available investment products
   */
  async getAvailableProducts(): Promise<Array<{name: string, expectedReturn: string, minInvestment: string}>> {
    await this.goToProducts();
    
    const products = [];
    const productCount = await this.productCards.count();
    
    for (let i = 0; i < productCount; i++) {
      const productCard = this.productCards.nth(i);
      const name = await productCard.locator('h3, .product-name, [data-testid="product-name"]').textContent() || '';
      const expectedReturn = await productCard.locator('.expected-return, [data-testid="expected-return"]').textContent() || '';
      const minInvestment = await productCard.locator('.min-investment, [data-testid="min-investment"]').textContent() || '';
      
      products.push({
        name: name.trim(),
        expectedReturn: expectedReturn.trim(),
        minInvestment: minInvestment.trim()
      });
    }
    
    return products;
  }

  /**
   * Invest in a product by name
   */
  async investInProduct(productName: string, amount: string) {
    await this.goToProducts();
    
    // Find the product card by name
    const productCard = this.productCards.filter({
      has: this.page.locator(`:text("${productName}")`)
    }).first();
    
    if (await productCard.count() === 0) {
      throw new Error(`Product "${productName}" not found`);
    }
    
    // Click invest button on the product card
    const investButton = productCard.locator('button:has-text("投资"), button:has-text("Invest")');
    await investButton.click();
    
    // Wait for investment modal to appear
    await this.investmentModal.waitFor({ state: 'visible' });
    
    // Fill investment amount
    await this.amountInput.fill(amount);
    
    // Confirm investment
    await this.confirmInvestButton.click();
    
    // Wait for success or error message
    await Promise.race([
      this.investmentSuccess.waitFor({ state: 'visible', timeout: 10000 }),
      this.investmentError.waitFor({ state: 'visible', timeout: 10000 })
    ]);
  }

  /**
   * Check if investment was successful
   */
  async isInvestmentSuccessful(): Promise<boolean> {
    return await this.investmentSuccess.count() > 0 && await this.investmentSuccess.isVisible();
  }

  /**
   * Get investment error message
   */
  async getInvestmentError(): Promise<string | null> {
    if (await this.investmentError.count() > 0 && await this.investmentError.isVisible()) {
      return await this.investmentError.textContent();
    }
    return null;
  }

  /**
   * Navigate using the main menu
   */
  async navigateToSection(section: 'dashboard' | 'products' | 'portfolio' | 'transactions' | 'profile') {
    const links = {
      dashboard: this.dashboardLink,
      products: this.productsLink,
      portfolio: this.portfolioLink,
      transactions: this.transactionsLink,
      profile: this.profileLink
    };
    
    const link = links[section];
    if (await link.count() > 0) {
      await link.click();
      await this.page.waitForLoadState('networkidle');
    } else {
      throw new Error(`Navigation link for "${section}" not found`);
    }
  }

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(): Promise<Array<{type: string, amount: string, date: string, status: string}>> {
    await this.navigateToSection('transactions');
    
    const transactions = [];
    const transactionRows = this.page.locator('[data-testid="transaction-row"], .transaction-row, tbody tr');
    const count = await transactionRows.count();
    
    for (let i = 0; i < count; i++) {
      const row = transactionRows.nth(i);
      const type = await row.locator('td:nth-child(1), .transaction-type').textContent() || '';
      const amount = await row.locator('td:nth-child(2), .transaction-amount').textContent() || '';
      const date = await row.locator('td:nth-child(3), .transaction-date').textContent() || '';
      const status = await row.locator('td:nth-child(4), .transaction-status').textContent() || '';
      
      transactions.push({
        type: type.trim(),
        amount: amount.trim(),
        date: date.trim(),
        status: status.trim()
      });
    }
    
    return transactions;
  }

  /**
   * Check wallet connection status
   */
  async isWalletConnected(): Promise<boolean> {
    const walletIndicators = [
      this.page.locator('[data-testid="wallet-address"]'),
      this.page.locator('.wallet-address'),
      this.page.locator('button:has-text("已连接"), button:has-text("Connected")'),
      this.page.locator('.wallet-connected')
    ];
    
    for (const indicator of walletIndicators) {
      if (await indicator.count() > 0 && await indicator.isVisible()) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Connect wallet
   */
  async connectWallet() {
    const connectButton = this.page.locator(
      'button:has-text("连接钱包"), button:has-text("Connect Wallet"), [data-testid="connect-wallet"]'
    );
    
    if (await connectButton.count() > 0) {
      await connectButton.click();
      
      // Wait for wallet selection modal or connection success
      await Promise.race([
        this.page.locator('.wallet-modal, [data-testid="wallet-modal"]').waitFor({ state: 'visible' }),
        this.page.locator('.wallet-connected, [data-testid="wallet-connected"]').waitFor({ state: 'visible' })
      ]);
    }
  }

  /**
   * Take screenshot of current page
   */
  async takeScreenshot(filename: string) {
    await this.page.screenshot({ 
      path: `test-results/dashboard-${filename}-${Date.now()}.png`,
      fullPage: true 
    });
  }
}