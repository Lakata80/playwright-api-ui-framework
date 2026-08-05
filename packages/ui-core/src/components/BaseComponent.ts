import type { Locator } from '@playwright/test';

/**
 * Abstract foundation for all component objects.
 *
 * Components are scoped to a root Locator — every interaction happens within
 * that DOM subtree. This prevents locator leakage across component boundaries
 * in pages that repeat the same component (e.g. product cards in a grid).
 */
export abstract class BaseComponent {
  constructor(protected readonly root: Locator) {}

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async waitForVisible(timeoutMs?: number): Promise<void> {
    await this.root.waitFor({
      state: 'visible',
      ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
    });
  }

  async waitForHidden(timeoutMs?: number): Promise<void> {
    await this.root.waitFor({
      state: 'hidden',
      ...(timeoutMs !== undefined ? { timeout: timeoutMs } : {}),
    });
  }

  // ── Protected helpers ────────────────────────────────────────────────────

  protected locator(selector: string): Locator {
    return this.root.locator(selector);
  }

  protected getByRole(...args: Parameters<Locator['getByRole']>): Locator {
    return this.root.getByRole(...args);
  }

  protected getByLabel(text: string | RegExp): Locator {
    return this.root.getByLabel(text);
  }

  protected getByText(text: string | RegExp): Locator {
    return this.root.getByText(text);
  }

  protected getByTestId(testId: string | RegExp): Locator {
    return this.root.getByTestId(testId);
  }
}
