import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive Accessibility Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    logger = createTestLogger('Accessibility');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('WCAG compliance - Complete accessibility audit', async ({ page }) => {
    logger = createTestLogger('WCAG Compliance Audit');
    await logger.setupPageLogging(page);

    // Test accessibility across key pages
    const pagesForA11yTest = [
      { path: '/', name: 'Homepage' },
      { path: '/auth/login', name: 'Login' },
      { path: '/auth/register', name: 'Registration' },
      { path: '/products', name: 'Products' },
      { path: '/dashboard', name: 'Dashboard' }
    ];

    let overallA11yScore = 0;
    const maxViolations = 100; // Threshold for acceptable violations

    for (const testPage of pagesForA11yTest) {
      await logger.logAction(`Testing accessibility compliance for ${testPage.name}`);
      
      try {
        await loggedNavigate(page, logger, testPage.path);
        await logger.takeScreenshot(page, `a11y_${testPage.name.toLowerCase()}`, true);
        
        await logger.waitAndLog(page, 'body', 5000);
        
        // Manual accessibility checks
        await logger.logAction(`Manual accessibility checks for ${testPage.name}`);
        
        // Check page structure
        const pageStructure = await page.evaluate(() => {
          const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
          const links = document.querySelectorAll('a');
          const buttons = document.querySelectorAll('button');
          const images = document.querySelectorAll('img');
          const forms = document.querySelectorAll('form');
          const inputs = document.querySelectorAll('input, select, textarea');
          
          return {
            headings: headings.length,
            links: links.length,
            buttons: buttons.length,
            images: images.length,
            forms: forms.length,
            inputs: inputs.length,
            hasMain: !!document.querySelector('main'),
            hasNav: !!document.querySelector('nav'),
            hasHeader: !!document.querySelector('header'),
            hasFooter: !!document.querySelector('footer')
          };
        });
        
        await logger.logAction(`${testPage.name} page structure`, pageStructure);
        
        // Test semantic HTML usage
        await logger.logAction(`Testing semantic HTML for ${testPage.name}`);
        
        const semanticScore = await page.evaluate(() => {
          let score = 0;
          const totalChecks = 10;
          
          // Check for semantic elements
          if (document.querySelector('main')) score++;
          if (document.querySelector('nav')) score++;
          if (document.querySelector('header')) score++;
          if (document.querySelector('footer')) score++;
          if (document.querySelector('article, section')) score++;
          if (document.querySelector('h1')) score++;
          
          // Check heading hierarchy
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
          const headingLevels = headings.map(h => parseInt(h.tagName.charAt(1)));
          let validHierarchy = true;
          
          for (let i = 1; i < headingLevels.length; i++) {
            if (headingLevels[i] > headingLevels[i-1] + 1) {
              validHierarchy = false;
              break;
            }
          }
          
          if (validHierarchy && headings.length > 0) score++;
          
          // Check for proper button usage vs div/span with click handlers
          const properButtons = document.querySelectorAll('button').length;
          const clickableDivs = document.querySelectorAll('div[onclick], span[onclick]').length;
          if (properButtons > clickableDivs) score++;
          
          // Check for proper link usage
          const links = document.querySelectorAll('a[href]');
          const totalLinks = document.querySelectorAll('a').length;
          if (links.length === totalLinks && totalLinks > 0) score++;
          
          // Check for lists usage
          if (document.querySelector('ul, ol')) score++;
          
          return Math.round((score / totalChecks) * 100);
        });
        
        await logger.logAssertion(`${testPage.name} semantic HTML score: ${semanticScore}%`, semanticScore >= 70);
        
        // Test keyboard navigation
        await logger.logAction(`Testing keyboard navigation for ${testPage.name}`);
        
        const keyboardTestResults = await page.evaluate(() => {
          const focusableElements = document.querySelectorAll(
            'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          
          let focusableCount = 0;
          let elementsWithTabIndex = 0;
          let elementsWithProperRoles = 0;
          
          focusableElements.forEach(element => {
            if (element.offsetParent !== null || element.tagName === 'INPUT') { // visible elements
              focusableCount++;
              
              if (element.hasAttribute('tabindex')) {
                elementsWithTabIndex++;
              }
              
              if (element.hasAttribute('role') || 
                  ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName)) {
                elementsWithProperRoles++;
              }
            }
          });
          
          return {
            focusableElements: focusableCount,
            elementsWithTabIndex: elementsWithTabIndex,
            elementsWithProperRoles: elementsWithProperRoles,
            properRolePercentage: focusableCount > 0 ? Math.round((elementsWithProperRoles / focusableCount) * 100) : 0
          };
        });
        
        await logger.logAction(`${testPage.name} keyboard navigation`, keyboardTestResults);
        
        // Test actual keyboard navigation
        if (keyboardTestResults.focusableElements > 0) {
          await logger.logAction('Testing Tab key navigation');
          
          // Test Tab navigation
          for (let i = 0; i < Math.min(5, keyboardTestResults.focusableElements); i++) {
            await page.keyboard.press('Tab');
            await page.waitForTimeout(100);
            
            const focusedElement = await page.evaluate(() => {
              const focused = document.activeElement;
              return {
                tagName: focused?.tagName,
                id: focused?.id,
                className: focused?.className,
                textContent: focused?.textContent?.slice(0, 50)
              };
            });
            
            await logger.logAction(`Tab ${i + 1} focused element`, focusedElement);
          }
          
          // Test Enter key on focused button
          const focusedButton = await page.evaluate(() => {
            return document.activeElement?.tagName === 'BUTTON';
          });
          
          if (focusedButton) {
            await logger.logAction('Testing Enter key on focused button');
            await page.keyboard.press('Enter');
            await logger.takeScreenshot(page, `${testPage.name}_keyboard_enter`);
            
            // Check for any modal or navigation
            await page.waitForTimeout(1000);
            const modal = page.locator('[class*="modal"], [role="dialog"]');
            if (await modal.count() > 0) {
              await logger.logAction('Button activation via Enter opened modal');
              await page.keyboard.press('Escape'); // Try to close with Escape
              await logger.takeScreenshot(page, `${testPage.name}_keyboard_escape`);
            }
          }
        }
        
        // Test form accessibility
        await logger.logAction(`Testing form accessibility for ${testPage.name}`);
        
        const formA11yResults = await page.evaluate(() => {
          const forms = document.querySelectorAll('form');
          const inputs = document.querySelectorAll('input, select, textarea');
          
          let labelsCount = 0;
          let inputsWithLabels = 0;
          let inputsWithPlaceholders = 0;
          let inputsWithAria = 0;
          let inputsWithRequired = 0;
          
          inputs.forEach(input => {
            // Check for associated labels
            const id = input.id;
            const label = id ? document.querySelector(`label[for="${id}"]`) : null;
            const parentLabel = input.closest('label');
            
            if (label || parentLabel) {
              inputsWithLabels++;
            }
            
            if (input.hasAttribute('placeholder')) {
              inputsWithPlaceholders++;
            }
            
            if (input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby')) {
              inputsWithAria++;
            }
            
            if (input.hasAttribute('required')) {
              inputsWithRequired++;
            }
          });
          
          labelsCount = document.querySelectorAll('label').length;
          
          return {
            forms: forms.length,
            inputs: inputs.length,
            labels: labelsCount,
            inputsWithLabels,
            inputsWithPlaceholders,
            inputsWithAria,
            inputsWithRequired,
            labelCoverage: inputs.length > 0 ? Math.round((inputsWithLabels / inputs.length) * 100) : 0
          };
        });
        
        await logger.logAction(`${testPage.name} form accessibility`, formA11yResults);
        await logger.logAssertion(`${testPage.name} form label coverage: ${formA11yResults.labelCoverage}%`, 
          formA11yResults.labelCoverage >= 80);
        
        // Test image accessibility
        await logger.logAction(`Testing image accessibility for ${testPage.name}`);
        
        const imageA11yResults = await page.evaluate(() => {
          const images = document.querySelectorAll('img');
          
          let imagesWithAlt = 0;
          let imagesWithEmptyAlt = 0;
          let imagesWithMeaningfulAlt = 0;
          
          images.forEach(img => {
            if (img.hasAttribute('alt')) {
              imagesWithAlt++;
              const altText = img.getAttribute('alt');
              
              if (altText === '') {
                imagesWithEmptyAlt++;
              } else if (altText && altText.length > 3 && !altText.toLowerCase().includes('image')) {
                imagesWithMeaningfulAlt++;
              }
            }
          });
          
          return {
            totalImages: images.length,
            imagesWithAlt,
            imagesWithEmptyAlt,
            imagesWithMeaningfulAlt,
            altCoverage: images.length > 0 ? Math.round((imagesWithAlt / images.length) * 100) : 0,
            meaningfulAltPercentage: images.length > 0 ? Math.round((imagesWithMeaningfulAlt / images.length) * 100) : 0
          };
        });
        
        await logger.logAction(`${testPage.name} image accessibility`, imageA11yResults);
        await logger.logAssertion(`${testPage.name} image alt coverage: ${imageA11yResults.altCoverage}%`, 
          imageA11yResults.altCoverage >= 90);
        
        // Test color contrast (basic check)
        await logger.logAction(`Testing color contrast for ${testPage.name}`);
        
        const contrastResults = await page.evaluate(() => {
          const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, span, div, label');
          const contrastIssues: any[] = [];
          let totalElements = 0;
          let elementsChecked = 0;
          
          elements.forEach(element => {
            if (element.offsetParent && element.textContent?.trim()) {
              totalElements++;
              const computedStyle = window.getComputedStyle(element);
              const color = computedStyle.color;
              const backgroundColor = computedStyle.backgroundColor;
              
              // Basic contrast check (simplified)
              if (color && backgroundColor && 
                  color !== 'rgba(0, 0, 0, 0)' && 
                  backgroundColor !== 'rgba(0, 0, 0, 0)') {
                elementsChecked++;
                
                // Very basic check for obviously poor contrast
                if ((color.includes('rgb(255, 255, 255)') && backgroundColor.includes('rgb(255, 255, 255)')) ||
                    (color.includes('rgb(0, 0, 0)') && backgroundColor.includes('rgb(0, 0, 0)'))) {
                  contrastIssues.push({
                    element: element.tagName,
                    color: color,
                    backgroundColor: backgroundColor,
                    text: element.textContent?.slice(0, 50)
                  });
                }
              }
            }
          });
          
          return {
            totalElements,
            elementsChecked,
            contrastIssues: contrastIssues.length,
            issueDetails: contrastIssues.slice(0, 5) // First 5 issues
          };
        });
        
        await logger.logAction(`${testPage.name} color contrast`, contrastResults);
        
        // Test ARIA usage
        await logger.logAction(`Testing ARIA usage for ${testPage.name}`);
        
        const ariaResults = await page.evaluate(() => {
          const elementsWithRole = document.querySelectorAll('[role]').length;
          const elementsWithAriaLabel = document.querySelectorAll('[aria-label]').length;
          const elementsWithAriaLabelledBy = document.querySelectorAll('[aria-labelledby]').length;
          const elementsWithAriaDescribedBy = document.querySelectorAll('[aria-describedby]').length;
          const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden]').length;
          const elementsWithAriaExpanded = document.querySelectorAll('[aria-expanded]').length;
          const elementsWithAriaSelected = document.querySelectorAll('[aria-selected]').length;
          const elementsWithAriaChecked = document.querySelectorAll('[aria-checked]').length;
          
          const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], main, nav, header, footer').length;
          
          return {
            elementsWithRole,
            elementsWithAriaLabel,
            elementsWithAriaLabelledBy,
            elementsWithAriaDescribedBy,
            elementsWithAriaHidden,
            elementsWithAriaExpanded,
            elementsWithAriaSelected,
            elementsWithAriaChecked,
            landmarks,
            totalAriaElements: elementsWithRole + elementsWithAriaLabel + elementsWithAriaLabelledBy + elementsWithAriaDescribedBy
          };
        });
        
        await logger.logAction(`${testPage.name} ARIA usage`, ariaResults);
        
        // Calculate page accessibility score
        const pageA11yScore = Math.round(
          (semanticScore * 0.25) + 
          (keyboardTestResults.properRolePercentage * 0.25) + 
          (formA11yResults.labelCoverage * 0.25) + 
          (imageA11yResults.altCoverage * 0.25)
        );
        
        await logger.logAction(`${testPage.name} overall accessibility score: ${pageA11yScore}%`);
        overallA11yScore += pageA11yScore;
        
        await logger.logPerformance(page, `${testPage.name} accessibility test`);
        
      } catch (error) {
        await logger.logAction(`Error testing accessibility for ${testPage.name}`, error);
      }
    }
    
    const averageA11yScore = Math.round(overallA11yScore / pagesForA11yTest.length);
    await logger.logAction(`Overall application accessibility score: ${averageA11yScore}%`);
    
    await logger.logAssertion('Application meets accessibility standards', averageA11yScore >= 75, {
      averageScore: `${averageA11yScore}%`,
      threshold: '75%'
    });

    await logger.takeScreenshot(page, 'accessibility_audit_final', true);
    await logger.logAction('WCAG compliance audit completed');
  });

  test('Screen reader compatibility test', async ({ page }) => {
    logger = createTestLogger('Screen Reader Compatibility Test');
    await logger.setupPageLogging(page);

    await logger.logAction('Testing screen reader compatibility');

    // Test key pages for screen reader navigation
    const screenReaderTestPages = [
      '/auth/login',
      '/products', 
      '/dashboard'
    ];

    for (const testPath of screenReaderTestPages) {
      await logger.logAction(`Testing screen reader compatibility for ${testPath}`);
      
      await loggedNavigate(page, logger, testPath);
      await logger.takeScreenshot(page, `screen_reader_${testPath.replace(/\//g, '_')}`, true);
      
      await logger.waitAndLog(page, 'body', 3000);
      
      // Test reading order by traversing through elements
      const readingOrder = await page.evaluate(() => {
        const walker = document.createTreeWalker(
          document.body,
          NodeFilter.SHOW_ELEMENT,
          {
            acceptNode: function(node: any) {
              const element = node as Element;
              
              // Skip hidden elements
              if (element.hasAttribute('aria-hidden') && element.getAttribute('aria-hidden') === 'true') {
                return NodeFilter.FILTER_REJECT;
              }
              
              const computedStyle = window.getComputedStyle(element);
              if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                return NodeFilter.FILTER_REJECT;
              }
              
              // Include elements that would be read by screen readers
              if (element.tagName.match(/^H[1-6]$/) ||
                  element.tagName === 'P' ||
                  element.tagName === 'A' ||
                  element.tagName === 'BUTTON' ||
                  element.tagName === 'INPUT' ||
                  element.tagName === 'LABEL' ||
                  element.hasAttribute('aria-label') ||
                  element.hasAttribute('role')) {
                return NodeFilter.FILTER_ACCEPT;
              }
              
              return NodeFilter.FILTER_SKIP;
            }
          }
        );
        
        const readableElements: any[] = [];
        let currentNode;
        
        while (currentNode = walker.nextNode()) {
          const element = currentNode as Element;
          let text = '';
          
          // Get accessible text
          if (element.hasAttribute('aria-label')) {
            text = element.getAttribute('aria-label') || '';
          } else if (element.hasAttribute('aria-labelledby')) {
            const labelId = element.getAttribute('aria-labelledby');
            const labelElement = document.getElementById(labelId || '');
            text = labelElement?.textContent || '';
          } else if (element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden') {
            const label = document.querySelector(`label[for="${element.id}"]`) || element.closest('label');
            text = label?.textContent || element.getAttribute('placeholder') || element.getAttribute('title') || '';
          } else {
            text = element.textContent?.trim() || '';
          }
          
          if (text && text.length > 0) {
            readableElements.push({
              tag: element.tagName,
              text: text.slice(0, 100),
              role: element.getAttribute('role'),
              ariaLabel: element.getAttribute('aria-label'),
              id: element.id,
              className: element.className
            });
          }
        }
        
        return readableElements.slice(0, 20); // First 20 elements
      });
      
      await logger.logAction(`${testPath} screen reader order`, { 
        elementCount: readingOrder.length,
        elements: readingOrder
      });
      
      // Test landmark navigation
      const landmarks = await page.evaluate(() => {
        const landmarkElements = document.querySelectorAll(
          'main, nav, header, footer, aside, section[aria-label], [role="main"], [role="navigation"], [role="banner"], [role="contentinfo"], [role="complementary"]'
        );
        
        return Array.from(landmarkElements).map(element => ({
          tag: element.tagName,
          role: element.getAttribute('role'),
          ariaLabel: element.getAttribute('aria-label'),
          textContent: element.textContent?.slice(0, 50)
        }));
      });
      
      await logger.logAction(`${testPath} landmarks`, landmarks);
      
      // Test skip links
      const skipLinks = await page.evaluate(() => {
        const skipLinkElements = document.querySelectorAll('a[href^="#"], a[class*="skip"]');
        return Array.from(skipLinkElements).map(element => ({
          href: element.getAttribute('href'),
          text: element.textContent,
          visible: element.offsetParent !== null
        }));
      });
      
      if (skipLinks.length > 0) {
        await logger.logAssertion(`${testPath} has skip links`, true, skipLinks);
      } else {
        await logger.logAssertion(`${testPath} has skip links`, false);
      }
      
      // Test focus indicators
      const focusTestResults = await page.evaluate(() => {
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        let elementsWithFocusStyles = 0;
        
        focusableElements.forEach(element => {
          // Simulate focus to check for focus styles
          (element as HTMLElement).focus();
          const focusedStyle = window.getComputedStyle(element, ':focus');
          const normalStyle = window.getComputedStyle(element);
          
          // Basic check for focus indicators
          if (focusedStyle.outline !== normalStyle.outline ||
              focusedStyle.backgroundColor !== normalStyle.backgroundColor ||
              focusedStyle.borderColor !== normalStyle.borderColor ||
              focusedStyle.boxShadow !== normalStyle.boxShadow) {
            elementsWithFocusStyles++;
          }
          
          (element as HTMLElement).blur();
        });
        
        return {
          totalFocusable: focusableElements.length,
          elementsWithFocusStyles,
          focusStylePercentage: focusableElements.length > 0 ? 
            Math.round((elementsWithFocusStyles / focusableElements.length) * 100) : 0
        };
      });
      
      await logger.logAction(`${testPath} focus indicators`, focusTestResults);
      await logger.logAssertion(`${testPath} has adequate focus indicators`, focusTestResults.focusStylePercentage >= 70);
    }

    await logger.logAction('Screen reader compatibility test completed');
  });

  test('Keyboard navigation comprehensive test', async ({ page }) => {
    logger = createTestLogger('Keyboard Navigation Comprehensive Test');
    await logger.setupPageLogging(page);

    await logger.logAction('Testing comprehensive keyboard navigation');

    await loggedNavigate(page, logger, '/auth/login');
    await logger.takeScreenshot(page, 'keyboard_nav_login_initial', true);
    
    await logger.waitAndLog(page, 'body', 3000);

    // Test Tab navigation through all focusable elements
    await logger.logAction('Testing Tab navigation sequence');
    
    const tabNavigationResults = await page.evaluate(() => {
      const focusableElements = Array.from(document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )).filter(el => {
        return el.offsetParent !== null && !el.hasAttribute('disabled');
      });
      
      return {
        totalFocusableElements: focusableElements.length,
        elementTypes: focusableElements.map(el => el.tagName).reduce((acc: any, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        }, {})
      };
    });
    
    await logger.logAction('Focusable elements analysis', tabNavigationResults);
    
    // Navigate through elements with Tab
    const focusSequence: any[] = [];
    for (let i = 0; i < Math.min(10, tabNavigationResults.totalFocusableElements); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const focusedInfo = await page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused?.tagName,
          type: focused?.getAttribute('type'),
          id: focused?.id,
          className: focused?.className,
          textContent: focused?.textContent?.slice(0, 30),
          ariaLabel: focused?.getAttribute('aria-label'),
          tabIndex: focused?.getAttribute('tabindex')
        };
      });
      
      focusSequence.push({ step: i + 1, ...focusedInfo });
      await logger.logAction(`Tab step ${i + 1}`, focusedInfo);
    }
    
    await logger.takeScreenshot(page, 'keyboard_nav_tab_sequence');
    
    // Test Shift+Tab (reverse navigation)
    await logger.logAction('Testing Shift+Tab reverse navigation');
    
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      await page.waitForTimeout(200);
      
      const focusedInfo = await page.evaluate(() => {
        const focused = document.activeElement;
        return {
          tagName: focused?.tagName,
          textContent: focused?.textContent?.slice(0, 30)
        };
      });
      
      await logger.logAction(`Shift+Tab step ${i + 1}`, focusedInfo);
    }
    
    // Test Enter and Space key interactions
    await logger.logAction('Testing Enter and Space key interactions');
    
    // Focus on a button and test Enter
    const buttonFocused = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button');
      if (buttons.length > 0) {
        (buttons[0] as HTMLElement).focus();
        return true;
      }
      return false;
    });
    
    if (buttonFocused) {
      await logger.logAction('Testing Enter key on button');
      await page.keyboard.press('Enter');
      await logger.takeScreenshot(page, 'keyboard_enter_button');
      
      // Check for any modal or navigation
      await page.waitForTimeout(1000);
      const modal = page.locator('[class*="modal"], [role="dialog"]');
      if (await modal.count() > 0) {
        await logger.logAction('Enter key on button opened modal');
        await page.keyboard.press('Escape');
        await logger.takeScreenshot(page, 'keyboard_escape_modal');
      }
    }
    
    // Test arrow key navigation (if applicable)
    await logger.logAction('Testing arrow key navigation for menus/dropdowns');
    
    const menuElements = await page.evaluate(() => {
      return document.querySelectorAll('[role="menu"], [role="menubar"], [role="listbox"], select').length;
    });
    
    if (menuElements > 0) {
      await logger.logAction('Found menu-like elements, testing arrow keys');
      
      // Focus on first menu element
      await page.evaluate(() => {
        const menu = document.querySelector('[role="menu"], [role="menubar"], [role="listbox"], select');
        if (menu) {
          (menu as HTMLElement).focus();
        }
      });
      
      // Test arrow keys
      const arrowKeys = ['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'];
      for (const key of arrowKeys) {
        await page.keyboard.press(key);
        await page.waitForTimeout(100);
        
        const focusedAfterArrow = await page.evaluate(() => {
          return {
            tag: document.activeElement?.tagName,
            role: document.activeElement?.getAttribute('role')
          };
        });
        
        await logger.logAction(`${key} navigation result`, focusedAfterArrow);
      }
    }
    
    // Test Escape key functionality
    await logger.logAction('Testing Escape key functionality');
    
    // Try to open a modal first
    const modalTrigger = await page.locator('button').first();
    if (await modalTrigger.count() > 0) {
      await loggedClick(page, logger, 'button', 'Open modal for Escape test');
      await page.waitForTimeout(1000);
      
      const modal = page.locator('[class*="modal"], [role="dialog"]');
      if (await modal.count() > 0) {
        await logger.logAction('Modal opened, testing Escape key');
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const modalStillVisible = await modal.count();
        await logger.logAssertion('Escape key closes modal', modalStillVisible === 0);
        await logger.takeScreenshot(page, 'keyboard_escape_test');
      }
    }
    
    // Test form navigation
    await logger.logAction('Testing form keyboard navigation');
    
    await loggedNavigate(page, logger, '/auth/register');
    await logger.takeScreenshot(page, 'keyboard_nav_form_initial');
    
    await logger.waitAndLog(page, 'body', 2000);
    
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      return Array.from(inputs).map((input, index) => ({
        index,
        type: input.getAttribute('type') || input.tagName,
        name: input.getAttribute('name'),
        required: input.hasAttribute('required')
      }));
    });
    
    await logger.logAction('Form elements for keyboard navigation', formElements);
    
    // Navigate through form fields with Tab
    for (let i = 0; i < Math.min(5, formElements.length); i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      const currentField = await page.evaluate(() => {
        const focused = document.activeElement as HTMLInputElement;
        return {
          type: focused?.type || focused?.tagName,
          value: focused?.value,
          placeholder: focused?.placeholder
        };
      });
      
      await logger.logAction(`Form field ${i + 1}`, currentField);
      
      // Try typing in text inputs
      if (currentField.type === 'text' || currentField.type === 'email' || currentField.type === 'password') {
        await page.keyboard.type('test');
        await logger.takeScreenshot(page, `form_field_${i}_typed`);
      }
    }
    
    // Test form submission with Enter
    const submitButton = await page.locator('button[type="submit"], input[type="submit"]').first();
    if (await submitButton.count() > 0) {
      await submitButton.focus();
      await logger.logAction('Testing form submission with Enter key');
      await page.keyboard.press('Enter');
      await logger.takeScreenshot(page, 'form_submit_keyboard');
    }

    await logger.logPerformance(page, 'Keyboard navigation comprehensive test');
    await logger.logAction('Keyboard navigation comprehensive test completed');
  });

  test('Mobile accessibility test', async ({ page }) => {
    logger = createTestLogger('Mobile Accessibility Test');
    await logger.setupPageLogging(page);

    await logger.logAction('Testing mobile accessibility features');

    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await loggedNavigate(page, logger, '/');
    await logger.takeScreenshot(page, 'mobile_a11y_homepage', true);
    
    await logger.waitAndLog(page, 'body', 3000);

    // Test touch target sizes
    await logger.logAction('Testing touch target sizes for mobile');
    
    const touchTargetResults = await page.evaluate(() => {
      const interactiveElements = document.querySelectorAll('button, a, input[type="button"], input[type="submit"], [onclick]');
      const touchTargets: any[] = [];
      let adequateSizeTargets = 0;
      const minSize = 44; // 44px minimum touch target size
      
      interactiveElements.forEach((element, index) => {
        if (element.offsetParent) { // visible elements only
          const rect = element.getBoundingClientRect();
          const width = rect.width;
          const height = rect.height;
          const isAdequateSize = width >= minSize && height >= minSize;
          
          if (isAdequateSize) {
            adequateSizeTargets++;
          }
          
          touchTargets.push({
            index,
            tag: element.tagName,
            width: Math.round(width),
            height: Math.round(height),
            adequateSize: isAdequateSize,
            text: element.textContent?.slice(0, 30)
          });
        }
      });
      
      return {
        totalTargets: touchTargets.length,
        adequateSizeTargets,
        adequateSizePercentage: touchTargets.length > 0 ? 
          Math.round((adequateSizeTargets / touchTargets.length) * 100) : 0,
        targets: touchTargets.slice(0, 10) // First 10 targets
      };
    });
    
    await logger.logAction('Mobile touch target analysis', touchTargetResults);
    await logger.logAssertion('Adequate touch target sizes', touchTargetResults.adequateSizePercentage >= 80);
    
    // Test mobile navigation
    await logger.logAction('Testing mobile navigation accessibility');
    
    const mobileNavResults = await page.evaluate(() => {
      const hamburgerMenu = document.querySelector('[class*="hamburger"], [class*="menu-toggle"], button[class*="mobile"]');
      const mobileNav = document.querySelector('[class*="mobile-nav"], nav[class*="mobile"]');
      
      return {
        hasHamburgerMenu: !!hamburgerMenu,
        hasMobileNav: !!mobileNav,
        hamburgerAriaLabel: hamburgerMenu?.getAttribute('aria-label'),
        hamburgerRole: hamburgerMenu?.getAttribute('role'),
        mobileNavRole: mobileNav?.getAttribute('role')
      };
    });
    
    await logger.logAction('Mobile navigation elements', mobileNavResults);
    
    if (mobileNavResults.hasHamburgerMenu) {
      await logger.logAction('Testing hamburger menu interaction');
      const hamburger = page.locator('[class*="hamburger"], [class*="menu-toggle"], button[class*="mobile"]').first();
      
      await loggedClick(page, logger, '[class*="hamburger"], [class*="menu-toggle"]', 'Open mobile menu');
      await logger.takeScreenshot(page, 'mobile_menu_opened');
      
      // Check if menu opened
      const menuOpened = await page.evaluate(() => {
        const nav = document.querySelector('[class*="mobile-nav"], nav[class*="mobile"]');
        if (nav) {
          const style = window.getComputedStyle(nav);
          return style.display !== 'none' && style.visibility !== 'hidden';
        }
        return false;
      });
      
      await logger.logAssertion('Mobile menu opens when hamburger clicked', menuOpened);
      
      if (menuOpened) {
        // Test menu navigation
        const menuItems = page.locator('[class*="mobile-nav"] a, nav[class*="mobile"] a');
        const menuItemCount = await menuItems.count();
        
        if (menuItemCount > 0) {
          await logger.logAction(`Testing ${menuItemCount} mobile menu items`);
          
          for (let i = 0; i < Math.min(menuItemCount, 3); i++) {
            const item = menuItems.nth(i);
            const itemText = await item.textContent();
            await logger.logAction(`Mobile menu item ${i + 1}: ${itemText}`);
            
            // Test touch target size for menu items
            const itemRect = await item.boundingBox();
            if (itemRect) {
              const isAdequateSize = itemRect.height >= 44;
              await logger.logAssertion(`Menu item ${i + 1} has adequate touch target`, isAdequateSize, {
                height: Math.round(itemRect.height)
              });
            }
          }
        }
        
        // Close mobile menu
        await loggedClick(page, logger, '[class*="hamburger"], [class*="menu-toggle"], [class*="close"]', 'Close mobile menu');
        await logger.takeScreenshot(page, 'mobile_menu_closed');
      }
    }
    
    // Test mobile form accessibility
    await logger.logAction('Testing mobile form accessibility');
    
    await loggedNavigate(page, logger, '/auth/login');
    await logger.takeScreenshot(page, 'mobile_form_login');
    
    const mobileFormResults = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input');
      const labels = document.querySelectorAll('label');
      
      let inputsWithAdequateSize = 0;
      let inputsWithLabels = 0;
      const minHeight = 44;
      
      inputs.forEach(input => {
        if (input.type !== 'hidden' && input.offsetParent) {
          const rect = input.getBoundingClientRect();
          if (rect.height >= minHeight) {
            inputsWithAdequateSize++;
          }
          
          // Check for labels
          const id = input.id;
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          const parentLabel = input.closest('label');
          
          if (label || parentLabel) {
            inputsWithLabels++;
          }
        }
      });
      
      return {
        totalInputs: inputs.length,
        inputsWithAdequateSize,
        inputsWithLabels,
        adequateSizePercentage: inputs.length > 0 ? 
          Math.round((inputsWithAdequateSize / inputs.length) * 100) : 0,
        labelCoverage: inputs.length > 0 ? 
          Math.round((inputsWithLabels / inputs.length) * 100) : 0
      };
    });
    
    await logger.logAction('Mobile form accessibility results', mobileFormResults);
    await logger.logAssertion('Mobile form inputs have adequate size', mobileFormResults.adequateSizePercentage >= 80);
    await logger.logAssertion('Mobile form inputs have labels', mobileFormResults.labelCoverage >= 90);
    
    // Test mobile zoom accessibility
    await logger.logAction('Testing mobile zoom accessibility');
    
    const zoomResults = await page.evaluate(() => {
      const viewport = document.querySelector('meta[name="viewport"]');
      const content = viewport?.getAttribute('content') || '';
      
      return {
        hasViewportMeta: !!viewport,
        viewportContent: content,
        allowsZoom: !content.includes('user-scalable=no') && !content.includes('maximum-scale=1'),
        maximumScale: content.includes('maximum-scale') ? 
          content.match(/maximum-scale=([0-9.]+)/)?.[1] : null
      };
    });
    
    await logger.logAction('Mobile zoom configuration', zoomResults);
    await logger.logAssertion('Mobile zoom is not disabled', zoomResults.allowsZoom, {
      viewportContent: zoomResults.viewportContent
    });
    
    // Reset to desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await logger.logPerformance(page, 'Mobile accessibility test');
    await logger.logAction('Mobile accessibility test completed');
  });
});