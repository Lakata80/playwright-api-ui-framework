import { BaseComponent } from '@framework/ui-core';
import type { Locator } from '@framework/ui-core';

/**
 * A single product card on the /products page.
 * Root: .product-image-wrapper
 */
export class ProductCard extends BaseComponent {
  private readonly nameEl: Locator;
  private readonly priceEl: Locator;

  constructor(root: Locator) {
    super(root);
    this.nameEl = this.locator('.productinfo p');
    this.priceEl = this.locator('.productinfo h2');
  }

  async getName(): Promise<string> {
    return ((await this.nameEl.textContent()) ?? '').trim();
  }

  async getPrice(): Promise<string> {
    return ((await this.priceEl.textContent()) ?? '').trim();
  }

  /** Hover to reveal the overlay, then click "Add to cart". */
  async addToCart(): Promise<void> {
    await this.root.hover();
    await this.root.locator('.add-to-cart').first().click();
  }
}
