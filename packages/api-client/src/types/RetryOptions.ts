export interface RetryOptions {
  readonly maxAttempts: number;
  readonly backoffBaseMs: number;
  readonly backoffMultiplier: number;
  readonly retryableStatusCodes: readonly number[];
  readonly retryOnNetworkError: boolean;
}
