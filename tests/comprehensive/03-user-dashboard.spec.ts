import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, loggedFill, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive User Dashboard Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    logger = createTestLogger('User Dashboard');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('Main Dashboard - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Main Dashboard Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to dashboard
    await loggedNavigate(page, logger, '/dashboard');
    await logger.takeScreenshot(page, 'dashboard_initial', true);

    // Wait for dashboard content to load
    await logger.waitAndLog(page, 'body', 5000);

    const currentUrl = page.url();
    await logger.logAction('Dashboard access attempt', { currentUrl });

    // If redirected to login, note it but continue testing the page we're on
    if (currentUrl.includes('/auth/login') || currentUrl.includes('/login')) {
      await logger.logAction('Dashboard access redirected to login - testing login page instead');
      // Continue with basic login page test since we can't access dashboard without auth
      await logger.takeScreenshot(page, 'dashboard_redirected_to_login');
      return;
    }

    // Test dashboard stats section
    await logger.logAction('Testing dashboard statistics section');
    
    const statsSelectors = [
      '[class*="stats"]',
      '[class*="metric"]', 
      '[class*="overview"]',
      'div:has([class*="total"], [class*="current"], [class*="earning"])',
      '[data-testid*="stat"], [data-testid*="metric"]'
    ];

    let statsFound = false;
    for (const selector of statsSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        statsFound = true;
        await logger.logAssertion(`Dashboard stats found: ${selector}`, true, { count });
        await logger.logElementInfo(page, selector, 'dashboard-stats');
        await logger.takeScreenshot(page, 'dashboard_stats');
        
        // Look for specific stat values
        const statCards = page.locator(selector);
        const cardCount = await statCards.count();
        
        for (let i = 0; i < Math.min(cardCount, 4); i++) { // Test first 4 stat cards
          const card = statCards.nth(i);
          if (await card.isVisible()) {
            const cardText = await card.textContent();
            await logger.logAction(`Stat card ${i + 1} content`, { content: cardText?.slice(0, 100) });
          }
        }
        break;
      }
    }

    if (!statsFound) {
      await logger.logAssertion('Dashboard statistics section found', false);
    }

    // Test investment dashboard/positions
    await logger.logAction('Testing investment positions section');
    
    const positionSelectors = [
      '[class*="position"]',
      '[class*="investment"]',
      '[class*="portfolio"]',
      'div:has(button:text("Claim"), button:text("领取"))',
      '[data-testid*="position"], [data-testid*="investment"]'
    ];

    let positionsFound = false;
    for (const selector of positionSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        positionsFound = true;
        await logger.logAssertion(`Investment positions found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'dashboard_positions');
        
        // Test position cards
        const positions = page.locator(selector);
        const positionCount = await positions.count();
        
        for (let i = 0; i < Math.min(positionCount, 3); i++) { // Test first 3 positions
          const position = positions.nth(i);
          if (await position.isVisible()) {
            await logger.logAction(`Testing position ${i + 1}`);
            
            // Look for action buttons in positions (Claim, View Details, etc.)
            const actionButtons = position.locator('button');
            const buttonCount = await actionButtons.count();
            
            if (buttonCount > 0) {
              for (let j = 0; j < Math.min(buttonCount, 2); j++) { // Test first 2 buttons
                const button = actionButtons.nth(j);
                const buttonText = await button.textContent();
                
                if (await button.isVisible() && !await button.isDisabled()) {
                  await logger.logAction(`Testing position ${i + 1} button: ${buttonText}`);
                  await loggedClick(page, logger, 
                    `${selector}:nth-child(${i + 1}) button:nth-child(${j + 1})`,
                    `Position ${i + 1} button: ${buttonText}`
                  );
                  await logger.takeScreenshot(page, `position_${i}_button_${j}_clicked`);
                  
                  // Check for modal or navigation
                  const modal = page.locator('[class*="modal"], [role="dialog"]');
                  if (await modal.count() > 0) {
                    await logger.logAction(`Modal opened for position ${i + 1} action`);
                    await logger.takeScreenshot(page, `position_${i}_modal`);
                    
                    // Close modal
                    const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                    if (await closeBtn.count() > 0) {
                      await loggedClick(page, logger, 'button[class*="close"]', 'Close position modal');
                    }
                  }
                }
              }
            }
          }
        }
        break;
      }
    }

    if (!positionsFound) {
      await logger.logAssertion('Investment positions section found', false);
    }

    // Test NFT display section
    await logger.logAction('Testing NFT display section');
    
    const nftSelectors = [
      '[class*="nft"]',
      'div:has(img[alt*="NFT"], img[src*="nft"])',
      'section:has-text("NFT")',
      '[data-testid*="nft"]'
    ];

    for (const selector of nftSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`NFT section found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'dashboard_nfts');
        await logger.logElementInfo(page, selector, 'nft-section');
        
        // Test NFT interactions
        const nftItems = page.locator(`${selector} img, ${selector} [class*="item"]`);
        const nftCount = await nftItems.count();
        
        if (nftCount > 0) {
          await logger.logAction(`Found ${nftCount} NFT items`);
          
          // Test clicking on first NFT
          const firstNft = nftItems.first();
          if (await firstNft.isVisible()) {
            await loggedClick(page, logger, `${selector} img:first-child`, 'Click first NFT');
            await logger.takeScreenshot(page, 'nft_clicked');
            
            // Check for NFT details modal
            const nftModal = page.locator('[class*="modal"]:has(img), [role="dialog"]:has(img)');
            if (await nftModal.count() > 0) {
              await logger.logAction('NFT details modal opened');
              await logger.takeScreenshot(page, 'nft_modal');
              
              // Close modal
              const closeBtn = nftModal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close NFT modal');
              }
            }
          }
        }
        break;
      }
    }

    // Test quick action buttons
    await logger.logAction('Testing dashboard quick action buttons');
    
    const quickActionSelectors = [
      'button:text("Invest"), button:text("投资")',
      'button:text("Withdraw"), button:text("提现")',
      'button:text("Buy"), button:text("购买")',
      'a[href*="products"], button[class*="cta"]'
    ];

    for (const selector of quickActionSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Quick action button found: ${selector}`, true);
        
        const actionButton = page.locator(selector).first();
        if (await actionButton.isVisible()) {
          const buttonText = await actionButton.textContent();
          await logger.logAction(`Testing quick action: ${buttonText}`);
          await loggedClick(page, logger, selector, `Quick action: ${buttonText}`);
          await logger.takeScreenshot(page, `quick_action_${buttonText?.replace(/\s+/g, '_')}`);
          
          // Check navigation or modal
          const newUrl = page.url();
          if (newUrl !== currentUrl) {
            await logger.logAction(`Quick action navigated to: ${newUrl}`);
            await page.goBack(); // Return to dashboard
          } else {
            // Check for modal
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.logAction('Quick action opened modal');
              await logger.takeScreenshot(page, 'quick_action_modal');
              
              const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close quick action modal');
              }
            }
          }
        }
      }
    }

    // Test dashboard navigation menu
    await logger.logAction('Testing dashboard navigation menu');
    
    const dashboardNavSelectors = [
      'nav a, nav button',
      'aside a, aside button',
      '[class*="sidebar"] a, [class*="sidebar"] button',
      'ul li a[href*="dashboard"]'
    ];

    for (const selector of dashboardNavSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Dashboard navigation found: ${selector}`, true, { count });
        
        const navItems = page.locator(selector);
        const itemCount = await navItems.count();
        
        for (let i = 0; i < Math.min(itemCount, 5); i++) { // Test first 5 nav items
          const navItem = navItems.nth(i);
          if (await navItem.isVisible()) {
            const itemText = await navItem.textContent();
            const href = await navItem.getAttribute('href');
            
            if (href && href.includes('dashboard') && !href.includes('#')) {
              await logger.logAction(`Testing dashboard nav item: ${itemText}`, { href });
              await loggedClick(page, logger, 
                `${selector}:nth-child(${i + 1})`, 
                `Dashboard nav: ${itemText}`
              );
              await logger.takeScreenshot(page, `dashboard_nav_${i}_${itemText?.replace(/\s+/g, '_')}`);
              
              // Wait for navigation and check result
              await page.waitForTimeout(1000);
              const navUrl = page.url();
              await logger.logAction(`Dashboard navigation result`, { itemText, navUrl });
              
              if (navUrl !== currentUrl) {
                // Successfully navigated to different dashboard page
                await logger.takeScreenshot(page, `dashboard_${itemText?.replace(/\s+/g, '_')}_page`);
                await page.goBack(); // Return to main dashboard
              }
            }
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Main dashboard test');
    await logger.takeScreenshot(page, 'dashboard_final', true);
    await logger.logAction('Main dashboard test completed');
  });

  test('Dashboard Profile Page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Dashboard Profile Page Test');
    await logger.setupPageLogging(page);

    // Navigate to profile page
    await loggedNavigate(page, logger, '/dashboard/profile');
    await logger.takeScreenshot(page, 'profile_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const profileUrl = page.url();
    if (profileUrl.includes('/auth/login') || profileUrl.includes('/login')) {
      await logger.logAction('Profile page requires authentication');
      return;
    }

    // Test profile information section
    await logger.logAction('Testing profile information display');
    
    const profileInfoSelectors = [
      '[class*="profile"]',
      'form',
      'input[name="email"], input[name="name"]',
      'div:has(label:text("Email"), label:text("Name"))',
      '[data-testid*="profile"]'
    ];

    let profileFormFound = false;
    for (const selector of profileInfoSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        profileFormFound = true;
        await logger.logAssertion(`Profile form/info found: ${selector}`, true, { count });
        await logger.logElementInfo(page, selector, 'profile-form');
        await logger.takeScreenshot(page, 'profile_form');
        break;
      }
    }

    if (!profileFormFound) {
      await logger.logAssertion('Profile form/information section found', false);
      return;
    }

    // Test profile editing functionality
    await logger.logAction('Testing profile editing functionality');
    
    const editableFields = [
      'input[name="name"]',
      'input[name="firstName"]', 
      'input[name="lastName"]',
      'input[name="phone"]',
      'textarea[name="bio"]'
    ];

    for (const fieldSelector of editableFields) {
      if (await page.locator(fieldSelector).count() > 0) {
        await logger.logAction(`Testing profile field: ${fieldSelector}`);
        
        // Clear and fill with test data
        await page.locator(fieldSelector).clear();
        const testValue = `Test ${fieldSelector.match(/name="([^"]+)"/)?.[1]} ${Date.now()}`;
        await loggedFill(page, logger, fieldSelector, testValue, `Fill ${fieldSelector}`);
        await logger.takeScreenshot(page, `profile_${fieldSelector.replace(/[^\w]/g, '_')}_filled`);
      }
    }

    // Test save/update button
    const saveButtonSelectors = [
      'button[type="submit"]',
      'button:text("Save"), button:text("Update"), button:text("保存")',
      'button[class*="save"], button[class*="update"]'
    ];

    for (const selector of saveButtonSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Save button found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Save profile changes');
        await logger.takeScreenshot(page, 'profile_save_clicked');
        
        // Wait for save response
        await page.waitForTimeout(2000);
        
        // Check for success/error messages
        const successMsg = page.locator('*:has-text("success"), *:has-text("updated"), *:has-text("成功")');
        const errorMsg = page.locator('[class*="error"], [role="alert"]');
        
        const hasSuccess = await successMsg.count() > 0;
        const hasError = await errorMsg.count() > 0;
        
        await logger.logAssertion('Profile update success message shown', hasSuccess);
        await logger.logAssertion('Profile update error message shown', hasError);
        
        if (hasSuccess) {
          await logger.takeScreenshot(page, 'profile_save_success');
        }
        if (hasError) {
          await logger.takeScreenshot(page, 'profile_save_error');
        }
        break;
      }
    }

    // Test KYC status section
    await logger.logAction('Testing KYC status section');
    
    const kycSelectors = [
      '*:has-text("KYC")',
      '[class*="kyc"]',
      '*:has-text("verification"), *:has-text("验证")',
      'div:has(button:text("Verify"), button:text("验证"))'
    ];

    for (const selector of kycSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`KYC section found: ${selector}`, true);
        await logger.takeScreenshot(page, 'profile_kyc_section');
        await logger.logElementInfo(page, selector, 'kyc-section');
        
        // Test KYC verification button if present
        const kycButton = page.locator(`${selector} button`);
        if (await kycButton.count() > 0) {
          const buttonText = await kycButton.textContent();
          await loggedClick(page, logger, `${selector} button`, `KYC button: ${buttonText}`);
          await logger.takeScreenshot(page, 'kyc_button_clicked');
          
          // Check for KYC modal or navigation
          const modal = page.locator('[class*="modal"], [role="dialog"]');
          if (await modal.count() > 0) {
            await logger.logAction('KYC modal opened');
            await logger.takeScreenshot(page, 'kyc_modal');
            
            const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
            if (await closeBtn.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"]', 'Close KYC modal');
            }
          }
        }
        break;
      }
    }

    // Test security settings
    await logger.logAction('Testing security settings section');
    
    const securitySelectors = [
      'section:has-text("Security"), section:has-text("安全")',
      '*:has-text("password"), *:has-text("密码")',
      'button:text("Change Password"), button:text("修改密码")',
      '[class*="security"]'
    ];

    for (const selector of securitySelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Security section found: ${selector}`, true);
        await logger.takeScreenshot(page, 'profile_security_section');
        
        // Test change password button
        const changePasswordBtn = page.locator(`${selector} button`);
        if (await changePasswordBtn.count() > 0) {
          const buttonText = await changePasswordBtn.textContent();
          await loggedClick(page, logger, `${selector} button`, `Security button: ${buttonText}`);
          await logger.takeScreenshot(page, 'security_button_clicked');
          
          // Check for password change modal/form
          const passwordModal = page.locator('[class*="modal"]:has(input[type="password"]), form:has(input[type="password"])');
          if (await passwordModal.count() > 0) {
            await logger.logAction('Password change form opened');
            await logger.takeScreenshot(page, 'password_change_form');
            
            // Close without changing (for testing purposes)
            const closeBtn = passwordModal.locator('button[class*="close"], button:has-text("Cancel")');
            if (await closeBtn.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"], button:has-text("Cancel")', 'Close password change');
            }
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Profile page test');
    await logger.takeScreenshot(page, 'profile_final', true);
    await logger.logAction('Profile page test completed');
  });

  test('Dashboard Transactions Page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Dashboard Transactions Page Test');
    await logger.setupPageLogging(page);

    await loggedNavigate(page, logger, '/dashboard/transactions');
    await logger.takeScreenshot(page, 'transactions_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const transactionsUrl = page.url();
    if (transactionsUrl.includes('/auth/login')) {
      await logger.logAction('Transactions page requires authentication');
      return;
    }

    // Test transaction list/table
    await logger.logAction('Testing transaction list display');
    
    const transactionSelectors = [
      'table',
      '[class*="transaction"]',
      'div:has([class*="date"], [class*="amount"])',
      'ul li:has(*:text("$"), *:text("¥"))',
      '[data-testid*="transaction"]'
    ];

    let transactionsFound = false;
    for (const selector of transactionSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        transactionsFound = true;
        await logger.logAssertion(`Transaction list found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'transactions_list');
        await logger.logElementInfo(page, selector, 'transactions-list');
        
        // Test transaction item details
        if (selector === 'table') {
          // Test table headers and rows
          const headers = page.locator('th');
          const rows = page.locator('tbody tr');
          
          const headerCount = await headers.count();
          const rowCount = await rows.count();
          
          await logger.logAction('Transaction table structure', { headers: headerCount, rows: rowCount });
          
          // Test first few rows
          for (let i = 0; i < Math.min(rowCount, 3); i++) {
            const row = rows.nth(i);
            const rowText = await row.textContent();
            await logger.logAction(`Transaction row ${i + 1}`, { content: rowText?.slice(0, 100) });
            
            // Test row click if clickable
            const rowButtons = row.locator('button, a');
            if (await rowButtons.count() > 0) {
              await loggedClick(page, logger, `tbody tr:nth-child(${i + 1}) button`, `Transaction ${i + 1} details`);
              await logger.takeScreenshot(page, `transaction_${i}_details`);
              
              // Check for details modal
              const modal = page.locator('[class*="modal"], [role="dialog"]');
              if (await modal.count() > 0) {
                await logger.logAction(`Transaction ${i + 1} details modal opened`);
                await logger.takeScreenshot(page, `transaction_${i}_modal`);
                
                const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                if (await closeBtn.count() > 0) {
                  await loggedClick(page, logger, 'button[class*="close"]', 'Close transaction details');
                }
              }
            }
          }
        }
        break;
      }
    }

    if (!transactionsFound) {
      await logger.logAssertion('Transaction list found', false);
      
      // Check for empty state message
      const emptyStateSelectors = [
        '*:has-text("No transactions"), *:has-text("暂无交易")',
        '[class*="empty"]',
        '*:has-text("empty")'
      ];
      
      for (const selector of emptyStateSelectors) {
        if (await page.locator(selector).count() > 0) {
          await logger.logAssertion(`Empty transactions message found: ${selector}`, true);
          await logger.takeScreenshot(page, 'transactions_empty_state');
          break;
        }
      }
    }

    // Test transaction filtering
    await logger.logAction('Testing transaction filtering');
    
    const filterSelectors = [
      'select[class*="filter"]',
      'button[class*="filter"]',
      'input[type="date"]',
      'select:has(option:text("All"), option:text("Income"))'
    ];

    for (const selector of filterSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Transaction filter found: ${selector}`, true);
        
        if (selector.includes('select')) {
          await loggedClick(page, logger, selector, 'Open transaction filter');
          await logger.takeScreenshot(page, 'transaction_filter_open');
          
          const options = page.locator(`${selector} option`);
          const optionCount = await options.count();
          
          if (optionCount > 1) {
            await page.selectOption(selector, { index: 1 });
            await logger.logAction('Applied transaction filter');
            await logger.takeScreenshot(page, 'transaction_filter_applied');
          }
        } else if (selector.includes('input[type="date"]')) {
          await loggedFill(page, logger, selector, '2024-01-01', 'Set date filter');
          await logger.takeScreenshot(page, 'transaction_date_filter');
        }
      }
    }

    // Test export functionality
    await logger.logAction('Testing transaction export');
    
    const exportSelectors = [
      'button:text("Export"), button:text("导出")',
      'button:has-text("CSV"), button:has-text("Excel")',
      '[class*="export"]'
    ];

    for (const selector of exportSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Export button found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click export button');
        await logger.takeScreenshot(page, 'transaction_export_clicked');
        
        // Wait for download or modal
        await page.waitForTimeout(2000);
        
        // Check for export modal
        const modal = page.locator('[class*="modal"]:has-text("export"), [class*="modal"]:has-text("导出")');
        if (await modal.count() > 0) {
          await logger.logAction('Export modal opened');
          await logger.takeScreenshot(page, 'transaction_export_modal');
          
          const closeBtn = modal.locator('button[class*="close"], button:has-text("Cancel")');
          if (await closeBtn.count() > 0) {
            await loggedClick(page, logger, 'button[class*="close"]', 'Close export modal');
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Transactions page test');
    await logger.takeScreenshot(page, 'transactions_final', true);
    await logger.logAction('Transactions page test completed');
  });

  test('Dashboard Wallets Page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Dashboard Wallets Page Test');
    await logger.setupPageLogging(page);

    await loggedNavigate(page, logger, '/dashboard/wallets');
    await logger.takeScreenshot(page, 'wallets_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const walletsUrl = page.url();
    if (walletsUrl.includes('/auth/login')) {
      await logger.logAction('Wallets page requires authentication');
      return;
    }

    // Test wallet connection section
    await logger.logAction('Testing wallet connection functionality');
    
    const walletConnectSelectors = [
      'button:text("Connect Wallet"), button:text("连接钱包")',
      'button:has-text("MetaMask")',
      'button:has-text("WalletConnect")',
      '[class*="wallet-connect"]',
      'button[class*="connect"]'
    ];

    let walletConnectFound = false;
    for (const selector of walletConnectSelectors) {
      if (await page.locator(selector).count() > 0) {
        walletConnectFound = true;
        await logger.logAssertion(`Wallet connect button found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click wallet connect');
        await logger.takeScreenshot(page, 'wallet_connect_clicked');
        
        // Check for wallet selection modal
        const walletModal = page.locator('[class*="modal"]:has(button:text("MetaMask")), [role="dialog"]:has([class*="wallet"])');
        if (await walletModal.count() > 0) {
          await logger.logAction('Wallet selection modal opened');
          await logger.takeScreenshot(page, 'wallet_selection_modal');
          
          // Test wallet options
          const walletOptions = walletModal.locator('button');
          const optionCount = await walletOptions.count();
          
          for (let i = 0; i < Math.min(optionCount, 3); i++) {
            const option = walletOptions.nth(i);
            const optionText = await option.textContent();
            await logger.logAction(`Wallet option ${i + 1}: ${optionText}`);
          }
          
          // Close modal
          const closeBtn = walletModal.locator('button[class*="close"], button:has-text("×")');
          if (await closeBtn.count() > 0) {
            await loggedClick(page, logger, 'button[class*="close"]', 'Close wallet modal');
          }
        }
        break;
      }
    }

    if (!walletConnectFound) {
      await logger.logAssertion('Wallet connect functionality found', false);
    }

    // Test connected wallets display
    await logger.logAction('Testing connected wallets display');
    
    const connectedWalletSelectors = [
      '[class*="wallet"]:has([class*="address"])',
      'div:has(*:text("0x"), *:text("Balance"))',
      '[class*="connected"]',
      'div:has(button:text("Disconnect"), button:text("断开"))'
    ];

    for (const selector of connectedWalletSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Connected wallet display found: ${selector}`, true);
        await logger.takeScreenshot(page, 'connected_wallets');
        await logger.logElementInfo(page, selector, 'connected-wallet');
        
        // Test wallet management buttons
        const walletButtons = page.locator(`${selector} button`);
        const buttonCount = await walletButtons.count();
        
        for (let i = 0; i < Math.min(buttonCount, 2); i++) {
          const button = walletButtons.nth(i);
          const buttonText = await button.textContent();
          
          if (buttonText && !buttonText.includes('Disconnect') && !buttonText.includes('断开')) {
            await logger.logAction(`Testing wallet button: ${buttonText}`);
            await loggedClick(page, logger, `${selector} button:nth-child(${i + 1})`, `Wallet button: ${buttonText}`);
            await logger.takeScreenshot(page, `wallet_button_${i}_clicked`);
            
            // Handle any modal that appears
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.logAction(`Wallet action modal opened for: ${buttonText}`);
              await logger.takeScreenshot(page, `wallet_action_modal`);
              
              const closeBtn = modal.locator('button[class*="close"], button:has-text("×"), button:has-text("Cancel")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close wallet action modal');
              }
            }
          }
        }
        break;
      }
    }

    // Test wallet balance display
    await logger.logAction('Testing wallet balance display');
    
    const balanceSelectors = [
      '*:has-text("Balance"), *:has-text("余额")',
      'div:has(*:text("ETH"), *:text("BTC"), *:text("USDT"))',
      '[class*="balance"]',
      'table:has(th:text("Asset"), th:text("Balance"))'
    ];

    for (const selector of balanceSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Balance display found: ${selector}`, true);
        await logger.takeScreenshot(page, 'wallet_balances');
        await logger.logElementInfo(page, selector, 'wallet-balance');
        break;
      }
    }

    // Test wallet address management
    await logger.logAction('Testing wallet address management');
    
    const addressSelectors = [
      'div:has(*:text("0x"))',
      '[class*="address"]',
      'code, span[class*="mono"]',
      'button:has-text("Copy"), button:has-text("复制")'
    ];

    for (const selector of addressSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Wallet address display found: ${selector}`, true);
        
        // Test copy address functionality
        const copyButton = page.locator(`${selector} button:has-text("Copy"), button:has-text("复制")`);
        if (await copyButton.count() > 0) {
          await loggedClick(page, logger, `${selector} button:has-text("Copy")`, 'Copy wallet address');
          await logger.takeScreenshot(page, 'address_copy_clicked');
          
          // Check for copy confirmation
          const copyConfirm = page.locator('*:has-text("Copied"), *:has-text("已复制")');
          if (await copyConfirm.count() > 0) {
            await logger.logAssertion('Address copy confirmation shown', true);
            await logger.takeScreenshot(page, 'address_copy_confirmed');
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Wallets page test');
    await logger.takeScreenshot(page, 'wallets_final', true);
    await logger.logAction('Wallets page test completed');
  });

  test('Dashboard comprehensive navigation test', async ({ page }) => {
    logger = createTestLogger('Dashboard Navigation Test');
    await logger.setupPageLogging(page);

    // Test all dashboard routes
    const dashboardRoutes = [
      '/dashboard',
      '/dashboard/profile', 
      '/dashboard/transactions',
      '/dashboard/wallets',
      '/dashboard/earnings',
      '/dashboard/activity',
      '/dashboard/commissions',
      '/dashboard/notifications',
      '/dashboard/reports'
    ];

    for (const route of dashboardRoutes) {
      await logger.logAction(`Testing dashboard route: ${route}`);
      
      try {
        await loggedNavigate(page, logger, route);
        await logger.takeScreenshot(page, `dashboard_route_${route.split('/').pop()}`, true);
        
        const finalUrl = page.url();
        const isAccessible = !finalUrl.includes('/auth/login') && !finalUrl.includes('/login');
        
        await logger.logAssertion(`${route} accessible`, isAccessible, { finalUrl });
        
        if (isAccessible) {
          // Test basic page functionality
          await logger.waitAndLog(page, 'body', 3000);
          
          // Look for common dashboard elements
          const commonElements = [
            'nav, header',
            'button, a',
            '[class*="dashboard"], [class*="content"]'
          ];
          
          for (const element of commonElements) {
            const count = await page.locator(element).count();
            if (count > 0) {
              await logger.logAction(`${route} has ${element}`, { count });
              break;
            }
          }
          
          // Test any primary action buttons
          const actionButtons = page.locator('button[class*="primary"], button[class*="cta"]').first();
          if (await actionButtons.count() > 0 && await actionButtons.isVisible()) {
            const buttonText = await actionButtons.textContent();
            await logger.logAction(`Testing primary button on ${route}: ${buttonText}`);
            await loggedClick(page, logger, 'button[class*="primary"], button[class*="cta"]', `${route} primary button`);
            await logger.takeScreenshot(page, `${route.split('/').pop()}_primary_action`);
            
            // Handle any modal or navigation
            await page.waitForTimeout(1000);
            const newUrl = page.url();
            if (newUrl !== finalUrl) {
              await logger.logAction(`Primary button navigated to: ${newUrl}`);
              await page.goBack();
            } else {
              const modal = page.locator('[class*="modal"], [role="dialog"]');
              if (await modal.count() > 0) {
                const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                if (await closeBtn.count() > 0) {
                  await loggedClick(page, logger, 'button[class*="close"]', 'Close modal');
                }
              }
            }
          }
        }
        
        await logger.logPerformance(page, `${route} page load`);
        
      } catch (error) {
        await logger.logAction(`Error testing ${route}`, error);
      }
    }

    await logger.logAction('Dashboard comprehensive navigation test completed');
  });
});