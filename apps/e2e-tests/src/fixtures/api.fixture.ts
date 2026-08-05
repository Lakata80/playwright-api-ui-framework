import { baseTest } from '@framework/ui-core';
import { HttpClient, Logger } from '@framework/api-client';
import { EnvironmentConfig } from '../config/EnvironmentConfig';

export interface ApiFixtures {
  /** Unauthenticated HttpClient wired to the configured API base URL. */
  apiClient: HttpClient;
}

/**
 * Base test object extended with an API client fixture.
 * Extends baseTest so the console monitor auto-fixture remains in the chain.
 *
 * No auth strategy is applied — API endpoints that need credentials accept them
 * in the request body (automationexercise.com pattern). For clients with bearer
 * token auth, call apiClient.auth.useStrategy(new BearerTokenStrategy(...)) in
 * the auth.fixture.ts after creating the client.
 */
export const apiTest = baseTest.extend<ApiFixtures>({
  // eslint-disable-next-line no-empty-pattern
  apiClient: async ({}, use) => {
    const client = new HttpClient(
      { baseUrl: EnvironmentConfig.apiBaseUrl },
      new Logger(EnvironmentConfig.logLevel, 'api-client'),
    );
    await use(client);
  },
});
