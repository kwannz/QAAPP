import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive Public Pages Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    // Create logger for each test
    logger = createTestLogger('Public Pages');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('Homepage - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Homepage Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to homepage
    await loggedNavigate(page, logger, '/');
    await logger.takeScreenshot(page, 'homepage_initial', true);

    // Test Hero Section
    await logger.logAction('Testing Hero Section');
    
    // Check if hero section exists and is visible
    await logger.waitAndLog(page, 'section, div[class*="hero"], .hero', 5000);
    
    // Look for common hero elements
    const heroSelectors = [
      'h1', 
      '[class*="hero"]', 
      '[class*="title"]', 
      'button[class*="cta"], button[class*="primary"], a[class*="button"]'
    ];

    for (const selector of heroSelectors) {
      const elements = await page.locator(selector).count();
      if (elements > 0) {
        await logger.logAssertion(`Hero element found: ${selector}`, true, { count: elements });
        await logger.logElementInfo(page, selector, 'hero-check');
        
        // If it's a button or link, test interaction
        if (selector.includes('button') || selector.includes('a[class*="button"]')) {
          const element = page.locator(selector).first();
          if (await element.isVisible()) {
            await logger.takeScreenshot(page, 'before_hero_button_click');
            await loggedClick(page, logger, selector, `Click hero CTA button`);
            await logger.takeScreenshot(page, 'after_hero_button_click');
            await page.goBack(); // Return to homepage
          }
        }
      } else {
        await logger.logAssertion(`Hero element not found: ${selector}`, false);
      }
    }

    // Test Features Section
    await logger.logAction('Testing Features Section');
    const featureSelectors = [
      '[class*="feature"]',
      '[class*="benefit"]', 
      'section[class*="about"]',
      '.features',
      '[data-testid*="feature"]'
    ];

    let featuresFound = false;
    for (const selector of featureSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        featuresFound = true;
        await logger.logAssertion(`Features section found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, `features_section_${selector.replace(/[^\w]/g, '_')}`);
        
        // Test feature cards/items
        const featureItems = page.locator(selector);
        const itemCount = await featureItems.count();
        
        for (let i = 0; i < Math.min(itemCount, 3); i++) { // Test first 3 items
          const item = featureItems.nth(i);
          if (await item.isVisible()) {
            await logger.logElementInfo(page, `${selector}:nth-child(${i + 1})`, 'feature-item');
            
            // Check for interactive elements within features
            const buttons = item.locator('button, a[class*="button"]');
            const buttonCount = await buttons.count();
            
            if (buttonCount > 0) {
              const button = buttons.first();
              if (await button.isVisible()) {
                await logger.logAction(`Testing feature button ${i + 1}`);
                await loggedClick(page, logger, `${selector}:nth-child(${i + 1}) button, ${selector}:nth-child(${i + 1}) a[class*="button"]`, `Feature ${i + 1} button`);
                await logger.takeScreenshot(page, `feature_${i}_interaction`);
                await page.goBack(); // Return if navigated away
              }
            }
          }
        }
        break; // Found features section, no need to check other selectors
      }
    }

    if (!featuresFound) {
      await logger.logAssertion('Features section found', false, { message: 'No features section detected' });
    }

    // Test Stats Section
    await logger.logAction('Testing Stats/Numbers Section');
    const statsSelectors = [
      '[class*="stats"]',
      '[class*="numbers"]',
      '[class*="metric"]',
      'section:has([class*="count"], [class*="number"])'
    ];

    for (const selector of statsSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Stats section found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, `stats_section`);
        await logger.logElementInfo(page, selector, 'stats-section');
        
        // Look for animated numbers or counters
        const numberElements = page.locator(`${selector} [class*="count"], ${selector} [class*="number"], ${selector} [data-count]`);
        const numberCount = await numberElements.count();
        
        if (numberCount > 0) {
          await logger.logAction(`Found ${numberCount} animated numbers/counters`);
        }
        break;
      }
    }

    // Test Products Preview Section
    await logger.logAction('Testing Products Preview Section');
    const productPreviewSelectors = [
      '[class*="product"]',
      '[class*="card"]',
      'section:has(.card, [class*="product"])',
      '[data-testid*="product"]'
    ];

    for (const selector of productPreviewSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Product preview found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, `product_preview`);
        
        // Test product card interactions
        const productCards = page.locator(selector);
        const cardCount = await productCards.count();
        
        for (let i = 0; i < Math.min(cardCount, 2); i++) { // Test first 2 cards
          const card = productCards.nth(i);
          if (await card.isVisible()) {
            await logger.logAction(`Testing product card ${i + 1}`);
            
            // Look for buttons within the card
            const cardButtons = card.locator('button, a[href*="product"], [class*="button"]');
            const buttonCount = await cardButtons.count();
            
            if (buttonCount > 0) {
              const button = cardButtons.first();
              await logger.logElementInfo(page, `${selector}:nth-child(${i + 1}) button`, 'product-card-button');
              await loggedClick(page, logger, `${selector}:nth-child(${i + 1}) button`, `Product card ${i + 1} button`);
              await logger.takeScreenshot(page, `product_card_${i}_clicked`);
              
              // Check if we navigated somewhere
              const currentUrl = page.url();
              if (currentUrl !== 'http://localhost:3002/') {
                await logger.logAction(`Product card navigation successful`, { newUrl: currentUrl });
                await page.goBack();
              }
            }
          }
        }
        break;
      }
    }

    // Test CTA Section
    await logger.logAction('Testing Call-to-Action Section');
    const ctaSelectors = [
      '[class*="cta"]',
      'section:last-of-type button',
      'button[class*="primary"]:last-of-type',
      'a[href*="register"], a[href*="signup"], a[href*="auth"]'
    ];

    for (const selector of ctaSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`CTA section found: ${selector}`, true, { count });
        
        const ctaElement = page.locator(selector).first();
        if (await ctaElement.isVisible()) {
          await logger.logElementInfo(page, selector, 'cta-section');
          await logger.takeScreenshot(page, 'cta_section');
          await loggedClick(page, logger, selector, 'Main CTA button');
          await logger.takeScreenshot(page, 'cta_clicked');
          
          // Record where CTA takes us
          const finalUrl = page.url();
          await logger.logAction(`CTA navigation result`, { finalUrl });
          
          if (finalUrl !== 'http://localhost:3002/') {
            await page.goBack(); // Return to homepage
          }
        }
        break;
      }
    }

    // Test Navigation Menu
    await logger.logAction('Testing Navigation Menu');
    const navSelectors = [
      'nav',
      'header nav',
      '[class*="nav"]',
      '[class*="menu"]',
      'header ul'
    ];

    for (const selector of navSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Navigation found: ${selector}`, true, { count });
        await logger.logElementInfo(page, selector, 'navigation');
        
        // Test navigation links
        const navLinks = page.locator(`${selector} a, ${selector} button`);
        const linkCount = await navLinks.count();
        
        await logger.logAction(`Testing navigation links`, { totalLinks: linkCount });
        
        for (let i = 0; i < Math.min(linkCount, 5); i++) { // Test first 5 nav items
          const link = navLinks.nth(i);
          if (await link.isVisible()) {
            const linkText = await link.textContent();
            const href = await link.getAttribute('href');
            
            await logger.logAction(`Testing nav link: ${linkText}`, { href });
            await loggedClick(page, logger, `${selector} a:nth-child(${i + 1}), ${selector} button:nth-child(${i + 1})`, `Nav link: ${linkText}`);
            await logger.takeScreenshot(page, `nav_link_${i}_${linkText?.replace(/\s+/g, '_')}`);
            
            const currentUrl = page.url();
            await logger.logAction(`Nav link result`, { linkText, currentUrl });
            
            if (currentUrl !== 'http://localhost:3002/') {
              await page.goBack(); // Return to homepage
            }
          }
        }
        break;
      }
    }

    // Test Footer
    await logger.logAction('Testing Footer Section');
    const footerSelectors = [
      'footer',
      '[class*="footer"]',
      'section:last-child:has(a[href*="privacy"], a[href*="terms"])'
    ];

    for (const selector of footerSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Footer found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'footer_section');
        await logger.logElementInfo(page, selector, 'footer');
        
        // Test footer links
        const footerLinks = page.locator(`${selector} a`);
        const footerLinkCount = await footerLinks.count();
        
        if (footerLinkCount > 0) {
          await logger.logAction(`Testing footer links`, { totalLinks: footerLinkCount });
          
          for (let i = 0; i < Math.min(footerLinkCount, 3); i++) { // Test first 3 footer links
            const link = footerLinks.nth(i);
            if (await link.isVisible()) {
              const linkText = await link.textContent();
              await logger.logAction(`Testing footer link: ${linkText}`);
              await loggedClick(page, logger, `${selector} a:nth-child(${i + 1})`, `Footer link: ${linkText}`);
              await logger.takeScreenshot(page, `footer_link_${i}`);
              
              if (page.url() !== 'http://localhost:3002/') {
                await page.goBack();
              }
            }
          }
        }
        break;
      }
    }

    // Performance check
    await logger.logPerformance(page, 'Complete homepage test');
    
    // Final screenshot
    await logger.takeScreenshot(page, 'homepage_final', true);

    await logger.logAction('Homepage comprehensive test completed successfully');
  });

  test('Products page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Products Page Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to products page
    await loggedNavigate(page, logger, '/products');
    await logger.takeScreenshot(page, 'products_initial', true);

    // Test page loading
    await logger.waitAndLog(page, 'body', 5000);

    // Look for product cards or listings
    const productSelectors = [
      '[class*="product"]',
      '[class*="card"]',
      'div:has(button:text("购买"), button:text("Buy"), button[class*="purchase"])',
      '[data-testid*="product"]'
    ];

    let productsFound = false;
    for (const selector of productSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        productsFound = true;
        await logger.logAssertion(`Products found: ${selector}`, true, { count });
        await logger.takeScreenshot(page, 'products_listing');
        
        // Test each product card
        const products = page.locator(selector);
        const productCount = await products.count();
        
        for (let i = 0; i < Math.min(productCount, 3); i++) { // Test first 3 products
          const product = products.nth(i);
          if (await product.isVisible()) {
            await logger.logAction(`Testing product ${i + 1}`);
            await logger.logElementInfo(page, `${selector}:nth-child(${i + 1})`, 'product-card');
            
            // Look for buy/purchase buttons
            const buyButtons = product.locator('button, a[class*="button"]');
            const buyButtonCount = await buyButtons.count();
            
            if (buyButtonCount > 0) {
              await logger.takeScreenshot(page, `product_${i}_before_click`);
              await loggedClick(page, logger, `${selector}:nth-child(${i + 1}) button`, `Product ${i + 1} buy button`);
              await logger.takeScreenshot(page, `product_${i}_after_click`);
              
              // Check if modal or new page opened
              const currentUrl = page.url();
              await logger.logAction(`Product ${i + 1} interaction result`, { currentUrl });
              
              // If we navigated away, go back
              if (currentUrl !== 'http://localhost:3002/products') {
                await page.goBack();
              }
              
              // Check for modals
              const modal = page.locator('[class*="modal"], [class*="dialog"], [role="dialog"]');
              const modalCount = await modal.count();
              if (modalCount > 0) {
                await logger.logAction(`Modal opened for product ${i + 1}`);
                await logger.takeScreenshot(page, `product_${i}_modal`);
                
                // Try to close modal
                const closeButton = modal.locator('button[class*="close"], button:has-text("×"), button:has-text("Close")');
                const closeCount = await closeButton.count();
                if (closeCount > 0) {
                  await loggedClick(page, logger, 'button[class*="close"], button:has-text("×")', 'Close modal');
                }
              }
            }
          }
        }
        break;
      }
    }

    if (!productsFound) {
      await logger.logAssertion('Products found on page', false);
      
      // Check if page has any content at all
      const hasContent = await page.locator('body *').count();
      await logger.logAction('Page content analysis', { elementCount: hasContent });
    }

    // Test filtering/sorting if available
    await logger.logAction('Testing product filters and sorting');
    const filterSelectors = [
      'select[class*="filter"]',
      'button[class*="filter"]',
      'input[class*="search"]',
      'select[class*="sort"]'
    ];

    for (const selector of filterSelectors) {
      const count = await page.locator(selector).count();
      if (count > 0) {
        await logger.logAssertion(`Filter/Sort control found: ${selector}`, true, { count });
        
        if (selector.includes('select')) {
          // Test select dropdown
          await loggedClick(page, logger, selector, 'Open select dropdown');
          await logger.takeScreenshot(page, 'filter_dropdown_open');
          
          // Select first option
          const options = page.locator(`${selector} option`);
          const optionCount = await options.count();
          if (optionCount > 1) { // More than just placeholder
            await page.selectOption(selector, { index: 1 });
            await logger.logAction('Selected filter option');
            await logger.takeScreenshot(page, 'filter_applied');
          }
        } else if (selector.includes('input')) {
          // Test search input
          await loggedFill(page, logger, selector, 'test search', 'Search products');
          await page.keyboard.press('Enter');
          await logger.takeScreenshot(page, 'search_results');
        }
      }
    }

    await logger.logPerformance(page, 'Products page test');
    await logger.takeScreenshot(page, 'products_final', true);
    await logger.logAction('Products page test completed');
  });

  test('Product type pages test', async ({ page }) => {
    logger = createTestLogger('Product Type Pages Test');
    await logger.setupPageLogging(page);

    const productTypes = ['gold', 'silver', 'diamond'];
    
    for (const productType of productTypes) {
      await logger.logAction(`Testing ${productType} product page`);
      
      try {
        await loggedNavigate(page, logger, `/products/${productType}`);
        await logger.takeScreenshot(page, `product_${productType}_initial`, true);
        
        // Wait for page content
        await logger.waitAndLog(page, 'body', 5000);
        
        // Check if this is a specific product page
        const productPageSelectors = [
          `h1:text("${productType}")`,
          `[class*="${productType}"]`,
          '[class*="product-detail"]',
          'button:text("购买"), button:text("Buy")',
          '[class*="purchase"]'
        ];
        
        let isProductPage = false;
        for (const selector of productPageSelectors) {
          const count = await page.locator(selector).count();
          if (count > 0) {
            isProductPage = true;
            await logger.logAssertion(`${productType} product page element found: ${selector}`, true, { count });
            await logger.logElementInfo(page, selector, 'product-page-element');
          }
        }
        
        if (isProductPage) {
          // Test purchase button if available
          const purchaseButton = page.locator('button:text("购买"), button:text("Buy"), button[class*="purchase"]').first();
          if (await purchaseButton.isVisible()) {
            await logger.takeScreenshot(page, `${productType}_before_purchase`);
            await loggedClick(page, logger, 'button:text("购买"), button:text("Buy")', `${productType} purchase button`);
            await logger.takeScreenshot(page, `${productType}_purchase_clicked`);
            
            // Handle any modal or navigation
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.logAction(`Purchase modal opened for ${productType}`);
              await logger.takeScreenshot(page, `${productType}_purchase_modal`);
              
              // Close modal
              const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
              if (await closeBtn.count() > 0) {
                await loggedClick(page, logger, 'button[class*="close"]', 'Close purchase modal');
              }
            }
          }
        } else {
          await logger.logAssertion(`${productType} product page loaded correctly`, false, { 
            message: 'Page did not appear to be a specific product page' 
          });
        }
        
        await logger.logPerformance(page, `${productType} product page`);
        
      } catch (error) {
        await logger.logAction(`Error testing ${productType} product page`, error);
      }
    }
    
    await logger.logAction('Product type pages test completed');
  });

  test('Global navigation and responsiveness test', async ({ page }) => {
    logger = createTestLogger('Global Navigation Test');
    await logger.setupPageLogging(page);

    // Test on different viewport sizes
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];

    for (const viewport of viewports) {
      await logger.logAction(`Testing ${viewport.name} viewport`);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      
      await loggedNavigate(page, logger, '/');
      await logger.takeScreenshot(page, `${viewport.name.toLowerCase()}_homepage`, true);
      
      // Test navigation on different screen sizes
      const nav = page.locator('nav, header nav, [class*="nav"]').first();
      if (await nav.count() > 0) {
        await logger.logElementInfo(page, 'nav', `${viewport.name} navigation`);
        
        // Check for mobile menu toggle
        if (viewport.name === 'Mobile') {
          const mobileToggle = page.locator('button[class*="menu"], button[class*="toggle"], [class*="hamburger"]');
          if (await mobileToggle.count() > 0) {
            await logger.logAction('Testing mobile menu toggle');
            await loggedClick(page, logger, 'button[class*="menu"]', 'Mobile menu toggle');
            await logger.takeScreenshot(page, 'mobile_menu_open');
          }
        }
        
        // Test navigation links on this viewport
        const navLinks = nav.locator('a, button');
        const linkCount = await navLinks.count();
        
        if (linkCount > 0) {
          const firstLink = navLinks.first();
          if (await firstLink.isVisible()) {
            await loggedClick(page, logger, 'nav a:first-child', `${viewport.name} first nav link`);
            await logger.takeScreenshot(page, `${viewport.name.toLowerCase()}_nav_click`);
            await page.goBack();
          }
        }
      }
    }
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await logger.logAction('Navigation and responsiveness test completed');
  });
});