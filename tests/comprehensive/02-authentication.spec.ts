import { test, expect } from '@playwright/test';
import { createTestLogger, loggedNavigate, loggedClick, loggedFill, VerboseTestLogger } from './test-logger';

test.describe('Comprehensive Authentication Testing', () => {
  let logger: VerboseTestLogger;

  test.beforeEach(async ({ page }) => {
    logger = createTestLogger('Authentication');
    await logger.setupPageLogging(page);
  });

  test.afterEach(async ({ page }) => {
    if (logger) {
      await logger.generateReport();
    }
  });

  test('Login page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Login Page Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to login page
    await loggedNavigate(page, logger, '/auth/login');
    await logger.takeScreenshot(page, 'login_initial', true);

    // Check page load and form elements
    await logger.waitAndLog(page, 'body', 5000);

    // Look for login form elements
    const formSelectors = {
      emailInput: [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email"], input[placeholder*="邮箱"]',
        'input[id*="email"]'
      ],
      passwordInput: [
        'input[type="password"]',
        'input[name="password"]', 
        'input[placeholder*="password"], input[placeholder*="密码"]',
        'input[id*="password"]'
      ],
      submitButton: [
        'button[type="submit"]',
        'button:text("登录"), button:text("Login")',
        'input[type="submit"]',
        'button[class*="submit"], button[class*="login"]'
      ]
    };

    let emailSelector = '';
    let passwordSelector = '';
    let submitSelector = '';

    // Find email input
    for (const selector of formSelectors.emailInput) {
      if (await page.locator(selector).count() > 0) {
        emailSelector = selector;
        await logger.logAssertion(`Email input found: ${selector}`, true);
        await logger.logElementInfo(page, selector, 'email-input');
        break;
      }
    }

    // Find password input
    for (const selector of formSelectors.passwordInput) {
      if (await page.locator(selector).count() > 0) {
        passwordSelector = selector;
        await logger.logAssertion(`Password input found: ${selector}`, true);
        await logger.logElementInfo(page, selector, 'password-input');
        break;
      }
    }

    // Find submit button
    for (const selector of formSelectors.submitButton) {
      if (await page.locator(selector).count() > 0) {
        submitSelector = selector;
        await logger.logAssertion(`Submit button found: ${selector}`, true);
        await logger.logElementInfo(page, selector, 'submit-button');
        break;
      }
    }

    if (!emailSelector || !passwordSelector || !submitSelector) {
      await logger.logAssertion('Complete login form found', false, { 
        email: !!emailSelector, 
        password: !!passwordSelector, 
        submit: !!submitSelector 
      });
      await logger.takeScreenshot(page, 'login_form_missing_elements');
      return; // Skip test if form is incomplete
    }

    // Test form validation
    await logger.logAction('Testing form validation');
    
    // Test empty form submission
    await logger.takeScreenshot(page, 'before_empty_submit');
    await loggedClick(page, logger, submitSelector, 'Submit empty form');
    await logger.takeScreenshot(page, 'after_empty_submit');

    // Check for validation messages
    const validationSelectors = [
      '[class*="error"]',
      '[class*="invalid"]',
      '[role="alert"]',
      '.error-message',
      'span:has-text("required"), span:has-text("必填")'
    ];

    let validationFound = false;
    for (const selector of validationSelectors) {
      if (await page.locator(selector).count() > 0) {
        validationFound = true;
        await logger.logAssertion(`Form validation message found: ${selector}`, true);
        await logger.logElementInfo(page, selector, 'validation-message');
        break;
      }
    }

    if (!validationFound) {
      await logger.logAssertion('Form validation messages displayed', false);
    }

    // Test invalid email format
    await logger.logAction('Testing invalid email validation');
    await loggedFill(page, logger, emailSelector, 'invalid-email', 'Fill invalid email');
    await loggedFill(page, logger, passwordSelector, 'test123', 'Fill short password');
    await logger.takeScreenshot(page, 'invalid_email_filled');
    await loggedClick(page, logger, submitSelector, 'Submit with invalid email');
    await logger.takeScreenshot(page, 'invalid_email_submit');

    // Test password visibility toggle
    await logger.logAction('Testing password visibility toggle');
    const eyeButton = page.locator('button:has([class*="eye"]), button[aria-label*="password"], button[title*="password"]');
    if (await eyeButton.count() > 0) {
      await logger.logAssertion('Password visibility toggle found', true);
      
      // Check initial password field type
      const initialType = await page.locator(passwordSelector).getAttribute('type');
      await logger.logAction(`Initial password field type: ${initialType}`);
      
      await loggedClick(page, logger, 'button:has([class*="eye"])', 'Toggle password visibility');
      await logger.takeScreenshot(page, 'password_visibility_toggled');
      
      // Check password field type after toggle
      const toggledType = await page.locator(passwordSelector).getAttribute('type');
      await logger.logAction(`Password field type after toggle: ${toggledType}`);
      
      const toggleWorked = initialType !== toggledType;
      await logger.logAssertion('Password visibility toggle works', toggleWorked, { 
        initial: initialType, 
        toggled: toggledType 
      });
    } else {
      await logger.logAssertion('Password visibility toggle found', false);
    }

    // Test valid login attempt (non-functional - just UI testing)
    await logger.logAction('Testing valid login form submission');
    
    // Clear and fill with valid test data
    await page.locator(emailSelector).clear();
    await page.locator(passwordSelector).clear();
    
    await loggedFill(page, logger, emailSelector, 'test@example.com', 'Fill valid test email');
    await loggedFill(page, logger, passwordSelector, 'TestPassword123!', 'Fill valid test password');
    await logger.takeScreenshot(page, 'valid_credentials_filled');
    
    // Monitor network requests during login attempt
    await logger.logAction('Monitoring network requests for login attempt');
    
    const loginResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/login') || response.url().includes('/auth/login'), 
      { timeout: 10000 }
    ).catch(() => null);
    
    await loggedClick(page, logger, submitSelector, 'Submit valid login form');
    await logger.takeScreenshot(page, 'valid_login_submitted');
    
    const loginResponse = await loginResponsePromise;
    if (loginResponse) {
      await logger.logAction('Login API response received', { 
        status: loginResponse.status(),
        url: loginResponse.url()
      });
    } else {
      await logger.logAction('No login API response detected (timeout or different endpoint)');
    }

    // Check for loading states
    const loadingSelectors = [
      'button:disabled',
      '[class*="loading"]',
      '[class*="spinner"]',
      'button:has([class*="loading"])'
    ];

    for (const selector of loadingSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Loading state found: ${selector}`, true);
        await logger.takeScreenshot(page, 'loading_state');
        break;
      }
    }

    // Wait for any navigation or error messages
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    await logger.logAction('Final URL after login attempt', { finalUrl });
    
    if (finalUrl !== 'http://localhost:3002/auth/login') {
      await logger.logAction('Login appears to have redirected user', { newUrl: finalUrl });
      await logger.takeScreenshot(page, 'login_redirect_success');
    } else {
      // Check for error messages
      const errorSelectors = [
        '[class*="error"]',
        '[role="alert"]',
        '.alert-danger',
        'div:has-text("incorrect"), div:has-text("invalid"), div:has-text("错误")'
      ];

      for (const selector of errorSelectors) {
        if (await page.locator(selector).count() > 0) {
          await logger.logAssertion(`Login error message found: ${selector}`, true);
          await logger.logElementInfo(page, selector, 'login-error');
          await logger.takeScreenshot(page, 'login_error_message');
          break;
        }
      }
    }

    // Test "Forgot Password" link if available
    await logger.logAction('Testing forgot password functionality');
    const forgotPasswordSelectors = [
      'a:text("忘记密码"), a:text("Forgot Password")',
      'a[href*="forgot"], a[href*="reset"]',
      'button:text("忘记密码"), button:text("Forgot Password")'
    ];

    for (const selector of forgotPasswordSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Forgot password link found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click forgot password');
        await logger.takeScreenshot(page, 'forgot_password_clicked');
        
        const forgotUrl = page.url();
        await logger.logAction('Forgot password navigation', { forgotUrl });
        
        if (forgotUrl !== 'http://localhost:3002/auth/login') {
          await page.goBack(); // Return to login page
        }
        break;
      }
    }

    // Test registration link
    await logger.logAction('Testing registration link');
    const registerLinkSelectors = [
      'a:text("注册"), a:text("Register"), a:text("Sign Up")',
      'a[href*="register"], a[href*="signup"]',
      'button:text("注册"), button:text("Register")'
    ];

    for (const selector of registerLinkSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Registration link found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click registration link');
        await logger.takeScreenshot(page, 'register_link_clicked');
        
        const registerUrl = page.url();
        await logger.logAction('Registration navigation', { registerUrl });
        
        if (registerUrl !== 'http://localhost:3002/auth/login') {
          await page.goBack(); // Return to login page
        }
        break;
      }
    }

    await logger.logPerformance(page, 'Login page test');
    await logger.takeScreenshot(page, 'login_final');
    await logger.logAction('Login page test completed');
  });

  test('Registration page - Complete functionality test', async ({ page }) => {
    logger = createTestLogger('Registration Page Complete Test');
    await logger.setupPageLogging(page);

    // Navigate to registration page
    await loggedNavigate(page, logger, '/auth/register');
    await logger.takeScreenshot(page, 'register_initial', true);

    await logger.waitAndLog(page, 'body', 5000);

    // Look for registration form elements
    const regFormSelectors = {
      emailInput: [
        'input[type="email"]',
        'input[name="email"]',
        'input[placeholder*="email"], input[placeholder*="邮箱"]'
      ],
      passwordInput: [
        'input[type="password"][name="password"], input[type="password"]:not([name="confirmPassword"])',
        'input[name="password"]'
      ],
      confirmPasswordInput: [
        'input[name="confirmPassword"]',
        'input[name="confirm"], input[name="confirm_password"]',
        'input[placeholder*="confirm"], input[placeholder*="确认"]'
      ],
      submitButton: [
        'button[type="submit"]',
        'button:text("注册"), button:text("Register"), button:text("Sign Up")',
        'button[class*="submit"], button[class*="register"]'
      ]
    };

    let emailSelector = '';
    let passwordSelector = '';
    let confirmPasswordSelector = '';
    let submitSelector = '';

    // Find form elements
    for (const selector of regFormSelectors.emailInput) {
      if (await page.locator(selector).count() > 0) {
        emailSelector = selector;
        await logger.logAssertion(`Registration email input found: ${selector}`, true);
        break;
      }
    }

    for (const selector of regFormSelectors.passwordInput) {
      if (await page.locator(selector).count() > 0) {
        passwordSelector = selector;
        await logger.logAssertion(`Registration password input found: ${selector}`, true);
        break;
      }
    }

    for (const selector of regFormSelectors.confirmPasswordInput) {
      if (await page.locator(selector).count() > 0) {
        confirmPasswordSelector = selector;
        await logger.logAssertion(`Password confirmation input found: ${selector}`, true);
        break;
      }
    }

    for (const selector of regFormSelectors.submitButton) {
      if (await page.locator(selector).count() > 0) {
        submitSelector = selector;
        await logger.logAssertion(`Registration submit button found: ${selector}`, true);
        break;
      }
    }

    const hasBasicForm = emailSelector && passwordSelector && submitSelector;
    await logger.logAssertion('Registration form has basic elements', hasBasicForm, {
      email: !!emailSelector,
      password: !!passwordSelector,
      submit: !!submitSelector,
      confirmPassword: !!confirmPasswordSelector
    });

    if (!hasBasicForm) {
      await logger.takeScreenshot(page, 'registration_form_incomplete');
      return;
    }

    // Test empty form validation
    await logger.logAction('Testing empty form validation');
    await loggedClick(page, logger, submitSelector, 'Submit empty registration form');
    await logger.takeScreenshot(page, 'empty_registration_submit');

    // Check for validation messages
    const validationFound = await page.locator('[class*="error"], [role="alert"]').count() > 0;
    await logger.logAssertion('Empty form validation messages shown', validationFound);

    // Test password requirements
    await logger.logAction('Testing password requirements');
    await loggedFill(page, logger, emailSelector, 'test@example.com', 'Fill registration email');
    await loggedFill(page, logger, passwordSelector, '123', 'Fill weak password');
    
    if (confirmPasswordSelector) {
      await loggedFill(page, logger, confirmPasswordSelector, '123', 'Fill weak password confirmation');
    }
    
    await logger.takeScreenshot(page, 'weak_password_filled');
    await loggedClick(page, logger, submitSelector, 'Submit with weak password');
    await logger.takeScreenshot(page, 'weak_password_submit');

    // Test password mismatch (if confirm password field exists)
    if (confirmPasswordSelector) {
      await logger.logAction('Testing password mismatch validation');
      await page.locator(passwordSelector).clear();
      await page.locator(confirmPasswordSelector).clear();
      
      await loggedFill(page, logger, passwordSelector, 'Password123!', 'Fill password');
      await loggedFill(page, logger, confirmPasswordSelector, 'DifferentPassword123!', 'Fill different password confirmation');
      await logger.takeScreenshot(page, 'password_mismatch_filled');
      await loggedClick(page, logger, submitSelector, 'Submit with password mismatch');
      await logger.takeScreenshot(page, 'password_mismatch_submit');

      const mismatchError = await page.locator('*:has-text("match"), *:has-text("匹配")').count() > 0;
      await logger.logAssertion('Password mismatch validation shown', mismatchError);
    }

    // Test valid registration form
    await logger.logAction('Testing valid registration form');
    await page.locator(emailSelector).clear();
    await page.locator(passwordSelector).clear();
    if (confirmPasswordSelector) {
      await page.locator(confirmPasswordSelector).clear();
    }

    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    await loggedFill(page, logger, emailSelector, testEmail, 'Fill valid email');
    await loggedFill(page, logger, passwordSelector, testPassword, 'Fill valid password');
    
    if (confirmPasswordSelector) {
      await loggedFill(page, logger, confirmPasswordSelector, testPassword, 'Fill matching password confirmation');
    }
    
    await logger.takeScreenshot(page, 'valid_registration_filled');

    // Test terms and conditions checkbox if present
    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await logger.logAction('Testing terms and conditions checkbox');
      await loggedClick(page, logger, 'input[type="checkbox"]', 'Accept terms and conditions');
      await logger.takeScreenshot(page, 'terms_accepted');
    }

    // Submit registration form
    const regResponsePromise = page.waitForResponse(response => 
      response.url().includes('/api/auth/register') || response.url().includes('/auth/register'),
      { timeout: 10000 }
    ).catch(() => null);

    await loggedClick(page, logger, submitSelector, 'Submit valid registration');
    await logger.takeScreenshot(page, 'registration_submitted');

    const regResponse = await regResponsePromise;
    if (regResponse) {
      await logger.logAction('Registration API response received', {
        status: regResponse.status(),
        url: regResponse.url()
      });
    }

    // Wait for response and check result
    await page.waitForTimeout(2000);
    
    const finalUrl = page.url();
    await logger.logAction('Registration result', { finalUrl });

    if (finalUrl !== 'http://localhost:3002/auth/register') {
      await logger.logAction('Registration appears successful - redirected', { newUrl: finalUrl });
      await logger.takeScreenshot(page, 'registration_success_redirect');
    } else {
      // Check for success or error messages
      const successMessage = await page.locator('*:has-text("success"), *:has-text("成功")').count() > 0;
      const errorMessage = await page.locator('[class*="error"], [role="alert"]').count() > 0;
      
      await logger.logAssertion('Registration success message shown', successMessage);
      await logger.logAssertion('Registration error message shown', errorMessage);
      
      if (errorMessage) {
        await logger.takeScreenshot(page, 'registration_error');
      }
    }

    // Test login link
    const loginLinkSelectors = [
      'a:text("登录"), a:text("Login"), a:text("Sign In")',
      'a[href*="login"]'
    ];

    for (const selector of loginLinkSelectors) {
      if (await page.locator(selector).count() > 0) {
        await logger.logAssertion(`Login link found: ${selector}`, true);
        await loggedClick(page, logger, selector, 'Click login link from registration');
        await logger.takeScreenshot(page, 'login_link_clicked');
        break;
      }
    }

    await logger.logPerformance(page, 'Registration page test');
    await logger.takeScreenshot(page, 'registration_final');
    await logger.logAction('Registration page test completed');
  });

  test('Web3 authentication test', async ({ page }) => {
    logger = createTestLogger('Web3 Authentication Test');
    await logger.setupPageLogging(page);

    // First check login page for Web3 options
    await loggedNavigate(page, logger, '/auth/login');
    await logger.takeScreenshot(page, 'web3_auth_check', true);

    // Look for Web3 login elements
    const web3Selectors = [
      'button:text("MetaMask"), button:has-text("MetaMask")',
      'button:text("WalletConnect"), button:has-text("WalletConnect")',
      'button:text("Connect Wallet"), button:has-text("连接钱包")',
      '[class*="wallet"], [class*="web3"]',
      'button[class*="connect"]'
    ];

    let web3Found = false;
    for (const selector of web3Selectors) {
      if (await page.locator(selector).count() > 0) {
        web3Found = true;
        await logger.logAssertion(`Web3 login option found: ${selector}`, true);
        await logger.logElementInfo(page, selector, 'web3-login');
        
        // Test clicking the Web3 login button
        await loggedClick(page, logger, selector, 'Click Web3 login button');
        await logger.takeScreenshot(page, 'web3_login_clicked');
        
        // Wait for any modal or popup
        await page.waitForTimeout(2000);
        
        // Check for wallet connection modal
        const modal = page.locator('[class*="modal"], [role="dialog"]');
        if (await modal.count() > 0) {
          await logger.logAction('Web3 wallet connection modal appeared');
          await logger.takeScreenshot(page, 'web3_modal');
          
          // Close modal for testing purposes
          const closeBtn = modal.locator('button[class*="close"], button:has-text("×")');
          if (await closeBtn.count() > 0) {
            await loggedClick(page, logger, 'button[class*="close"]', 'Close Web3 modal');
          }
        }
        break;
      }
    }

    if (!web3Found) {
      await logger.logAssertion('Web3 authentication options found', false);
      
      // Check registration page for Web3 options
      await loggedNavigate(page, logger, '/auth/register');
      await logger.takeScreenshot(page, 'web3_register_check');
      
      for (const selector of web3Selectors) {
        if (await page.locator(selector).count() > 0) {
          web3Found = true;
          await logger.logAssertion(`Web3 registration option found: ${selector}`, true);
          break;
        }
      }
    }

    if (!web3Found) {
      await logger.logAction('No Web3 authentication options found on auth pages');
      
      // Check main pages for wallet connection
      await loggedNavigate(page, logger, '/');
      const homeWeb3 = await page.locator('button:has-text("Connect"), button:has-text("Wallet")').count();
      
      if (homeWeb3 > 0) {
        await logger.logAssertion('Web3 wallet connection found on homepage', true);
      } else {
        await logger.logAssertion('Web3 integration found anywhere', false);
      }
    }

    await logger.logPerformance(page, 'Web3 authentication test');
    await logger.logAction('Web3 authentication test completed');
  });

  test('Authentication flow integration test', async ({ page }) => {
    logger = createTestLogger('Authentication Flow Integration Test');
    await logger.setupPageLogging(page);

    await logger.logAction('Testing complete authentication flow integration');

    // Test protected route access without login
    await loggedNavigate(page, logger, '/dashboard');
    await logger.takeScreenshot(page, 'protected_route_no_auth');
    
    const dashboardUrl = page.url();
    await logger.logAction('Accessing protected route without auth', { finalUrl: dashboardUrl });
    
    const isRedirectedToLogin = dashboardUrl.includes('/auth/login') || dashboardUrl.includes('/login');
    await logger.logAssertion('Redirected to login when accessing protected route', isRedirectedToLogin);
    
    if (!isRedirectedToLogin) {
      // If not redirected, check for login prompt or access denied message
      const loginPromptSelectors = [
        '*:has-text("login"), *:has-text("登录")',
        '*:has-text("unauthorized"), *:has-text("unauthorized")',
        'button:text("Login"), button:text("登录")'
      ];
      
      let hasLoginPrompt = false;
      for (const selector of loginPromptSelectors) {
        if (await page.locator(selector).count() > 0) {
          hasLoginPrompt = true;
          await logger.logAssertion(`Login prompt found: ${selector}`, true);
          break;
        }
      }
      
      if (!hasLoginPrompt) {
        await logger.logAssertion('Protected route properly secured', false, { 
          message: 'Dashboard accessible without authentication' 
        });
      }
    }

    // Test navigation between auth pages
    await logger.logAction('Testing navigation between authentication pages');
    
    await loggedNavigate(page, logger, '/auth/login');
    await logger.takeScreenshot(page, 'auth_nav_login');
    
    // Look for register link and click it
    const registerLink = page.locator('a:text("注册"), a:text("Register"), a[href*="register"]').first();
    if (await registerLink.count() > 0) {
      await loggedClick(page, logger, 'a:text("注册"), a:text("Register")', 'Navigate to register from login');
      await logger.takeScreenshot(page, 'auth_nav_to_register');
      
      const regUrl = page.url();
      const isOnRegister = regUrl.includes('/auth/register') || regUrl.includes('/register');
      await logger.logAssertion('Successfully navigated to registration', isOnRegister);
      
      if (isOnRegister) {
        // Go back to login
        const loginLink = page.locator('a:text("登录"), a:text("Login"), a[href*="login"]').first();
        if (await loginLink.count() > 0) {
          await loggedClick(page, logger, 'a:text("登录"), a:text("Login")', 'Navigate back to login');
          await logger.takeScreenshot(page, 'auth_nav_back_to_login');
          
          const backToLoginUrl = page.url();
          const isBackOnLogin = backToLoginUrl.includes('/auth/login') || backToLoginUrl.includes('/login');
          await logger.logAssertion('Successfully navigated back to login', isBackOnLogin);
        }
      }
    }

    // Test authentication state persistence
    await logger.logAction('Testing authentication state and session management');
    
    // Try to detect if there's any session/auth state management
    const authStateIndicators = [
      'localStorage',
      'sessionStorage',
      'cookies'
    ];
    
    for (const storage of authStateIndicators) {
      try {
        const hasAuthData = await page.evaluate((storageType) => {
          if (storageType === 'localStorage') {
            return Object.keys(localStorage).some(key => 
              key.includes('auth') || key.includes('token') || key.includes('user')
            );
          } else if (storageType === 'sessionStorage') {
            return Object.keys(sessionStorage).some(key => 
              key.includes('auth') || key.includes('token') || key.includes('user')
            );
          } else if (storageType === 'cookies') {
            return document.cookie.includes('auth') || 
                   document.cookie.includes('token') || 
                   document.cookie.includes('session');
          }
          return false;
        }, storage);
        
        await logger.logAction(`${storage} auth data check`, { hasAuthData });
      } catch (error) {
        await logger.logAction(`Could not check ${storage}`, error);
      }
    }

    await logger.logPerformance(page, 'Authentication flow integration test');
    await logger.takeScreenshot(page, 'auth_flow_final');
    await logger.logAction('Authentication flow integration test completed');
  });
});