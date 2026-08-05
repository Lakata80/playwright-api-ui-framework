type CleanupFn = () => Promise<void>;

/**
 * LIFO registry of cleanup functions for resources created during a test.
 *
 * Register a cleanup function immediately after creating each resource.
 * The data.fixture.ts calls teardown() in afterEach so created accounts, etc.
 * are deleted even when a test fails mid-way.
 *
 * Usage:
 *   testDataCleanup.register(async () => {
 *     const fd = toFormData({ email, password });
 *     await apiClient.deleteMultipart('/api/deleteAccount', fd, { schema: DeleteAccountResponseSchema });
 *   });
 */
export class TestDataCleanup {
  private readonly fns: CleanupFn[] = [];

  register(fn: CleanupFn): void {
    this.fns.push(fn);
  }

  /** Runs all registered functions in reverse-registration order (LIFO). */
  async teardown(): Promise<void> {
    for (const fn of [...this.fns].reverse()) {
      try {
        await fn();
      } catch (err) {
        // Log but don't throw — teardown continues even when one resource fails
        console.warn(`[TestDataCleanup] cleanup failed: ${String(err)}`);
      }
    }
    this.fns.length = 0;
  }
}
