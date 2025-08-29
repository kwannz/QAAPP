import { Page, Locator, expect } from '@playwright/test';

/**
 * Page Object Model for Authentication pages
 * Provides reusable methods for login, register, and authentication flows
 */
export class AuthPage {
  readonly page: Page;
  
  // Login page locators
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly loginErrorMessage: Locator;
  
  // Register page locators
  readonly registerForm: Locator;
  readonly registerEmailInput: Locator;
  readonly registerPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly registerErrorMessage: Locator;
  
  // Shared elements
  readonly authTitle: Locator;
  readonly switchAuthModeLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Login elements
    this.loginForm = page.locator('form[data-testid="login-form"], form:has(input[name="email"]):has(input[name="password"])');
    this.emailInput = page.locator('input[name="email"], input[type="email"]');
    this.passwordInput = page.locator('input[name="password"]:not([name="confirmPassword"])');
    this.loginButton = page.locator('button[type="submit"]:has-text("登录"), button[type="submit"]:has-text("Login"), button[data-testid="login-button"]');
    this.loginErrorMessage = page.locator('[data-testid="login-error"], .error, .alert-error, [role="alert"]');
    
    // Register elements
    this.registerForm = page.locator('form[data-testid="register-form"], form:has(input[name="confirmPassword"])');
    this.registerEmailInput = page.locator('input[name="email"], input[type="email"]');
    this.registerPasswordInput = page.locator('input[name="password"]:not([name="confirmPassword"])');
    this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
    this.registerButton = page.locator('button[type="submit"]:has-text("注册"), button[type="submit"]:has-text("Register"), button[data-testid="register-button"]');
    this.registerErrorMessage = page.locator('[data-testid="register-error"], .error, .alert-error, [role="alert"]');
    
    // Shared elements
    this.authTitle = page.locator('h1, h2, [data-testid="auth-title"]');
    this.switchAuthModeLink = page.locator('a:has-text("注册"), a:has-text("登录"), a:has-text("Sign up"), a:has-text("Log in")');
    this.forgotPasswordLink = page.locator('a:has-text("忘记密码"), a:has-text("Forgot password")');
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/auth/login');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to register page
   */
  async goToRegister() {
    await this.page.goto('/auth/register');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Perform login with credentials
   */
  async login(email: string, password: string) {
    await this.goToLogin();
    
    // Check if form exists
    if (await this.loginForm.count() === 0) {
      throw new Error('Login form not found on page');
    }
    
    // Fill login form
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    
    // Submit form
    await this.loginButton.click();
    
    // Wait for navigation or error
    try {
      await Promise.race([
        this.page.waitForURL(url => !url.pathname.includes('/auth/login'), { timeout: 5000 }),
        this.loginErrorMessage.waitFor({ state: 'visible', timeout: 5000 })
      ]);
    } catch {
      // Continue if neither condition is met within timeout
    }
  }

  /**
   * Perform registration with credentials
   */
  async register(email: string, password: string, confirmPassword?: string) {
    await this.goToRegister();
    
    // Check if form exists
    if (await this.registerForm.count() === 0) {
      throw new Error('Register form not found on page');
    }
    
    // Fill registration form
    await this.registerEmailInput.fill(email);
    await this.registerPasswordInput.fill(password);
    
    // Fill confirm password if field exists
    if (await this.confirmPasswordInput.count() > 0) {
      await this.confirmPasswordInput.fill(confirmPassword || password);
    }
    
    // Submit form
    await this.registerButton.click();
    
    // Wait for navigation or error
    try {
      await Promise.race([
        this.page.waitForURL(url => !url.pathname.includes('/auth/register'), { timeout: 5000 }),
        this.registerErrorMessage.waitFor({ state: 'visible', timeout: 5000 })
      ]);
    } catch {
      // Continue if neither condition is met within timeout
    }
  }

  /**
   * Check if user is logged in (by checking for dashboard redirect or user menu)
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for common indicators of being logged in
      const indicators = [
        this.page.locator('[data-testid="user-menu"]'),
        this.page.locator('button:has-text("退出"), button:has-text("Logout")'),
        this.page.locator('.user-avatar'),
        this.page.locator('[data-testid="dashboard-link"]')
      ];
      
      for (const indicator of indicators) {
        if (await indicator.count() > 0 && await indicator.isVisible()) {
          return true;
        }
      }
      
      // Check if we're on a protected page
      const currentUrl = this.page.url();
      return currentUrl.includes('/dashboard') || currentUrl.includes('/admin') || currentUrl.includes('/profile');
    } catch {
      return false;
    }
  }

  /**
   * Logout user
   */
  async logout() {
    const logoutButton = this.page.locator('button:has-text("退出"), button:has-text("Logout"), [data-testid="logout-button"]');
    
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      // Wait for redirect to login page
      await this.page.waitForURL(url => url.pathname.includes('/auth') || url.pathname === '/', { timeout: 5000 });
    }
  }

  /**
   * Get validation errors
   */
  async getValidationErrors(): Promise<string[]> {
    const errors: string[] = [];
    const errorSelectors = [
      this.loginErrorMessage,
      this.registerErrorMessage,
      this.page.locator('.field-error'),
      this.page.locator('.invalid-feedback'),
      this.page.locator('[aria-describedby*="error"]')
    ];

    for (const selector of errorSelectors) {
      const count = await selector.count();
      for (let i = 0; i < count; i++) {
        const errorText = await selector.nth(i).textContent();
        if (errorText?.trim()) {
          errors.push(errorText.trim());
        }
      }
    }

    return [...new Set(errors)]; // Remove duplicates
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuth(expectSuccess = true) {
    if (expectSuccess) {
      // Wait for successful redirect
      await this.page.waitForURL(url => !url.pathname.includes('/auth'), { timeout: 10000 });
    } else {
      // Wait for error message
      await this.loginErrorMessage.or(this.registerErrorMessage).waitFor({ state: 'visible', timeout: 5000 });
    }
  }

  /**
   * Check if we're on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/auth/login');
  }

  /**
   * Check if we're on register page
   */
  async isOnRegisterPage(): Promise<boolean> {
    return this.page.url().includes('/auth/register');
  }

  /**
   * Switch between login and register modes
   */
  async switchAuthMode() {
    await this.switchAuthModeLink.click();
    await this.page.waitForLoadState('networkidle');
  }
}