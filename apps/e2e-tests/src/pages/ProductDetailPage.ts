import { BasePage } from '@framework/ui-core';
import type { Locator, Page } from '@framework/ui-core';

/**
 * automationexercise.com /product_details/{id}
 */
export class ProductDetailPage extends BasePage {
  private readonly nameEl: Locator;
  private readonly priceEl: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.nameEl = this.locator('.product-information h2');
    this.priceEl = this.locator('.product-information span span');
    this.quantityInput = this.locator('#quantity');
    this.addToCartButton = this.locator('button.cart');
  }

  override async waitForLoad(): Promise<void> {
    await this.nameEl.waitFor({ state: 'visible' });
  }

  async getProductName(): Promise<string> {
    return ((await this.nameEl.textContent()) ?? '').trim();
  }

  async getPrice(): Promise<string> {
    return ((await this.priceEl.textContent()) ?? '').trim();
  }

  async setQuantity(qty: number): Promise<void> {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }
}
