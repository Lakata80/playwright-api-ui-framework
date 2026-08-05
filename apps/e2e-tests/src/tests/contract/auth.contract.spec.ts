/**
 * Contract tests for the auth endpoint.
 * Both success (200) and failure (404) responses must match VerifyLoginResponseSchema.
 */
import { test, expect } from '../../fixtures';
import { VerifyLoginResponseSchema } from '@framework/contracts';
import { UserApiService } from '../../services/api/UserApiService';

test.describe('Auth schema contracts @contract', () => {
  test('POST /api/verifyLogin 404 body matches VerifyLoginResponseSchema', async ({
    apiClient,
  }) => {
    const fd = new FormData();
    fd.append('email', 'contract_test_user@testframe.dev');
    fd.append('password', 'wrong');

    const response = await apiClient.postMultipart('/api/verifyLogin', fd, {
      schema: VerifyLoginResponseSchema,
    });

    expect(typeof response.body.responseCode).toBe('number');
    expect(typeof response.body.message).toBe('string');
  });

  test('POST /api/verifyLogin 200 body matches VerifyLoginResponseSchema', async ({
    apiClient,
    userFactory,
    testDataCleanup,
  }) => {
    const userService = new UserApiService(apiClient);
    const userData = userFactory.createPayload();
    await userService.createAccount(userData);

    testDataCleanup.register(() =>
      userService.deleteAccount(userData.email, userData.password).then(() => undefined),
    );

    const fd = new FormData();
    fd.append('email', userData.email);
    fd.append('password', userData.password);

    const response = await apiClient.postMultipart('/api/verifyLogin', fd, {
      schema: VerifyLoginResponseSchema,
    });

    expect(response.body.responseCode).toBe(200);
    expect(typeof response.body.message).toBe('string');
  });
});
