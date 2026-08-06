import { BaseComponent } from '@framework/ui-core';
import type { Locator } from '@framework/ui-core';

/**
 * The Bootstrap modal that appears after clicking "Add to cart" on either the
 * product list page (hover overlay) or the product detail page.
 *
 * Root: #cartModal
 * Provides two exit paths: navigate to /view_cart or dismiss and keep browsing.
 */
export class AddToCartModal extends BaseComponent {
  private readonly viewCartLink: Locator;
  private readonly continueButton: Locator;

  constructor(root: Locator) {
    super(root);
    this.viewCartLink = this.locator('a[href="/view_cart"]');
    this.continueButton = this.locator('button[data-dismiss="modal"]');
  }

  async viewCart(): Promise<void> {
    await this.viewCartLink.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueButton.click();
    await this.root.waitFor({ state: 'hidden' });
  }
}
