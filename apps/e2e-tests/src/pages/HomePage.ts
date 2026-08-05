import { BasePage } from '@framework/ui-core';
import type { Page } from '@framework/ui-core';

/**
 * automationexercise.com / (home)
 */
export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  override async waitForLoad(): Promise<void> {
    await this.locator('.features_items, .recommended_items').first().waitFor({ state: 'visible' });
  }

  async isLoggedIn(): Promise<boolean> {
    return this.locator('a[href="/logout"]').isVisible();
  }

  async getLoggedInUsername(): Promise<string> {
    const el = this.locator('li a b');
    if (await el.isVisible()) {
      return ((await el.textContent()) ?? '').trim();
    }
    return '';
  }

  async logout(): Promise<void> {
    await this.page.click('a[href="/logout"]');
    await this.page.waitForURL('**/login');
  }
}
