import type { RetryOptions } from '../types/RetryOptions';

const DEFAULTS: RetryOptions = {
  maxAttempts: 3,
  backoffBaseMs: 1_000,
  backoffMultiplier: 2,
  retryableStatusCodes: [429, 500, 502, 503, 504],
  retryOnNetworkError: true,
};

/**
 * Immutable value object encapsulating retry behaviour.
 * Constructed with optional overrides on top of sensible defaults.
 */
export class RetryPolicy {
  static readonly DEFAULTS: RetryOptions = DEFAULTS;

  private readonly options: RetryOptions;

  constructor(overrides?: Partial<RetryOptions>) {
    this.options = { ...DEFAULTS, ...overrides };
  }

  get maxAttempts(): number {
    return this.options.maxAttempts;
  }

  isRetryableStatus(status: number): boolean {
    return this.options.retryableStatusCodes.includes(status);
  }

  /** Only TypeError (network-level failure) is retried — not application errors. */
  isRetryableError(error: unknown): boolean {
    return this.options.retryOnNetworkError && error instanceof TypeError;
  }

  /**
   * Exponential backoff: attempt 1 → backoffBaseMs, attempt 2 → base × multiplier, etc.
   * Attempt index is 1-based.
   */
  getDelayMs(attempt: number): number {
    return this.options.backoffBaseMs * Math.pow(this.options.backoffMultiplier, attempt - 1);
  }

  /**
   * Returns the delay for a 429 response, honoring the Retry-After header (seconds)
   * when present and parseable; falls back to exponential backoff otherwise.
   */
  getDelayMsFor429(retryAfterHeader: string | undefined, attempt: number): number {
    if (retryAfterHeader !== undefined) {
      const seconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(seconds) && seconds > 0) return seconds * 1_000;
    }
    return this.getDelayMs(attempt);
  }
}
