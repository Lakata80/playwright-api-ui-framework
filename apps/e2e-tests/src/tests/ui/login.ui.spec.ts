import { test, expect } from '../../fixtures';
import { LoginPage } from '../../pages/LoginPage';
import { EnvironmentConfig } from '../../config/EnvironmentConfig';

test.describe('Login UI', () => {
  test('wrong credentials show an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login('nobody@testframe.dev', 'wrong-password');

    expect(await loginPage.isErrorVisible()).toBe(true);
    expect(await loginPage.getErrorText()).toContain('incorrect');
  });

  test('valid credentials redirect to home and show Logout link @smoke', async ({
    page,
  }, testInfo) => {
    const credentials = EnvironmentConfig.getWorkerCredentials(testInfo.parallelIndex);
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login(credentials.email, credentials.password);

    await expect(page.locator('a[href="/logout"]')).toBeVisible();
  });

  test('logout after login lands on login page', async ({ page }, testInfo) => {
    const credentials = EnvironmentConfig.getWorkerCredentials(testInfo.parallelIndex);
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login(credentials.email, credentials.password);
    await page.waitForURL(`${EnvironmentConfig.uiBaseUrl}/`);

    await page.click('a[href="/logout"]');
    await page.waitForURL(`${EnvironmentConfig.uiBaseUrl}/login`);

    await expect(page.locator('button[data-qa="login-button"]')).toBeVisible();
  });
});
