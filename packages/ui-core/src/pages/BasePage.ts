import type { Locator, Page } from '@playwright/test';

/**
 * Abstract foundation for all page objects.
 *
 * Design contract:
 * - Subclasses declare page-specific locators as readonly Locator properties in their constructor.
 * - Methods express business intent, not locator chains.
 * - Assertions live in tests or UI services — never in page object methods.
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.waitForLoad();
  }

  /**
   * Override in subclasses to wait for app-specific ready signals
   * (e.g. a loading spinner disappearing, a key element becoming visible).
   */
  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async reload(): Promise<void> {
    await this.page.reload();
    await this.waitForLoad();
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  get currentUrl(): string {
    return this.page.url();
  }

  /**
   * Captures a screenshot and optionally saves it to disk.
   *
   * Visual regression hook (v1 placeholder):
   * Replace with `expect(this.page).toHaveScreenshot(label)` in a dedicated
   * visualRegression.fixture.ts when adding baseline comparison support.
   */
  async takeScreenshot(label?: string): Promise<Buffer> {
    const opts = label ? { path: `test-results/screenshots/${label}-${Date.now()}.png` } : {};
    return this.page.screenshot(opts);
  }

  /**
   * Accessibility check hook (v1 no-op).
   * Plug axe-core here: import { checkA11y } from 'axe-playwright' and run against this.page.
   * Violations at or above the given severity levels should throw an assertion error.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async assertAccessible(_severity: string[] = ['critical', 'serious']): Promise<void> {
    // axe-core integration goes here — not implemented in v1
  }

  // ── Protected helpers ────────────────────────────────────────────────────

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected getByRole(...args: Parameters<Page['getByRole']>): Locator {
    return this.page.getByRole(...args);
  }

  protected getByLabel(text: string | RegExp): Locator {
    return this.page.getByLabel(text);
  }

  protected getByPlaceholder(text: string | RegExp): Locator {
    return this.page.getByPlaceholder(text);
  }

  protected getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  protected getByTestId(testId: string | RegExp): Locator {
    return this.page.getByTestId(testId);
  }
}
