import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, loggedFill, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive Web3 Integration Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    logger = createTestLogger('Web3 Integration');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('Web3 wallet connection - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Web3 Wallet Connection Test');
    await logger.setupPageLogging(page);

    // Test wallet connection from homepage
    await loggedNavigate(page, logger, '/');
    await logger.takeScreenshot(page, 'web3_homepage_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    // Look for wallet connection buttons
    await logger.logAction('Searching for wallet connection buttons');
    
    const walletConnectionSelectors = [
      'button:text("Connect Wallet"), button:text("连接钱包")',
      'button:has-text("MetaMask")',
      'button:has-text("WalletConnect")',
      'button[class*="wallet"], button[class*="connect"]',
      '[class*="wallet-connect"]',
      'button:has([class*="wallet"])'
    ];

    let walletButtonFound = false;
    for (const selector of walletConnectionSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        walletButtonFound = true;
        await logger.logAssertion(`Wallet connection button found: ${selector}`, true, { count });
        await logger.logElementInfo(page, selector, 'wallet-connect-button');
        await logger.takeScreenshot(page, 'wallet_button_found');
        
        // Test wallet connection button click
        const walletButton = page.locator(selector).first();
        if (await walletButton.isVisible()) {
          const buttonText = await walletButton.textContent();
          await logger.logAction(`Testing wallet button: ${buttonText}`);
          await loggedClick(page, logger, selector, `Wallet connect: ${buttonText}`);
          await logger.takeScreenshot(page, 'wallet_button_clicked');
          
          // Wait for wallet connection modal or popup
          await page.waitForTimeout(2000);
          
          // Check for wallet selection modal
          const walletModal = page.locator('[class*="modal"], [role="dialog"]');
          if (await walletModal.count() > 0) {
            await logger.logAction('Wallet selection modal appeared');
            await logger.takeScreenshot(page, 'wallet_selection_modal');
            
            // Test wallet options in modal
            const walletOptions = walletModal.locator('button');
            const optionCount = await walletOptions.count();
            
            await logger.logAction(`Found ${optionCount} wallet options in modal`);
            
            for (let i = 0; i < Math.min(optionCount, 4); i++) { // Test first 4 wallet options
              const option = walletOptions.nth(i);
              const optionText = await option.textContent();
              
              if (optionText && !optionText.includes('×') && !optionText.includes('Close')) {
                await logger.logAction(`Wallet option ${i + 1}: ${optionText}`);
                await logger.logElementInfo(page, `[class*="modal"] button:nth-child(${i + 1})`, 'wallet-option');
                
                // Test clicking wallet option (but don't actually connect)
                if (optionText.includes('MetaMask') || optionText.includes('WalletConnect')) {
                  await logger.logAction(`Testing ${optionText} wallet option`);
                  await loggedClick(page, logger, `[class*="modal"] button:nth-child(${i + 1})`, `Select ${optionText}`);
                  await logger.takeScreenshot(page, `wallet_${optionText.replace(/\s+/g, '_')}_selected`);
                  
                  // Wait for wallet interaction
                  await page.waitForTimeout(3000);
                  
                  // Check for MetaMask popup or WalletConnect QR code
                  const qrCode = page.locator('[class*="qr"], canvas, img[alt*="QR"]');
                  const metamaskPrompt = page.locator('*:has-text("MetaMask"), *:has-text("Please approve")');
                  
                  if (await qrCode.count() > 0) {
                    await logger.logAction(`${optionText} QR code appeared`);
                    await logger.takeScreenshot(page, `${optionText}_qr_code`);
                  }
                  
                  if (await metamaskPrompt.count() > 0) {
                    await logger.logAction(`${optionText} connection prompt appeared`);
                    await logger.takeScreenshot(page, `${optionText}_connection_prompt`);
                  }
                  
                  // Check for connection timeout or error messages
                  await page.waitForTimeout(5000);
                  
                  const errorMessage = page.locator('[class*="error"], *:has-text("failed"), *:has-text("timeout")');
                  if (await errorMessage.count() > 0) {
                    await logger.logAction(`Wallet connection error detected`);
                    await logger.takeScreenshot(page, 'wallet_connection_error');
                  }
                  
                  // Check for successful connection
                  const connectedIndicator = page.locator('*:has-text("Connected"), *:has-text("0x"), button:has-text("Disconnect")');
                  if (await connectedIndicator.count() > 0) {
                    await logger.logAction(`Wallet appears to be connected`);
                    await logger.takeScreenshot(page, 'wallet_connected_success');
                  }
                  
                  break; // Only test one wallet option to avoid conflicts
                }
              }
            }
            
            // Close wallet modal
            const closeButton = walletModal.locator('button[class*="close"], button:has-text("×"), button:has-text("Cancel")');
            if (await closeButton.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"]', 'Close wallet modal');
              await logger.takeScreenshot(page, 'wallet_modal_closed');
            }
          } else {
            // Check for direct wallet integration (no modal)
            await logger.logAction('No wallet modal - checking for direct integration');
            
            // Wait for wallet extension popup or connection
            await page.waitForTimeout(5000);
            
            const connectedElements = page.locator('*:has-text("Connected"), *:has-text("0x"), button:has-text("Disconnect")');
            if (await connectedElements.count() > 0) {
              await logger.logAction('Direct wallet connection successful');
              await logger.takeScreenshot(page, 'direct_wallet_connected');
            } else {
              await logger.logAction('No wallet connection detected');
            }
          }
        }
        break;
      }
    }

    if (!walletButtonFound) {
      await logger.logAssertion('Web3 wallet connection functionality found', false);
      
      // Check other pages for wallet functionality
      const pagesWithWallets = ['/dashboard', '/dashboard/wallets', '/products'];
      
      for (const page_route of pagesWithWallets) {
        await logger.logAction(`Checking ${page_route} for wallet functionality`);
        await loggedNavigate(page, logger, page_route);
        await logger.takeScreenshot(page, `wallet_check_${page_route.replace('/', '_')}`);
        
        for (const selector of walletConnectionSelectors) {
          if (await page.locator(selector).count() > 0) {
            await logger.logAssertion(`Wallet functionality found on ${page_route}`, true);
            walletButtonFound = true;
            break;
          }
        }
        
        if (walletButtonFound) break;
      }
    }

    await logger.logPerformance(page, 'Web3 wallet connection test');
    await logger.logAction('Web3 wallet connection test completed');
  });

  test('Web3 transaction flows - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Web3 Transaction Flows Test');
    await logger.setupPageLogging(page);

    // Navigate to products page to test purchase flows
    await loggedNavigate(page, logger, '/products');
    await logger.takeScreenshot(page, 'web3_products_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    // Look for products with Web3/crypto payment options
    await logger.logAction('Testing Web3 transaction flows for product purchases');
    
    const productSelectors = [
      '[class*="product"]:has(button:text("Buy"), button:text("购买"))',
      '[class*="card"]:has(button[class*="purchase"])',
      'div:has(button:text("ETH"), button:text("USDT"))',
      '[data-testid*="product"]'
    ];

    let productFound = false;
    for (const selector of productSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        productFound = true;
        await logger.logAssertion(`Product with purchase option found: ${selector}`, true, { count });
        
        // Test first product purchase flow
        const product = page.locator(selector).first();
        if (await product.isVisible()) {
          await logger.logAction('Testing product purchase flow');
          
          const purchaseButton = product.locator('button');
          const buttonCount = await purchaseButton.count();
          
          if (buttonCount > 0) {
            const button = purchaseButton.first();
            const buttonText = await button.textContent();
            await logger.logAction(`Testing purchase button: ${buttonText}`);
            
            await loggedClick(page, logger, `${selector} button`, `Product purchase: ${buttonText}`);
            await logger.takeScreenshot(page, 'product_purchase_clicked');
            
            // Wait for purchase modal or payment flow
            await page.waitForTimeout(2000);
            
            // Check for payment modal
            const paymentModal = page.locator('[class*="modal"], [role="dialog"]');
            if (await paymentModal.count() > 0) {
              await logger.logAction('Payment modal opened');
              await logger.takeScreenshot(page, 'payment_modal');
              
              // Look for Web3 payment options
              const web3PaymentOptions = paymentModal.locator('button:text("ETH"), button:text("USDT"), button:text("MetaMask"), [class*="crypto"], [class*="web3"]');
              const web3OptionCount = await web3PaymentOptions.count();
              
              if (web3OptionCount > 0) {
                await logger.logAssertion(`Web3 payment options found`, true, { count: web3OptionCount });
                
                for (let i = 0; i < Math.min(web3OptionCount, 3); i++) { // Test first 3 Web3 options
                  const option = web3PaymentOptions.nth(i);
                  const optionText = await option.textContent();
                  
                  await logger.logAction(`Testing Web3 payment option: ${optionText}`);
                  await loggedClick(page, logger, 
                    `[class*="modal"] button:nth-child(${i + 1})`,
                    `Web3 payment: ${optionText}`
                  );
                  await logger.takeScreenshot(page, `web3_payment_${optionText?.replace(/\s+/g, '_')}_selected`);
                  
                  // Wait for wallet interaction
                  await page.waitForTimeout(3000);
                  
                  // Check for transaction confirmation UI
                  const txConfirm = page.locator('*:has-text("Confirm"), *:has-text("Transaction"), *:has-text("Gas")');
                  if (await txConfirm.count() > 0) {
                    await logger.logAction(`Transaction confirmation UI appeared for ${optionText}`);
                    await logger.takeScreenshot(page, `tx_confirm_${optionText?.replace(/\s+/g, '_')}`);
                    
                    // Test transaction details
                    const txDetails = page.locator('[class*="transaction"], [class*="tx"]');
                    if (await txDetails.count() > 0) {
                      const detailsText = await txDetails.textContent();
                      await logger.logAction('Transaction details', { content: detailsText?.slice(0, 200) });
                    }
                    
                    // Look for confirm/cancel buttons
                    const confirmBtn = page.locator('button:text("Confirm"), button:text("确认")');
                    const cancelBtn = page.locator('button:text("Cancel"), button:text("取消")');
                    
                    if (await confirmBtn.count() > 0) {
                      await logger.logAction('Testing transaction confirmation button');
                      await loggedClick(page, logger, 'button:text("Confirm")', 'Confirm transaction');
                      await logger.takeScreenshot(page, 'tx_confirm_clicked');
                      
                      // Wait for wallet popup or transaction processing
                      await page.waitForTimeout(5000);
                      
                      // Check for transaction processing indicators
                      const processing = page.locator('*:has-text("Processing"), *:has-text("Pending"), [class*="loading"]');
                      if (await processing.count() > 0) {
                        await logger.logAction('Transaction processing detected');
                        await logger.takeScreenshot(page, 'tx_processing');
                      }
                      
                      // Check for success/failure messages
                      const success = page.locator('*:has-text("Success"), *:has-text("Confirmed"), *:has-text("成功")');
                      const failure = page.locator('*:has-text("Failed"), *:has-text("Error"), *:has-text("失败")');
                      
                      if (await success.count() > 0) {
                        await logger.logAction('Transaction success message detected');
                        await logger.takeScreenshot(page, 'tx_success');
                      }
                      
                      if (await failure.count() > 0) {
                        await logger.logAction('Transaction failure message detected');
                        await logger.takeScreenshot(page, 'tx_failure');
                      }
                    }
                    
                    if (await cancelBtn.count() > 0) {
                      await loggedClick(page, logger, 'button:text("Cancel")', 'Cancel transaction');
                      await logger.takeScreenshot(page, 'tx_cancelled');
                    }
                  }
                  
                  break; // Only test one payment option to avoid conflicts
                }
              } else {
                await logger.logAssertion('Web3 payment options found in modal', false);
                
                // Check for traditional payment options
                const traditionalPayment = paymentModal.locator('button:text("Credit Card"), button:text("PayPal"), input[type="text"]');
                if (await traditionalPayment.count() > 0) {
                  await logger.logAction('Traditional payment options found instead of Web3');
                }
              }
              
              // Close payment modal
              const closeBtn = paymentModal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close payment modal');
              }
            } else {
              await logger.logAction('No payment modal appeared after purchase click');
              
              // Check if navigated to different page
              const currentUrl = page.url();
              if (!currentUrl.includes('/products')) {
                await logger.logAction('Purchase click navigated to different page', { newUrl: currentUrl });
                await logger.takeScreenshot(page, 'purchase_navigation');
              }
            }
          }
        }
        break;
      }
    }

    if (!productFound) {
      await logger.logAssertion('Products with purchase functionality found', false);
    }

    await logger.logPerformance(page, 'Web3 transaction flows test');
    await logger.logAction('Web3 transaction flows test completed');
  });

  test('Web3 wallet management - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Web3 Wallet Management Test');
    await logger.setupPageLogging(page);

    // Navigate to wallet management page
    await loggedNavigate(page, logger, '/dashboard/wallets');
    await logger.takeScreenshot(page, 'web3_wallet_mgmt_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const walletsUrl = page.url();
    if (walletsUrl.includes('/auth/login')) {
      await logger.logAction('Wallet management requires authentication');
      return;
    }

    // Test wallet display and management
    await logger.logAction('Testing wallet display and management features');
    
    const walletDisplaySelectors = [
      '[class*="wallet"]:has(*:text("0x"), *:text("Address"))',
      'div:has(*:text("Balance"), *:text("ETH"), *:text("USDT"))',
      'table:has(th:text("Asset"), th:text("Balance"))',
      '[class*="address"]:has(code, span[class*="mono"])'
    ];

    let walletDisplayFound = false;
    for (const selector of walletDisplaySelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        walletDisplayFound = true;
        await logger.logAssertion(`Wallet display found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'wallet_display');
        await logger.logElementInfo(page, selector, 'wallet-display');
        
        // Test wallet address display
        const addressElements = page.locator(`${selector} code, ${selector} span[class*="mono"], ${selector} *:text("0x")`);
        const addressCount = await addressElements.count();
        
        if (addressCount > 0) {
          await logger.logAction(`Found ${addressCount} wallet addresses`);
          
          for (let i = 0; i < Math.min(addressCount, 3); i++) { // Test first 3 addresses
            const address = addressElements.nth(i);
            const addressText = await address.textContent();
            await logger.logAction(`Wallet address ${i + 1}`, { 
              address: addressText?.slice(0, 20) + '...' 
            });
            
            // Test copy address functionality
            const copyBtn = address.locator('../button:has-text("Copy"), ~ button:has-text("Copy")').or(
              page.locator('button:has-text("Copy")').first()
            );
            
            if (await copyBtn.count() > 0) {
              await logger.logAction(`Testing copy address functionality`);
              await loggedClick(page, logger, 'button:has-text("Copy")', 'Copy wallet address');
              await logger.takeScreenshot(page, 'address_copy_clicked');
              
              // Check for copy confirmation
              const copyConfirm = page.locator('*:has-text("Copied"), *:has-text("已复制")');
              if (await copyConfirm.count() > 0) {
                await logger.logAssertion('Address copy confirmation shown', true);
                await logger.takeScreenshot(page, 'address_copy_confirmed');
              }
            }
          }
        }
        
        // Test wallet balance display
        const balanceElements = page.locator(`${selector} *:text("ETH"), ${selector} *:text("USDT"), ${selector} *:text("BTC")`);
        const balanceCount = await balanceElements.count();
        
        if (balanceCount > 0) {
          await logger.logAction(`Found ${balanceCount} token balances`);
          
          for (let i = 0; i < balanceCount; i++) {
            const balance = balanceElements.nth(i);
            const balanceText = await balance.textContent();
            await logger.logAction(`Token balance ${i + 1}: ${balanceText}`);
          }
        }
        break;
      }
    }

    if (!walletDisplayFound) {
      await logger.logAssertion('Wallet display functionality found', false);
    }

    // Test wallet connection status and management
    await logger.logAction('Testing wallet connection status and management');
    
    const connectionStatusSelectors = [
      '*:has-text("Connected"), *:has-text("已连接")',
      '*:has-text("Disconnected"), *:has-text("未连接")',
      'button:text("Connect"), button:text("Disconnect")',
      '[class*="status"], [class*="indicator"]'
    ];

    for (const selector of connectionStatusSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Connection status element found: ${selector}`, true, { count });
        
        const statusElement = page.locator(selector).first();
        const statusText = await statusElement.textContent();
        await logger.logAction(`Wallet connection status: ${statusText}`);
        
        // Test disconnect/connect functionality
        if (statusText?.includes('Connect') && !statusText.includes('Connected')) {
          await loggedClick(page, logger, selector, 'Connect wallet from management page');
          await logger.takeScreenshot(page, 'wallet_connect_from_mgmt');
          
          // Handle wallet connection modal
          await page.waitForTimeout(2000);
          const modal = page.locator('[class*="modal"], [role="dialog"]');
          if (await modal.count() > 0) {
            await logger.logAction('Wallet connection modal from management page');
            await logger.takeScreenshot(page, 'wallet_mgmt_connect_modal');
            
            const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
            if (await closeBtn.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"]', 'Close connect modal');
            }
          }
        } else if (statusText?.includes('Disconnect') || statusText?.includes('Connected')) {
          // Don't actually disconnect for testing purposes, just log that the option is available
          await logger.logAction('Disconnect option available for connected wallet');
        }
        break;
      }
    }

    // Test network/chain information
    await logger.logAction('Testing network/chain information display');
    
    const networkSelectors = [
      '*:text("Ethereum"), *:text("Polygon"), *:text("BSC")',
      '*:text("Mainnet"), *:text("Testnet")',
      '[class*="network"], [class*="chain"]',
      'button:has(*:text("Network"))'
    ];

    for (const selector of networkSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Network information found: ${selector}`, true, { count });
        
        const networkElement = page.locator(selector).first();
        const networkText = await networkElement.textContent();
        await logger.logAction(`Network information: ${networkText}`);
        
        // Test network switching if button available
        if (selector.includes('button')) {
          await loggedClick(page, logger, selector, 'Network selection button');
          await logger.takeScreenshot(page, 'network_selection');
          
          // Check for network selection dropdown/modal
          const networkModal = page.locator('[class*="modal"]:has(*:text("Network")), [class*="dropdown"]:has(*:text("Ethereum"))');
          if (await networkModal.count() > 0) {
            await logger.logAction('Network selection interface opened');
            await logger.takeScreenshot(page, 'network_selection_modal');
            
            // Close without changing network
            const closeBtn = networkModal.locator('button[class*="close"], button:has-text("×")');
            if (await closeBtn.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"]', 'Close network selection');
            }
          }
        }
        break;
      }
    }

    // Test wallet transaction history
    await logger.logAction('Testing wallet transaction history');
    
    const txHistorySelectors = [
      'table:has(th:text("Transaction"), th:text("Hash"))',
      '[class*="transaction"]:has(*:text("0x"))',
      'div[class*="history"]:has([class*="tx"])',
      'ul:has(li:text("Send"), li:text("Receive"))'
    ];

    for (const selector of txHistorySelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Transaction history found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'wallet_tx_history');
        
        // Test transaction details
        const txItems = page.locator(selector === 'table:has(th:text("Transaction"), th:text("Hash"))' ? 'tbody tr' : `${selector} > *`);
        const txCount = await txItems.count();
        
        for (let i = 0; i < Math.min(txCount, 3); i++) { // Test first 3 transactions
          const tx = txItems.nth(i);
          const txText = await tx.textContent();
          await logger.logAction(`Transaction ${i + 1}`, { content: txText?.slice(0, 150) });
          
          // Test transaction detail button/link
          const txButton = tx.locator('button, a[href*="tx"], a[href*="transaction"]');
          if (await txButton.count() > 0) {
            await loggedClick(page, logger, 
              selector === 'tbody tr' ? `tbody tr:nth-child(${i + 1}) button` : 
              `${selector} > *:nth-child(${i + 1}) button`,
              `Transaction ${i + 1} details`
            );
            await logger.takeScreenshot(page, `tx_${i}_details`);
            
            // Handle transaction details modal
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.logAction(`Transaction ${i + 1} details modal opened`);
              await logger.takeScreenshot(page, `tx_${i}_modal`);
              
              const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close transaction details');
              }
            }
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Web3 wallet management test');
    await logger.takeScreenshot(page, 'web3_wallet_mgmt_final', true);
    await logger.logAction('Web3 wallet management test completed');
  });

  test('Web3 integration comprehensive test', async ({ page }) => {
    logger = createTestLogger('Web3 Integration Comprehensive Test');
    await logger.setupPageLogging(page);

    await logger.logAction('Running comprehensive Web3 integration test across all pages');

    // Test Web3 integration across different pages
    const web3TestPages = [
      { path: '/', name: 'Homepage' },
      { path: '/products', name: 'Products' },
      { path: '/dashboard', name: 'Dashboard' },
      { path: '/dashboard/wallets', name: 'Wallets' },
      { path: '/auth/login', name: 'Login' }
    ];

    const web3Features = [
      'wallet connection',
      'network display', 
      'balance display',
      'transaction functionality',
      'address display'
    ];

    let overallWeb3Score = 0;
    const maxScore = web3TestPages.length * web3Features.length;

    for (const testPage of web3TestPages) {
      await logger.logAction(`Testing Web3 integration on ${testPage.name} page`);
      
      try {
        await loggedNavigate(page, logger, testPage.path);
        await logger.takeScreenshot(page, `web3_integration_${testPage.name.toLowerCase()}`, true);
        
        await logger.waitAndLog(page, 'body', 3000);
        
        let pageWeb3Score = 0;
        
        // Test wallet connection features
        const walletButtons = page.locator('button:has-text("Connect"), button:has-text("Wallet"), button:has-text("MetaMask")');
        if (await walletButtons.count() > 0) {
          pageWeb3Score++;
          await logger.logAssertion(`${testPage.name} has wallet connection`, true);
        }
        
        // Test network/chain display
        const networkInfo = page.locator('*:text("Ethereum"), *:text("Polygon"), [class*="network"], [class*="chain"]');
        if (await networkInfo.count() > 0) {
          pageWeb3Score++;
          await logger.logAssertion(`${testPage.name} has network display`, true);
        }
        
        // Test balance display
        const balanceInfo = page.locator('*:text("ETH"), *:text("USDT"), *:text("Balance"), [class*="balance"]');
        if (await balanceInfo.count() > 0) {
          pageWeb3Score++;
          await logger.logAssertion(`${testPage.name} has balance display`, true);
        }
        
        // Test transaction functionality
        const txButtons = page.locator('button:text("Send"), button:text("Buy"), button:text("Transaction"), [class*="transaction"]');
        if (await txButtons.count() > 0) {
          pageWeb3Score++;
          await logger.logAssertion(`${testPage.name} has transaction functionality`, true);
        }
        
        // Test address display
        const addressInfo = page.locator('*:text("0x"), code, [class*="address"], [class*="hash"]');
        if (await addressInfo.count() > 0) {
          pageWeb3Score++;
          await logger.logAssertion(`${testPage.name} has address display`, true);
        }
        
        overallWeb3Score += pageWeb3Score;
        await logger.logAction(`${testPage.name} Web3 integration score: ${pageWeb3Score}/${web3Features.length}`);
        
        await logger.logPerformance(page, `${testPage.name} Web3 integration`);
        
      } catch (error) {
        await logger.logAction(`Error testing Web3 on ${testPage.name}`, error);
      }
    }

    // Calculate overall Web3 integration score
    const integrationPercentage = Math.round((overallWeb3Score / maxScore) * 100);
    await logger.logAction(`Overall Web3 integration score: ${overallWeb3Score}/${maxScore} (${integrationPercentage}%)`);
    
    await logger.logAssertion('Web3 integration is comprehensive', integrationPercentage >= 50, {
      score: `${overallWeb3Score}/${maxScore}`,
      percentage: `${integrationPercentage}%`
    });

    // Test Web3 error handling
    await logger.logAction('Testing Web3 error handling scenarios');
    
    // Simulate scenarios where Web3 might not be available
    await page.evaluate(() => {
      // Temporarily hide ethereum object to simulate no Web3
      if (window.ethereum) {
        (window as any).originalEthereum = window.ethereum;
        delete (window as any).ethereum;
      }
    });
    
    await loggedNavigate(page, logger, '/dashboard/wallets');
    await logger.takeScreenshot(page, 'web3_no_ethereum_object');
    
    // Check for appropriate error messages or fallbacks
    const noWeb3Messages = page.locator('*:text("Install MetaMask"), *:has-text("No wallet"), *:has-text("Web3 not available")');
    if (await noWeb3Messages.count() > 0) {
      await logger.logAssertion('Appropriate no-Web3 messaging found', true);
      await logger.takeScreenshot(page, 'web3_error_messaging');
    }
    
    // Restore ethereum object
    await page.evaluate(() => {
      if ((window as any).originalEthereum) {
        (window as any).ethereum = (window as any).originalEthereum;
        delete (window as any).originalEthereum;
      }
    });

    await logger.takeScreenshot(page, 'web3_integration_final', true);
    await logger.logAction('Web3 integration comprehensive test completed');
  });
});