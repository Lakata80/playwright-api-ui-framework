import { test as base } from '@playwright/test';
import type { BrowserContext, Locator, Page } from '@playwright/test';

export type { BrowserContext, Locator, Page };

/**
 * Collects browser console errors and page-level JavaScript exceptions during a test.
 * Attach to a page in a fixture using monitor.attach(page), then read monitor.getErrors()
 * in assertions or afterEach hooks.
 */
export class ConsoleMonitor {
  private readonly _errors: string[] = [];

  attach(page: Page): void {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this._errors.push(`[console.error] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      this._errors.push(`[pageerror] ${err.message}`);
    });
  }

  getErrors(): readonly string[] {
    return this._errors;
  }

  hasErrors(): boolean {
    return this._errors.length > 0;
  }

  clear(): void {
    this._errors.length = 0;
  }
}

/**
 * Internal fixtures added by ui-core.
 *
 * _consoleMonitor is auto-used so it always runs, but it does NOT depend on `page`.
 * API-only tests pay no browser-launch cost.
 *
 * UI fixtures (e.g. authenticatedPage) call monitor.attach(page) themselves so
 * monitoring activates only when a browser page actually exists.
 */
export interface UiCoreInternalFixtures {
  _consoleMonitor: ConsoleMonitor;
}

/**
 * Foundation Playwright test object.
 *
 * Import and extend this in apps/e2e-tests fixtures — not @playwright/test directly:
 *
 *   import { baseTest } from '@framework/ui-core';
 *   export const test = baseTest.extend<AppFixtures>({ ... });
 *
 * This keeps all fixture composition in one chain and ensures the console monitor
 * runs for every test in the suite without forcing a browser launch for API tests.
 */
export const baseTest = base.extend<UiCoreInternalFixtures>({
  _consoleMonitor: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const monitor = new ConsoleMonitor();
      await use(monitor);
      if (monitor.hasErrors()) {
        console.warn(`\nBrowser console errors during test:\n${monitor.getErrors().join('\n')}`);
      }
    },
    { auto: true },
  ],
});
