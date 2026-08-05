import { authTest } from './auth.fixture';
import type { AuthFixtures } from './auth.fixture';
import type { ApiFixtures } from './api.fixture';
import { UserBuilder } from '../data/builders/UserBuilder';
import { ProductBuilder } from '../data/builders/ProductBuilder';
import { UserFactory } from '../data/factories/UserFactory';
import { TestDataCleanup } from '../data/cleanup/TestDataCleanup';

export interface DataFixtures {
  /** Pre-seeded UserBuilder with randomly generated valid data. Reset via .withEmail() etc. */
  userBuilder: UserBuilder;
  /** Pre-seeded ProductBuilder for search requests. */
  productBuilder: ProductBuilder;
  /** Convenience factory combining UserBuilder + RandomDataGenerator in one call. */
  userFactory: UserFactory;
  /**
   * LIFO cleanup registry. Call testDataCleanup.register(() => ...) immediately after
   * creating any resource. teardown() fires automatically in afterEach.
   */
  testDataCleanup: TestDataCleanup;
}

/**
 * Extends the auth test with data fixtures.
 * All fixtures in this file compose cleanly with apiClient and authenticatedPage.
 */
export const dataTest = authTest.extend<DataFixtures & ApiFixtures & AuthFixtures>({
  // eslint-disable-next-line no-empty-pattern
  userBuilder: async ({}, use) => {
    await use(UserBuilder.defaults());
  },

  // eslint-disable-next-line no-empty-pattern
  productBuilder: async ({}, use) => {
    await use(ProductBuilder.searching('top'));
  },

  // eslint-disable-next-line no-empty-pattern
  userFactory: async ({}, use) => {
    await use(new UserFactory());
  },

  // eslint-disable-next-line no-empty-pattern
  testDataCleanup: async ({}, use) => {
    const cleanup = new TestDataCleanup();
    await use(cleanup);
    await cleanup.teardown();
  },
});
