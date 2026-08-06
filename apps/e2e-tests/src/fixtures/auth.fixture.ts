import type { Page } from '@framework/ui-core';
import type { UiCoreInternalFixtures } from '@framework/ui-core';
import { apiTest } from './api.fixture';
import { StorageStateManager } from '../auth/StorageStateManager';
import { EnvironmentConfig } from '../config/EnvironmentConfig';

export interface AuthFixtures {
  /**
   * A Playwright Page with browser session state loaded from the pre-seeded worker
   * account. Use this fixture (not the default `page`) for tests that require a
   * logged-in user.
   */
  authenticatedPage: Page;
}

interface AuthWorkerFixtures {
  /** Worker-scoped: storageState path resolved once per worker, reused across tests. */
  _storageStatePath: string;
}

/**
 * Extends the API test with auth fixtures.
 *
 * Login flow (runs at most once per Playwright worker per test run):
 *   1. Check for a cached playwright/.auth/worker-N.json
 *   2. If missing: navigate to /login, fill form, save context storageState to disk
 *   3. Create a new browser context loaded with that storageState for the test
 */
export const authTest = apiTest.extend<AuthFixtures & UiCoreInternalFixtures, AuthWorkerFixtures>({
  _storageStatePath: [
    async ({ browser }, use, workerInfo) => {
      // parallelIndex is bounded by the workers setting (0..workers-1) and is safe to use
      // as a slot index. workerIndex is a monotonically increasing counter that can exceed
      // the workers limit when Playwright restarts worker processes between tests.
      const credentials = EnvironmentConfig.getWorkerCredentials(workerInfo.parallelIndex);

      const statePath = await StorageStateManager.getOrCreate(
        workerInfo.parallelIndex,
        async (savePath) => {
          const ctx = await browser.newContext();
          const p = await ctx.newPage();

          // Use 'load' (not 'domcontentloaded') so that Cloudflare's JS challenge
          // has time to execute and redirect to the real login page before we
          // start waiting for form elements. On GitHub Actions, 'domcontentloaded'
          // resolves on the challenge page itself, leaving the email input invisible.
          await p.goto(`${EnvironmentConfig.uiBaseUrl}/login`, {
            waitUntil: 'load',
          });
          // Explicit wait gives the form time to render without being tied to
          // the default action timeout (which inherits the test timeout).
          await p.locator('input[data-qa="login-email"]').waitFor({ state: 'visible' });
          await p.locator('input[data-qa="login-email"]').fill(credentials.email);
          await p.locator('input[data-qa="login-password"]').fill(credentials.password);
          await p.locator('button[data-qa="login-button"]').click();
          await p.waitForURL(`${EnvironmentConfig.uiBaseUrl}/`);

          await ctx.storageState({ path: savePath });
          await ctx.close();
        },
      );

      await use(statePath);
    },
    { scope: 'worker' },
  ],

  authenticatedPage: async ({ browser, _storageStatePath, _consoleMonitor }, use) => {
    // Pass baseURL so page objects can call page.goto('/path') with relative URLs.
    // The project-level use.baseURL only applies to Playwright's default context,
    // not to contexts created manually via browser.newContext().
    const context = await browser.newContext({
      storageState: _storageStatePath,
      baseURL: EnvironmentConfig.uiBaseUrl,
    });
    const page = await context.newPage();

    // Activate console error monitoring now that a browser page exists
    _consoleMonitor.attach(page);

    await use(page);
    await context.close();
  },
});
