import type { RequestConfig } from '../types/HttpTypes';

/**
 * Strategy interface for request authentication.
 * Implement this interface to add a new auth mechanism (Bearer, OIDC, session cookie)
 * without changing HttpClient or any test code.
 */
export interface AuthStrategy {
  /**
   * Injects authentication credentials into the request config.
   * Must return a new config object — never mutate the original.
   */
  authenticate(config: RequestConfig): Promise<RequestConfig>;

  /** Clears any cached credentials, forcing re-acquisition on the next request. */
  invalidate(): void;
}
