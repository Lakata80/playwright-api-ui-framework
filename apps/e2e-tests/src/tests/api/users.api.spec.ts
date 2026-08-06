import { test, expect } from '../../fixtures';
import { isWafBlocked, WAF_SKIP_REASON } from '../../fixtures/waf-check';
import { UserApiService } from '../../services/api/UserApiService';

test.describe('Users API', () => {
  test.beforeAll(async () => {
    test.skip(await isWafBlocked(), WAF_SKIP_REASON);
  });
  test('create → get → delete user lifecycle @smoke', async ({
    apiClient,
    userFactory,
    testDataCleanup,
  }) => {
    const service = new UserApiService(apiClient);
    const userData = userFactory.createPayload();

    // Create
    const createResponse = await service.createAccount(userData);
    expect(createResponse.body.responseCode).toBe(201);

    testDataCleanup.register(() =>
      service.deleteAccount(userData.email, userData.password).then(() => undefined),
    );

    // Get — response uses birth_day / first_name / last_name (different from request fields)
    const getResponse = await service.getUserByEmail(userData.email);
    expect(getResponse.body.responseCode).toBe(200);
    expect(getResponse.body.user).toBeDefined();
    expect(getResponse.body.user?.email).toBe(userData.email);
    expect(getResponse.body.user?.name).toBe(userData.name);
  });

  test('creating a duplicate account returns responseCode 400', async ({
    apiClient,
    userFactory,
    testDataCleanup,
  }) => {
    const service = new UserApiService(apiClient);
    const userData = userFactory.createPayload();

    const first = await service.createAccount(userData);
    expect(first.body.responseCode).toBe(201);

    testDataCleanup.register(() =>
      service.deleteAccount(userData.email, userData.password).then(() => undefined),
    );

    const duplicate = await service.createAccount(userData);
    expect(duplicate.body.responseCode).toBe(400);
  });

  test('GET /api/getUserDetailByEmail for unknown email returns responseCode 404', async ({
    apiClient,
  }) => {
    const service = new UserApiService(apiClient);
    const response = await service.getUserByEmail('nobody_at_all@testframe.dev');

    expect(response.body.responseCode).toBe(404);
  });
});
