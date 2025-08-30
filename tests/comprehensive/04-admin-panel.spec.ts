import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, loggedFill, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive Admin Panel Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    logger = createTestLogger('Admin Panel');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('Admin Dashboard - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Admin Dashboard Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to admin dashboard
    await loggedNavigate(page, logger, '/admin');
    await logger.takeScreenshot(page, 'admin_dashboard_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const adminUrl = page.url();
    await logger.logAction('Admin dashboard access attempt', { adminUrl });

    // Check if redirected to login or access denied
    if (adminUrl.includes('/auth/login') || adminUrl.includes('/login')) {
      await logger.logAction('Admin dashboard requires authentication - testing login flow');
      await logger.takeScreenshot(page, 'admin_redirected_to_login');
      return;
    }

    if (adminUrl.includes('/dashboard') && !adminUrl.includes('/admin')) {
      await logger.logAssertion('Admin access properly restricted', true, { 
        message: 'Non-admin redirected to user dashboard' 
      });
      return;
    }

    // Test admin statistics overview
    await logger.logAction('Testing admin statistics overview');
    
    const adminStatsSelectors = [
      '[class*="stats"], [class*="metric"]',
      'div:has(*:text("Total Users"), *:text("Revenue"))',
      'div:has(*:text("用户"), *:text("收入"))',
      '[data-testid*="admin-stat"]',
      'div:has([class*="number"], [class*="count"])'
    ];

    let adminStatsFound = false;
    for (const selector of adminStatsSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        adminStatsFound = true;
        await logger.logAssertion(`Admin statistics found: ${selector}`, true, { count });
        await logger.logElementInfo(page, selector, 'admin-stats');
        await logger.takeScreenshot(page, 'admin_statistics');
        
        // Test stat cards
        const statCards = page.locator(selector);
        const cardCount = await statCards.count();
        
        for (let i = 0; i < Math.min(cardCount, 6); i++) { // Test first 6 stat cards
          const card = statCards.nth(i);
          if (await card.isVisible()) {
            const cardText = await card.textContent();
            await logger.logAction(`Admin stat card ${i + 1}`, { 
              content: cardText?.slice(0, 150)
            });
            
            // Test clickable stat cards
            const cardButtons = card.locator('button, a');
            if (await cardButtons.count() > 0) {
              await loggedClick(page, logger, 
                `${selector}:nth-child(${i + 1}) button, ${selector}:nth-child(${i + 1}) a`,
                `Admin stat card ${i + 1} click`
              );
              await logger.takeScreenshot(page, `admin_stat_${i}_clicked`);
              
              // Check for navigation or modal
              const newUrl = page.url();
              if (newUrl !== adminUrl) {
                await logger.logAction(`Stat card navigated to: ${newUrl}`);
                await page.goBack();
              } else {
                const modal = page.locator('[class*="modal"], [role="dialog"]');
                if (await modal.count() > 0) {
                  await logger.takeScreenshot(page, `admin_stat_${i}_modal`);
                  const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                  if (await closeBtn.count() > 0) {
                    await loggedClick(page, logger, 'button[class*="close"]', 'Close stat modal');
                  }
                }
              }
            }
          }
        }
        break;
      }
    }

    if (!adminStatsFound) {
      await logger.logAssertion('Admin statistics section found', false);
    }

    // Test recent activities section
    await logger.logAction('Testing recent activities section');
    
    const activitiesSelectors = [
      '[class*="activity"], [class*="activities"]',
      'div:has(*:text("Recent"), *:text("Activity"))',
      'ul:has(li:text("approved"), li:text("pending"))',
      '[data-testid*="activity"]'
    ];

    for (const selector of activitiesSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Recent activities found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'admin_recent_activities');
        
        // Test activity items
        const activities = page.locator(`${selector} li, ${selector} > div`);
        const activityCount = await activities.count();
        
        for (let i = 0; i < Math.min(activityCount, 5); i++) { // Test first 5 activities
          const activity = activities.nth(i);
          const activityText = await activity.textContent();
          await logger.logAction(`Activity ${i + 1}`, { content: activityText?.slice(0, 100) });
          
          // Test activity action buttons
          const actionButtons = activity.locator('button');
          if (await actionButtons.count() > 0) {
            const button = actionButtons.first();
            const buttonText = await button.textContent();
            await loggedClick(page, logger, 
              `${selector} > *:nth-child(${i + 1}) button`,
              `Activity ${i + 1} action: ${buttonText}`
            );
            await logger.takeScreenshot(page, `admin_activity_${i}_action`);
            
            // Handle modal or navigation
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.takeScreenshot(page, `admin_activity_${i}_modal`);
              const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close activity modal');
              }
            }
          }
        }
        break;
      }
    }

    // Test system health monitoring
    await logger.logAction('Testing system health monitoring');
    
    const healthSelectors = [
      '*:has-text("Health"), *:has-text("Status")',
      '[class*="health"], [class*="status"]',
      'div:has(*:text("Online"), *:text("Offline"))',
      '*:has([class*="indicator"], [class*="badge"])'
    ];

    for (const selector of healthSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`System health display found: ${selector}`, true);
        await logger.takeScreenshot(page, 'admin_system_health');
        await logger.logElementInfo(page, selector, 'system-health');
        
        // Test health status indicators
        const indicators = page.locator(`${selector} [class*="indicator"], ${selector} [class*="badge"]`);
        const indicatorCount = await indicators.count();
        
        if (indicatorCount > 0) {
          await logger.logAction(`Found ${indicatorCount} health indicators`);
          
          for (let i = 0; i < Math.min(indicatorCount, 3); i++) {
            const indicator = indicators.nth(i);
            const indicatorText = await indicator.textContent();
            const classes = await indicator.getAttribute('class');
            await logger.logAction(`Health indicator ${i + 1}`, { 
              text: indicatorText, 
              classes: classes 
            });
          }
        }
        break;
      }
    }

    // Test admin navigation menu
    await logger.logAction('Testing admin navigation menu');
    
    const adminNavSelectors = [
      'nav a[href*="admin"], aside a[href*="admin"]',
      '[class*="sidebar"] a, [class*="menu"] a',
      'ul li a:text("Users"), ul li a:text("Orders")'
    ];

    for (const selector of adminNavSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Admin navigation found: ${selector}`, true, { count });
        
        const navItems = page.locator(selector);
        const itemCount = await navItems.count();
        
        // Test first few navigation items
        for (let i = 0; i < Math.min(itemCount, 8); i++) { // Test first 8 nav items
          const navItem = navItems.nth(i);
          if (await navItem.isVisible()) {
            const itemText = await navItem.textContent();
            const href = await navItem.getAttribute('href');
            
            await logger.logAction(`Admin nav item ${i + 1}: ${itemText}`, { href });
            
            if (href && !href.includes('#') && itemText && !itemText.trim().startsWith('admin')) {
              await loggedClick(page, logger, `${selector}:nth-child(${i + 1})`, `Admin nav: ${itemText}`);
              await logger.takeScreenshot(page, `admin_nav_${itemText?.replace(/\s+/g, '_').toLowerCase()}`);
              
              await page.waitForTimeout(1000);
              const navUrl = page.url();
              await logger.logAction(`Admin navigation result`, { itemText, navUrl });
              
              if (navUrl !== adminUrl && navUrl.includes('/admin/')) {
                // Successfully navigated to admin sub-page
                await logger.takeScreenshot(page, `admin_page_${itemText?.replace(/\s+/g, '_')}`);
                
                // Test basic functionality of the sub-page
                await logger.waitAndLog(page, 'body', 2000);
                
                // Look for common admin page elements
                const pageElements = [
                  'table, [class*="table"]',
                  'button[class*="create"], button[class*="add"]',
                  '[class*="search"], input[type="search"]'
                ];
                
                for (const element of pageElements) {
                  const elementCount = await page.locator(element).count();
                  if (elementCount > 0) {
                    await logger.logAction(`${itemText} page has ${element}`, { count: elementCount });
                  }
                }
                
                await page.goBack(); // Return to admin dashboard
              }
            }
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Admin dashboard test');
    await logger.takeScreenshot(page, 'admin_dashboard_final', true);
    await logger.logAction('Admin dashboard test completed');
  });

  test('Admin Users Management - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Admin Users Management Test');
    await logger.setupPageLogging(page);

    await loggedNavigate(page, logger, '/admin/users');
    await logger.takeScreenshot(page, 'admin_users_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const usersUrl = page.url();
    if (usersUrl.includes('/auth/login') || !usersUrl.includes('/admin/')) {
      await logger.logAction('Admin users page requires proper authentication/authorization');
      return;
    }

    // Test users list/table
    await logger.logAction('Testing users list display');
    
    const usersListSelectors = [
      'table',
      '[class*="user"]:has([class*="email"], [class*="name"])',
      'div[class*="list"]:has(*:text("@"))',
      '[data-testid*="user"]'
    ];

    let usersListFound = false;
    for (const selector of usersListSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        usersListFound = true;
        await logger.logAssertion(`Users list found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'admin_users_list');
        
        if (selector === 'table') {
          // Test table functionality
          const headers = page.locator('th');
          const rows = page.locator('tbody tr');
          
          const headerCount = await headers.count();
          const rowCount = await rows.count();
          
          await logger.logAction('Users table structure', { 
            headers: headerCount, 
            rows: rowCount 
          });
          
          // Test table headers
          for (let i = 0; i < headerCount; i++) {
            const header = headers.nth(i);
            const headerText = await header.textContent();
            await logger.logAction(`Table header ${i + 1}: ${headerText}`);
            
            // Test sortable headers
            const sortButton = header.locator('button');
            if (await sortButton.count() > 0) {
              await loggedClick(page, logger, `th:nth-child(${i + 1}) button`, `Sort by ${headerText}`);
              await logger.takeScreenshot(page, `users_sort_${headerText?.replace(/\s+/g, '_')}`);
            }
          }
          
          // Test user rows
          for (let i = 0; i < Math.min(rowCount, 5); i++) { // Test first 5 users
            const row = rows.nth(i);
            const rowText = await row.textContent();
            await logger.logAction(`User row ${i + 1}`, { content: rowText?.slice(0, 200) });
            
            // Test user action buttons
            const actionButtons = row.locator('button');
            const buttonCount = await actionButtons.count();
            
            if (buttonCount > 0) {
              const button = actionButtons.first();
              const buttonText = await button.textContent();
              
              await loggedClick(page, logger, 
                `tbody tr:nth-child(${i + 1}) button`,
                `User ${i + 1} action: ${buttonText}`
              );
              await logger.takeScreenshot(page, `user_${i}_action`);
              
              // Handle user details modal
              const modal = page.locator('[class*="modal"], [role="dialog"]');
              if (await modal.count() > 0) {
                await logger.logAction(`User ${i + 1} details modal opened`);
                await logger.takeScreenshot(page, `user_${i}_details_modal`);
                
                // Test modal content
                const modalContent = await modal.textContent();
                await logger.logAction(`User modal content preview`, { 
                  content: modalContent?.slice(0, 300) 
                });
                
                // Test modal action buttons
                const modalButtons = modal.locator('button:not([class*="close"])');
                const modalButtonCount = await modalButtons.count();
                
                for (let j = 0; j < Math.min(modalButtonCount, 3); j++) {
                  const modalButton = modalButtons.nth(j);
                  const modalButtonText = await modalButton.textContent();
                  
                  if (modalButtonText && !modalButtonText.includes('Delete') && !modalButtonText.includes('删除')) {
                    await logger.logAction(`Testing modal button: ${modalButtonText}`);
                    await loggedClick(page, logger, 
                      `[class*="modal"] button:nth-child(${j + 1})`,
                      `User modal action: ${modalButtonText}`
                    );
                    await logger.takeScreenshot(page, `user_modal_action_${j}`);
                    
                    // Wait for any response
                    await page.waitForTimeout(1000);
                  }
                }
                
                // Close modal
                const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                if (await closeBtn.count() > 0) {
                  await loggedClick(page, logger, 'button[class*="close"]', 'Close user details modal');
                }
              }
            }
          }
        }
        break;
      }
    }

    if (!usersListFound) {
      await logger.logAssertion('Users list found', false);
    }

    // Test user search functionality
    await logger.logAction('Testing user search functionality');
    
    const searchSelectors = [
      'input[type="search"], input[placeholder*="search"], input[placeholder*="搜索"]',
      'input[name="search"], input[name="query"]',
      '[class*="search"] input'
    ];

    for (const selector of searchSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`User search input found: ${selector}`, true);
        await loggedFill(page, logger, selector, 'test@example.com', 'Search for test user');
        await page.keyboard.press('Enter');
        await logger.takeScreenshot(page, 'user_search_results');
        
        // Wait for search results
        await page.waitForTimeout(2000);
        
        // Clear search
        await page.locator(selector).clear();
        await page.keyboard.press('Enter');
        await logger.takeScreenshot(page, 'user_search_cleared');
        break;
      }
    }

    // Test user filtering
    await logger.logAction('Testing user filtering');
    
    const filterSelectors = [
      'select[class*="filter"]',
      'button[class*="filter"]',
      'select:has(option:text("All"), option:text("Active"))'
    ];

    for (const selector of filterSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`User filter found: ${selector}`, true);
        
        if (selector.includes('select')) {
          await loggedClick(page, logger, selector, 'Open user filter');
          await logger.takeScreenshot(page, 'user_filter_open');
          
          const options = page.locator(`${selector} option`);
          const optionCount = await options.count();
          
          if (optionCount > 1) {
            await page.selectOption(selector, { index: 1 });
            await logger.logAction('Applied user filter');
            await logger.takeScreenshot(page, 'user_filter_applied');
          }
        }
        break;
      }
    }

    // Test add new user functionality
    await logger.logAction('Testing add new user functionality');
    
    const addUserSelectors = [
      'button:text("Add User"), button:text("Create User")',
      'button:text("添加用户"), button:text("新建用户")',
      'button[class*="create"], button[class*="add"]'
    ];

    for (const selector of addUserSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Add user button found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click add user button');
        await logger.takeScreenshot(page, 'add_user_clicked');
        
        // Test add user modal/form
        const userModal = page.locator('[class*="modal"]:has(input[type="email"]), [role="dialog"]:has(form)');
        if (await userModal.count() > 0) {
          await logger.logAction('Add user modal opened');
          await logger.takeScreenshot(page, 'add_user_modal');
          
          // Test form fields
          const emailInput = userModal.locator('input[type="email"]');
          const nameInput = userModal.locator('input[name="name"], input[name="firstName"]');
          
          if (await emailInput.count() > 0) {
            await loggedFill(page, logger, 'input[type="email"]', 'newuser@example.com', 'Fill new user email');
          }
          
          if (await nameInput.count() > 0) {
            await loggedFill(page, logger, 'input[name="name"]', 'Test User', 'Fill new user name');
          }
          
          await logger.takeScreenshot(page, 'add_user_form_filled');
          
          // Close modal without saving (for testing purposes)
          const cancelBtn = userModal.locator('button:has-text("Cancel"), button:has-text("取消")');
          if (await cancelBtn.count() > 0) {
            await loggedClick(page, logger, 'button:has-text("Cancel")', 'Cancel add user');
          } else {
            const closeBtn = userModal.locator('button[class*="close"], button:has-text("×")');
            if (await closeBtn.count() > 0) {
              await loggedClick(page, logger, 'button[class*="close"]', 'Close add user modal');
            }
          }
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Admin users management test');
    await logger.takeScreenshot(page, 'admin_users_final', true);
    await logger.logAction('Admin users management test completed');
  });

  test('Admin KYC Review - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Admin KYC Review Test');
    await logger.setupPageLogging(page);

    await loggedNavigate(page, logger, '/admin/kycreview');
    await logger.takeScreenshot(page, 'admin_kyc_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const kycUrl = page.url();
    if (kycUrl.includes('/auth/login') || !kycUrl.includes('/admin/')) {
      await logger.logAction('Admin KYC review page requires proper authentication');
      return;
    }

    // Test KYC pending reviews list
    await logger.logAction('Testing KYC pending reviews list');
    
    const kycListSelectors = [
      'table:has(th:text("KYC"), th:text("Status"))',
      '[class*="kyc"]:has([class*="pending"])',
      'div[class*="review"]:has(button:text("Approve"), button:text("Reject"))',
      '[data-testid*="kyc"]'
    ];

    let kycListFound = false;
    for (const selector of kycListSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        kycListFound = true;
        await logger.logAssertion(`KYC reviews list found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'kyc_reviews_list');
        
        // Test KYC review items
        const kycItems = page.locator(selector === 'table:has(th:text("KYC"), th:text("Status"))' ? 'tbody tr' : selector);
        const itemCount = await kycItems.count();
        
        for (let i = 0; i < Math.min(itemCount, 3); i++) { // Test first 3 KYC reviews
          const kycItem = kycItems.nth(i);
          const itemText = await kycItem.textContent();
          await logger.logAction(`KYC review ${i + 1}`, { content: itemText?.slice(0, 200) });
          
          // Test review action buttons
          const reviewButtons = kycItem.locator('button');
          const buttonCount = await reviewButtons.count();
          
          for (let j = 0; j < Math.min(buttonCount, 3); j++) { // Test up to 3 buttons per review
            const button = reviewButtons.nth(j);
            const buttonText = await button.textContent();
            
            if (buttonText && (buttonText.includes('View') || buttonText.includes('查看'))) {
              await logger.logAction(`Testing KYC review ${i + 1} button: ${buttonText}`);
              await loggedClick(page, logger, 
                selector === 'tbody tr' ? `tbody tr:nth-child(${i + 1}) button:nth-child(${j + 1})` : 
                `${selector}:nth-child(${i + 1}) button:nth-child(${j + 1})`,
                `KYC ${i + 1} action: ${buttonText}`
              );
              await logger.takeScreenshot(page, `kyc_${i}_${buttonText?.replace(/\s+/g, '_')}`);
              
              // Handle KYC details modal
              const kycModal = page.locator('[class*="modal"], [role="dialog"]');
              if (await kycModal.count() > 0) {
                await logger.logAction(`KYC review ${i + 1} details modal opened`);
                await logger.takeScreenshot(page, `kyc_${i}_details_modal`);
                
                // Test document viewing
                const documents = kycModal.locator('img, iframe, [class*="document"]');
                const docCount = await documents.count();
                
                if (docCount > 0) {
                  await logger.logAction(`Found ${docCount} KYC documents`);
                  
                  // Test document interactions
                  for (let k = 0; k < Math.min(docCount, 2); k++) {
                    const doc = documents.nth(k);
                    if (await doc.isVisible()) {
                      await logger.logAction(`Testing KYC document ${k + 1}`);
                      await loggedClick(page, logger, 
                        `[class*="modal"] img:nth-child(${k + 1}), [class*="modal"] [class*="document"]:nth-child(${k + 1})`,
                        `View KYC document ${k + 1}`
                      );
                      await logger.takeScreenshot(page, `kyc_document_${k}_viewed`);
                    }
                  }
                }
                
                // Test approval/rejection buttons in modal
                const approveBtn = kycModal.locator('button:text("Approve"), button:text("批准")');
                const rejectBtn = kycModal.locator('button:text("Reject"), button:text("拒绝")');
                
                if (await approveBtn.count() > 0) {
                  await logger.logAction('Testing KYC approval button');
                  await loggedClick(page, logger, 'button:text("Approve")', 'KYC approve button');
                  await logger.takeScreenshot(page, `kyc_${i}_approve_clicked`);
                  
                  // Handle approval confirmation
                  const confirmModal = page.locator('[class*="confirm"]');
                  if (await confirmModal.count() > 0) {
                    await logger.logAction('KYC approval confirmation modal');
                    await logger.takeScreenshot(page, 'kyc_approve_confirmation');
                    
                    // Cancel confirmation for testing
                    const cancelBtn = confirmModal.locator('button:text("Cancel"), button:text("取消")');
                    if (await cancelBtn.count() > 0) {
                      await loggedClick(page, logger, 'button:text("Cancel")', 'Cancel KYC approval');
                    }
                  }
                }
                
                // Close modal
                const closeBtn = kycModal.locator('button[class*="close"], button:has-text("×")');
                if (await closeBtn.count() > 0) {
                  await loggedClick(page, logger, 'button[class*="close"]', 'Close KYC details modal');
                }
              }
              break; // Only test one button per item to avoid conflicts
            }
          }
        }
        break;
      }
    }

    if (!kycListFound) {
      await logger.logAssertion('KYC reviews list found', false);
      
      // Check for empty state
      const emptyState = page.locator('*:has-text("No pending"), *:has-text("暂无待审核")');
      if (await emptyState.count() > 0) {
        await logger.logAssertion('KYC empty state message found', true);
        await logger.takeScreenshot(page, 'kyc_empty_state');
      }
    }

    // Test KYC status filtering
    await logger.logAction('Testing KYC status filtering');
    
    const kycFilterSelectors = [
      'select:has(option:text("Pending"), option:text("Approved"))',
      'button[class*="filter"]:has-text("Status")',
      'select[class*="status"]'
    ];

    for (const selector of kycFilterSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`KYC status filter found: ${selector}`, true);
        
        if (selector.includes('select')) {
          await loggedClick(page, logger, selector, 'Open KYC status filter');
          await logger.takeScreenshot(page, 'kyc_filter_open');
          
          const options = page.locator(`${selector} option`);
          const optionCount = await options.count();
          
          if (optionCount > 1) {
            await page.selectOption(selector, { index: 1 });
            await logger.logAction('Applied KYC status filter');
            await logger.takeScreenshot(page, 'kyc_filter_applied');
          }
        }
        break;
      }
    }

    // Test KYC search functionality
    await logger.logAction('Testing KYC search functionality');
    
    const kycSearchSelectors = [
      'input[placeholder*="search"], input[placeholder*="搜索"]',
      'input[name="search"]',
      '[class*="search"] input'
    ];

    for (const selector of kycSearchSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`KYC search input found: ${selector}`, true);
        await loggedFill(page, logger, selector, 'test user', 'Search KYC reviews');
        await page.keyboard.press('Enter');
        await logger.takeScreenshot(page, 'kyc_search_results');
        
        await page.waitForTimeout(1000);
        
        // Clear search
        await page.locator(selector).clear();
        await page.keyboard.press('Enter');
        break;
      }
    }

    await logger.logPerformance(page, 'Admin KYC review test');
    await logger.takeScreenshot(page, 'admin_kyc_final', true);
    await logger.logAction('Admin KYC review test completed');
  });

  test('Admin Orders Management - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Admin Orders Management Test');
    await logger.setupPageLogging(page);

    await loggedNavigate(page, logger, '/admin/orders');
    await logger.takeScreenshot(page, 'admin_orders_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    const ordersUrl = page.url();
    if (ordersUrl.includes('/auth/login') || !ordersUrl.includes('/admin/')) {
      await logger.logAction('Admin orders page requires proper authentication');
      return;
    }

    // Test orders list display
    await logger.logAction('Testing orders list display');
    
    const ordersListSelectors = [
      'table:has(th:text("Order"), th:text("Amount"))',
      '[class*="order"]:has([class*="amount"], [class*="status"])',
      'div[class*="list"]:has(*:text("$"), *:text("¥"))',
      '[data-testid*="order"]'
    ];

    let ordersListFound = false;
    for (const selector of ordersListSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        ordersListFound = true;
        await logger.logAssertion(`Orders list found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'admin_orders_list');
        
        // Test order items
        const orderItems = page.locator(selector === 'table:has(th:text("Order"), th:text("Amount"))' ? 'tbody tr' : selector);
        const itemCount = await orderItems.count();
        
        for (let i = 0; i < Math.min(itemCount, 5); i++) { // Test first 5 orders
          const orderItem = orderItems.nth(i);
          const itemText = await orderItem.textContent();
          await logger.logAction(`Order ${i + 1}`, { content: itemText?.slice(0, 200) });
          
          // Test order action buttons
          const actionButtons = orderItem.locator('button');
          const buttonCount = await actionButtons.count();
          
          if (buttonCount > 0) {
            for (let j = 0; j < Math.min(buttonCount, 2); j++) { // Test first 2 buttons per order
              const button = actionButtons.nth(j);
              const buttonText = await button.textContent();
              
              if (buttonText && !buttonText.includes('Delete') && !buttonText.includes('删除')) {
                await logger.logAction(`Testing order ${i + 1} button: ${buttonText}`);
                await loggedClick(page, logger, 
                  selector === 'tbody tr' ? `tbody tr:nth-child(${i + 1}) button:nth-child(${j + 1})` : 
                  `${selector}:nth-child(${i + 1}) button:nth-child(${j + 1})`,
                  `Order ${i + 1} action: ${buttonText}`
                );
                await logger.takeScreenshot(page, `order_${i}_${buttonText?.replace(/\s+/g, '_')}`);
                
                // Handle order details modal
                const orderModal = page.locator('[class*="modal"], [role="dialog"]');
                if (await orderModal.count() > 0) {
                  await logger.logAction(`Order ${i + 1} details modal opened`);
                  await logger.takeScreenshot(page, `order_${i}_details_modal`);
                  
                  // Test modal content and actions
                  const modalContent = await orderModal.textContent();
                  await logger.logAction(`Order modal content preview`, { 
                    content: modalContent?.slice(0, 300) 
                  });
                  
                  // Test order status change buttons
                  const statusButtons = orderModal.locator('button:text("Approve"), button:text("Complete"), button:text("Cancel")');
                  const statusButtonCount = await statusButtons.count();
                  
                  if (statusButtonCount > 0) {
                    const statusBtn = statusButtons.first();
                    const statusBtnText = await statusBtn.textContent();
                    await logger.logAction(`Testing order status change: ${statusBtnText}`);
                    await loggedClick(page, logger, 'button:text("Approve"), button:text("Complete")', `Order status: ${statusBtnText}`);
                    await logger.takeScreenshot(page, `order_${i}_status_change`);
                    
                    // Handle confirmation if any
                    await page.waitForTimeout(1000);
                    const confirmModal = page.locator('[class*="confirm"]');
                    if (await confirmModal.count() > 0) {
                      await logger.logAction('Order status change confirmation');
                      const cancelBtn = confirmModal.locator('button:text("Cancel")');
                      if (await cancelBtn.count() > 0) {
                        await loggedClick(page, logger, 'button:text("Cancel")', 'Cancel order status change');
                      }
                    }
                  }
                  
                  // Close modal
                  const closeBtn = orderModal.locator('button[class*="close"], button:has-text("×")');
                  if (await closeBtn.count() > 0) {
                    await loggedClick(page, logger, 'button[class*="close"]', 'Close order details modal');
                  }
                }
                break; // Only test one button per order
              }
            }
          }
        }
        break;
      }
    }

    if (!ordersListFound) {
      await logger.logAssertion('Orders list found', false);
    }

    // Test order status filtering
    await logger.logAction('Testing order status filtering');
    
    const orderFilterSelectors = [
      'select:has(option:text("Pending"), option:text("Completed"))',
      'button[class*="filter"]:has-text("Status")',
      'select[class*="status"]'
    ];

    for (const selector of orderFilterSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Order status filter found: ${selector}`, true);
        
        if (selector.includes('select')) {
          await loggedClick(page, logger, selector, 'Open order status filter');
          await logger.takeScreenshot(page, 'order_filter_open');
          
          const options = page.locator(`${selector} option`);
          const optionCount = await options.count();
          
          if (optionCount > 1) {
            await page.selectOption(selector, { index: 1 });
            await logger.logAction('Applied order status filter');
            await logger.takeScreenshot(page, 'order_filter_applied');
          }
        }
        break;
      }
    }

    // Test order search and date range filtering
    await logger.logAction('Testing order search and date filtering');
    
    const searchSelectors = [
      'input[placeholder*="search"], input[placeholder*="搜索"]',
      'input[type="date"]',
      'input[name="search"]'
    ];

    for (const selector of searchSelectors) {
      if (await page.locator(selector).count() > 0) {
        if (selector.includes('date')) {
          await logger.logAssertion(`Date filter found: ${selector}`, true);
          await loggedFill(page, logger, selector, '2024-01-01', 'Set order date filter');
          await logger.takeScreenshot(page, 'order_date_filter');
        } else {
          await logger.logAssertion(`Order search found: ${selector}`, true);
          await loggedFill(page, logger, selector, 'test order', 'Search orders');
          await page.keyboard.press('Enter');
          await logger.takeScreenshot(page, 'order_search_results');
          
          // Clear search
          await page.locator(selector).clear();
          await page.keyboard.press('Enter');
        }
      }
    }

    await logger.logPerformance(page, 'Admin orders management test');
    await logger.takeScreenshot(page, 'admin_orders_final', true);
    await logger.logAction('Admin orders management test completed');
  });

  test('Admin comprehensive pages test', async ({ page }) => {
    logger = createTestLogger('Admin Comprehensive Pages Test');
    await logger.setupPageLogging(page);

    // Test all admin routes
    const adminRoutes = [
      '/admin',
      '/admin/users',
      '/admin/kycreview', 
      '/admin/orders',
      '/admin/products',
      '/admin/withdrawals',
      '/admin/agents',
      '/admin/system',
      '/admin/audit-logs',
      '/admin/compliance',
      '/admin/settings',
      '/admin/notifications',
      '/admin/reports',
      '/admin/performance',
      '/admin/business-metrics'
    ];

    for (const route of adminRoutes) {
      await logger.logAction(`Testing admin route: ${route}`);
      
      try {
        await loggedNavigate(page, logger, route);
        await logger.takeScreenshot(page, `admin_route_${route.split('/').pop()}`, true);
        
        const finalUrl = page.url();
        const isAccessible = !finalUrl.includes('/auth/login') && finalUrl.includes('/admin/');
        
        await logger.logAssertion(`${route} accessible`, isAccessible, { finalUrl });
        
        if (isAccessible) {
          await logger.waitAndLog(page, 'body', 2000);
          
          // Test basic admin page functionality
          const commonElements = [
            'table, [class*="list"]',
            'button[class*="create"], button[class*="add"]',
            '[class*="search"], input[type="search"]',
            'select[class*="filter"]'
          ];
          
          for (const element of commonElements) {
            const count = await page.locator(element).count();
            if (count > 0) {
              await logger.logAction(`${route} has ${element}`, { count });
              
              // Test first element of each type
              if (element.includes('button')) {
                const btn = page.locator(element).first();
                if (await btn.isVisible()) {
                  const btnText = await btn.textContent();
                  await loggedClick(page, logger, element, `${route} button: ${btnText}`);
                  await logger.takeScreenshot(page, `${route.split('/').pop()}_button_test`);
                  
                  // Handle modal if appears
                  const modal = page.locator('[class*="modal"], [role="dialog"]');
                  if (await modal.count() > 0) {
                    await logger.takeScreenshot(page, `${route.split('/').pop()}_modal`);
                    const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
                    if (await closeBtn.count() > 0) {
                      await loggedClick(page, logger, 'button[class*="close"]', 'Close modal');
                    }
                  }
                }
              }
            }
          }
          
          await logger.logPerformance(page, `${route} page load`);
        }
        
      } catch (error) {
        await logger.logAction(`Error testing ${route}`, error);
      }
    }

    await logger.logAction('Admin comprehensive pages test completed');
  });
});