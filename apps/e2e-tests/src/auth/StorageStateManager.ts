import fs from 'fs';
import path from 'path';

/**
 * Manages per-worker Playwright storageState files under playwright/.auth/.
 *
 * The login flow runs at most once per worker per test run — subsequent tests
 * in the same worker reuse the cached state. Call invalidate() on 401 to force
 * re-authentication on the next test.
 */
export class StorageStateManager {
  private static readonly AUTH_DIR = path.join(process.cwd(), 'playwright', '.auth');

  static getStatePath(workerIndex: number): string {
    return path.join(this.AUTH_DIR, `worker-${workerIndex}.json`);
  }

  /**
   * Returns the path to the storageState file for the given worker.
   * If no cached file exists, calls `loginFn(statePath)` which is expected to
   * perform a browser login and write the storageState to `statePath`.
   */
  static async getOrCreate(
    workerIndex: number,
    loginFn: (statePath: string) => Promise<void>,
  ): Promise<string> {
    const statePath = this.getStatePath(workerIndex);

    if (!fs.existsSync(statePath)) {
      fs.mkdirSync(path.dirname(statePath), { recursive: true });
      await loginFn(statePath);
    }

    return statePath;
  }

  /** Removes the cached state file so the next test triggers a fresh login. */
  static invalidate(workerIndex: number): void {
    const statePath = this.getStatePath(workerIndex);
    if (fs.existsSync(statePath)) {
      fs.rmSync(statePath);
    }
  }

  /** Removes all cached state files — useful in CI teardown or before a full re-seed. */
  static invalidateAll(): void {
    if (fs.existsSync(this.AUTH_DIR)) {
      fs.rmSync(this.AUTH_DIR, { recursive: true, force: true });
    }
  }
}
