import { BasePage } from '@framework/ui-core';
import type { Locator, Page } from '@framework/ui-core';

/**
 * automationexercise.com /view_cart
 */
export class CartPage extends BasePage {
  private readonly cartTable: Locator;
  private readonly cartRows: Locator;
  private readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartTable = this.locator('#cart_info_table');
    this.cartRows = this.locator('#cart_info_table tbody tr');
    this.proceedButton = this.locator('.btn.btn-default.check_out');
  }

  override async waitForLoad(): Promise<void> {
    await this.cartTable.waitFor({ state: 'visible' });
  }

  async getItemCount(): Promise<number> {
    return this.cartRows.count();
  }

  async getItemName(rowIndex: number): Promise<string> {
    const text = await this.cartRows
      .nth(rowIndex)
      .locator('td.cart_description h4 a')
      .textContent();
    return (text ?? '').trim();
  }

  async getItemQuantity(rowIndex: number): Promise<number> {
    const text = await this.cartRows.nth(rowIndex).locator('td.cart_quantity button').textContent();
    return parseInt((text ?? '0').trim(), 10);
  }

  async removeItem(rowIndex: number): Promise<void> {
    await this.cartRows.nth(rowIndex).locator('td.cart_delete a').click();
  }

  async proceedToCheckout(): Promise<void> {
    await this.proceedButton.click();
  }
}
