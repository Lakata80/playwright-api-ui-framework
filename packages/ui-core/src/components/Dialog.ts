import type { Locator } from '@playwright/test';
import { BaseComponent } from './BaseComponent';

export interface DialogLocators {
  readonly title: string;
  readonly confirmButton: string;
  readonly cancelButton: string;
  readonly errorMessage: string;
}

const DEFAULT_LOCATORS: DialogLocators = {
  title: 'h1, h2, h3, h4',
  confirmButton: 'button[type="submit"], .btn-primary',
  cancelButton:
    '[data-dismiss="modal"], button:has-text("Cancel"), button:has-text("Close"), .close',
  errorMessage: '.alert-danger, .error-message, [role="alert"]',
};

/**
 * Generic modal/dialog component scoped to its root container Locator.
 *
 * Usage:
 *   const modal = new Dialog(page.locator('.modal'));
 *   await modal.waitForVisible();
 *   await modal.confirm();
 *
 * For app-specific selectors, pass a Partial<DialogLocators> override or subclass.
 */
export class Dialog extends BaseComponent {
  private readonly dialogLocators: DialogLocators;

  constructor(root: Locator, locators?: Partial<DialogLocators>) {
    super(root);
    this.dialogLocators = { ...DEFAULT_LOCATORS, ...locators };
  }

  async getTitle(): Promise<string> {
    const text = await this.root.locator(this.dialogLocators.title).first().textContent();
    return (text ?? '').trim();
  }

  async confirm(): Promise<void> {
    await this.root.locator(this.dialogLocators.confirmButton).click();
  }

  async cancel(): Promise<void> {
    await this.root.locator(this.dialogLocators.cancelButton).click();
  }

  async getErrorText(): Promise<string> {
    const errorEl = this.root.locator(this.dialogLocators.errorMessage);
    const text = await errorEl.first().textContent();
    return (text ?? '').trim();
  }

  async hasError(): Promise<boolean> {
    return this.root.locator(this.dialogLocators.errorMessage).isVisible();
  }
}
