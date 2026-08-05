import { BasePage } from '@framework/ui-core';
import type { Locator, Page } from '@framework/ui-core';
import { ProductCard } from '../components/ProductCard';

/**
 * automationexercise.com /products
 */
export class ProductListPage extends BasePage {
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;
  private readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.locator('#search_product');
    this.searchButton = this.locator('#submit_search');
    this.productCards = this.locator('.product-image-wrapper');
  }

  override async waitForLoad(): Promise<void> {
    await this.productCards.first().waitFor({ state: 'visible' });
  }

  async searchFor(term: string): Promise<void> {
    await this.searchInput.fill(term);
    await this.searchButton.click();
    await this.productCards.first().waitFor({ state: 'visible' });
  }

  async getProductCount(): Promise<number> {
    return this.productCards.count();
  }

  async getProductNames(): Promise<string[]> {
    const count = await this.productCards.count();
    const names: string[] = [];
    for (let i = 0; i < count; i++) {
      const card = new ProductCard(this.productCards.nth(i));
      names.push(await card.getName());
    }
    return names;
  }

  getCard(index: number): ProductCard {
    return new ProductCard(this.productCards.nth(index));
  }
}
