/**
 * Single test + expect export for all test files in apps/e2e-tests.
 *
 * Import ONLY from here — not from @playwright/test directly:
 *   import { test, expect } from '../../fixtures';
 *
 * Available fixtures:
 *   apiClient         — unauthenticated HttpClient
 *   authenticatedPage — Page loaded with the current worker's session state
 *   userBuilder       — pre-seeded UserBuilder for CreateUserRequest payloads
 *   productBuilder    — ProductBuilder for search request payloads
 *   userFactory       — UserFactory combining builder + generator
 *   testDataCleanup   — LIFO cleanup registry, tears down automatically after each test
 */
export { dataTest as test } from './data.fixture';
export { expect } from '@playwright/test';
