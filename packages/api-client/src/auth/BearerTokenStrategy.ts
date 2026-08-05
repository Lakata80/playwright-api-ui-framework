import type { AuthStrategy } from './AuthStrategy';
import type { RequestConfig } from '../types/HttpTypes';

export interface BearerTokenStrategyConfig {
  readonly loginUrl: string;
  readonly credentials: { readonly email: string; readonly password: string };
  /** Extracts the bearer token string from the parsed login response body. */
  readonly tokenExtractor: (responseBody: unknown) => string;
}

/**
 * Acquires a bearer token via an API login endpoint and caches it for the worker lifetime.
 * Uses native fetch — no browser context required.
 *
 * On 401: call invalidate() to clear the cache, then re-attempt the original request.
 * The HttpClient retry loop handles the re-attempt automatically after invalidation.
 */
export class BearerTokenStrategy implements AuthStrategy {
  private cachedToken: string | null = null;

  constructor(private readonly config: BearerTokenStrategyConfig) {}

  async authenticate(requestConfig: RequestConfig): Promise<RequestConfig> {
    if (!this.cachedToken) {
      this.cachedToken = await this.acquireToken();
    }
    return {
      ...requestConfig,
      headers: {
        ...requestConfig.headers,
        Authorization: `Bearer ${this.cachedToken}`,
      },
    };
  }

  invalidate(): void {
    this.cachedToken = null;
  }

  private async acquireToken(): Promise<string> {
    const response = await fetch(this.config.loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.config.credentials),
    });

    if (!response.ok) {
      throw new Error(
        `BearerTokenStrategy: login failed — ${response.status} ${response.statusText} at ${this.config.loginUrl}`,
      );
    }

    const body: unknown = await response.json();
    return this.config.tokenExtractor(body);
  }
}
