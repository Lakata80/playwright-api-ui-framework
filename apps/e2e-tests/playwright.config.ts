import { defineConfig, type ReporterDescription } from '@playwright/test';
import { EnvironmentConfig } from './src/config/EnvironmentConfig';

const reporters: ReporterDescription[] = [
  ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ['github'],
];

if (EnvironmentConfig.allureResultsDir) {
  reporters.push(['allure-playwright', { resultsDir: EnvironmentConfig.allureResultsDir }]);
}

export default defineConfig({
  testDir: './src/tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  ...(process.env['CI'] ? { workers: EnvironmentConfig.maxWorkers } : {}),
  reporter: reporters,

  use: {
    baseURL: EnvironmentConfig.uiBaseUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'smoke',
      grep: /@smoke/,
      // Scope to UI and hybrid tests only. @smoke-tagged API tests are already run by
      // the dedicated api-tests CI job. Including them here too causes double-execution
      // on the same runner IPs, which saturates Imunify360 and blocks both jobs.
      testMatch: ['**/tests/ui/**/*.spec.ts', '**/tests/hybrid/**/*.spec.ts'],
      // 2 retries in CI: Cloudflare on automationexercise.com occasionally challenges
      // requests from datacenter IPs; a second retry gives the challenge time to resolve.
      retries: process.env['CI'] ? 2 : 0,
      // 60 s in CI — auth fixture must navigate through a Cloudflare JS challenge before
      // the real login page renders, which can take several seconds.
      timeout: process.env['CI'] ? 60_000 : 30_000,
      use: {
        headless: true,
        launchOptions: {
          // Remove navigator.webdriver so Cloudflare's JS challenge does not
          // immediately identify the browser as automated and serve a CAPTCHA.
          args: ['--disable-blink-features=AutomationControlled'],
        },
      },
    },
    {
      name: 'regression',
      // Scope to UI and hybrid tests only. API tests are fully covered by the dedicated
      // api-tests CI job, which runs first. Running them again here would duplicate API
      // calls late in the pipeline and trigger rate-limiting on the reference site.
      testMatch: ['**/tests/ui/**/*.spec.ts', '**/tests/hybrid/**/*.spec.ts'],
      grepInvert: /@smoke|@flaky/,
      retries: process.env['CI'] ? 2 : 0,
      // 60 s in CI — auth fixture setup navigates a real browser to the login page;
      // ad-heavy pages on GitHub Actions runners can take longer than 30 s to paint.
      timeout: process.env['CI'] ? 60_000 : 30_000,
      use: { headless: true },
    },
    {
      name: 'api',
      testDir: './src/tests/api',
      retries: process.env['CI'] ? 1 : 0,
    },
    {
      name: 'contract',
      testDir: './src/tests/contract',
      grep: /@contract/,
      // 2 retries in CI: Imunify360 on automationexercise.com occasionally blocks
      // datacenter IPs on the first attempt; retries give the WAF time to settle.
      retries: process.env['CI'] ? 2 : 0,
    },
    {
      name: 'reference-app',
      testDir: './src/tests/reference-app',
      grep: /@reference-app/,
      retries: 2,
      use: { headless: true },
    },
    {
      name: 'flaky-quarantine',
      grep: /@flaky/,
      retries: 3,
      // Intentionally not in required CI checks — see .github/CODEOWNERS for triage ownership
      use: { headless: true },
    },
  ],
});
