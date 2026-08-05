import type { AuthStrategy } from './AuthStrategy';
import type { RequestConfig } from '../types/HttpTypes';

/**
 * Holds the active AuthStrategy and delegates authentication to it.
 * Swap the strategy at runtime without changing HttpClient or any test.
 */
export class AuthManager {
  private strategy: AuthStrategy | null = null;

  useStrategy(strategy: AuthStrategy): void {
    this.strategy = strategy;
  }

  clearStrategy(): void {
    this.strategy = null;
  }

  async authenticate(config: RequestConfig): Promise<RequestConfig> {
    if (!this.strategy) return config;
    return this.strategy.authenticate(config);
  }

  invalidate(): void {
    this.strategy?.invalidate();
  }
}
