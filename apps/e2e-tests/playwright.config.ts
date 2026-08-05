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
      retries: 0,
      use: { headless: true },
    },
    {
      name: 'regression',
      grepInvert: /@smoke|@flaky|@contract|@reference-app/,
      retries: process.env['CI'] ? 2 : 0,
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
      retries: process.env['CI'] ? 1 : 0,
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
