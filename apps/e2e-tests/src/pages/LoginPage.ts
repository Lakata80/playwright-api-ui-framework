import { BasePage } from '@framework/ui-core';
import type { Locator, Page } from '@framework/ui-core';

/**
 * automationexercise.com /login
 * Contains both a login form and a signup form on the same page.
 * This class covers only the login-side interactions.
 */
export class LoginPage extends BasePage {
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.locator('input[data-qa="login-email"]');
    this.passwordInput = this.locator('input[data-qa="login-password"]');
    this.loginButton = this.locator('button[data-qa="login-button"]');
    this.errorMessage = this.locator('.login-form p');
  }

  override async waitForLoad(): Promise<void> {
    await this.emailInput.waitFor({ state: 'visible' });
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorText(): Promise<string> {
    return ((await this.errorMessage.textContent()) ?? '').trim();
  }

  async isErrorVisible(): Promise<boolean> {
    return this.errorMessage.isVisible();
  }
}
