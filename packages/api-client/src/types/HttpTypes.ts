import type { ZodType } from 'zod';
import type { RetryOptions } from './RetryOptions';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** Internal representation of a request, passed through the interceptor chain and retry loop. */
export interface RequestConfig {
  readonly url: string;
  readonly method: HttpMethod;
  readonly headers?: Record<string, string>;
  readonly body?: unknown;
  readonly formData?: FormData;
  readonly queryParams?: Record<string, string | number>;
  readonly timeoutMs?: number;
  readonly retryOverride?: Partial<RetryOptions>;
  /**
   * Zod schema for response validation. Stored as ZodType<unknown> to keep RequestConfig
   * schema-agnostic — the generic parameter T is applied at HttpClient method boundaries.
   */
  readonly schema?: ZodType<unknown>;
}

/** Typed response wrapper returned by all HttpClient methods. */
export interface ApiResponse<T> {
  readonly status: number;
  readonly headers: Record<string, string>;
  /** Validated and typed body. Equals rawBody when no schema is provided. */
  readonly body: T;
  /** Pre-parse snapshot of the response body — useful for contract drift debugging. */
  readonly rawBody: unknown;
  readonly duration: number;
}

export interface HttpClientConfig {
  readonly baseUrl: string;
  readonly defaultHeaders?: Record<string, string>;
  readonly defaultTimeoutMs?: number;
}

/**
 * Options accepted by the public HttpClient methods (get, post, put, patch, delete).
 * T is inferred from the schema when provided; defaults to unknown when omitted.
 */
export interface RequestOptions<T> {
  readonly schema?: ZodType<T>;
  readonly headers?: Record<string, string>;
  readonly queryParams?: Record<string, string | number>;
  readonly timeoutMs?: number;
  readonly retryOverride?: Partial<RetryOptions>;
}
