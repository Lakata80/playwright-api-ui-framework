import { test, expect } from '../../fixtures';
import { isWafBlocked, WAF_SKIP_REASON } from '../../fixtures/waf-check';
import { AuthApiService } from '../../services/api/AuthApiService';
import { UserApiService } from '../../services/api/UserApiService';

test.describe('Auth API', () => {
  test.beforeAll(async () => {
    test.skip(await isWafBlocked(), WAF_SKIP_REASON);
  });
  test('POST /api/verifyLogin with unknown credentials returns responseCode 404 @smoke', async ({
    apiClient,
  }) => {
    const service = new AuthApiService(apiClient);
    const response = await service.verifyLogin({
      email: 'nobody_exists_here@testframe.dev',
      password: 'definitely-wrong-password-xyz',
    });

    // automationexercise.com always returns HTTP 200; the real status is in responseCode
    expect(response.status).toBe(200);
    expect(response.body.responseCode).toBe(404);
  });

  test('POST /api/verifyLogin with valid credentials returns responseCode 200', async ({
    apiClient,
    userFactory,
    testDataCleanup,
  }) => {
    const userService = new UserApiService(apiClient);
    const authService = new AuthApiService(apiClient);
    const userData = userFactory.createPayload();

    const created = await userService.createAccount(userData);
    expect(created.body.responseCode).toBe(201);

    testDataCleanup.register(() =>
      userService.deleteAccount(userData.email, userData.password).then(() => undefined),
    );

    const response = await authService.verifyLogin({
      email: userData.email,
      password: userData.password,
    });

    expect(response.body.responseCode).toBe(200);
    expect(response.body.message).toBe('User exists!');
  });
});
