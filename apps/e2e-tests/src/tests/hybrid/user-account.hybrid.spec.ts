/**
 * Hybrid test: API creates + verifies a user, UI validates the login flow for that user.
 *
 * Pattern:
 *   [API]  Create account  →  verify account exists in backend
 *   [UI]   Log in as that user  →  confirm session active
 *   [API]  Cleanup via testDataCleanup (delete account after test)
 */
import { test, expect } from '../../fixtures';
import { UserApiService } from '../../services/api/UserApiService';
import { LoginPage } from '../../pages/LoginPage';
import { EnvironmentConfig } from '../../config/EnvironmentConfig';

test.describe('User account lifecycle (hybrid)', () => {
  test('API create → API verify → UI login → UI logout', async ({
    page,
    apiClient,
    userFactory,
    testDataCleanup,
  }) => {
    const userService = new UserApiService(apiClient);
    const userData = userFactory.createPayload();

    // Step 1 — API: create account
    const createResponse = await userService.createAccount(userData);
    expect(createResponse.body.responseCode).toBe(201);

    testDataCleanup.register(() =>
      userService.deleteAccount(userData.email, userData.password).then(() => undefined),
    );

    // Step 2 — API: verify the account exists in the backend
    const getResponse = await userService.getUserByEmail(userData.email);
    expect(getResponse.body.responseCode).toBe(200);
    expect(getResponse.body.user.email).toBe(userData.email);
    expect(getResponse.body.user.name).toBe(userData.name);

    // Step 3 — UI: confirm the freshly-created account can log in via browser
    const loginPage = new LoginPage(page);
    await loginPage.navigate('/login');
    await loginPage.login(userData.email, userData.password);

    await expect(page.locator('a[href="/logout"]')).toBeVisible();

    // Step 4 — UI: logout to leave the browser in a clean state
    await page.click('a[href="/logout"]');
    await page.waitForURL(`${EnvironmentConfig.uiBaseUrl}/login`);
  });

  test('API + UI: product visible in UI matches API data', async ({
    authenticatedPage,
    apiClient,
  }) => {
    // Step 1 — API: fetch first product from the product list
    const apiResponse = await apiClient.get('/api/productsList');
    const firstProduct = (apiResponse.body as { products: Array<{ id: number; name: string }> })
      .products[0];
    expect(firstProduct).toBeDefined();

    // Step 2 — UI: navigate to that product's detail page
    await authenticatedPage.goto(`/product_details/${firstProduct?.id ?? 1}`);
    await authenticatedPage.waitForLoadState('domcontentloaded');

    // Step 3 — UI: verify the name on the page matches the API data
    const uiName = await authenticatedPage.locator('.product-information h2').textContent();
    expect((uiName ?? '').trim()).toBe(firstProduct?.name ?? '');
  });
});
