import type { ZodType } from 'zod';
import type { Interceptor } from '../interceptors/Interceptor';
import type {
  ApiResponse,
  HttpClientConfig,
  HttpMethod,
  RequestConfig,
  RequestOptions,
} from '../types/HttpTypes';
import { AuthManager } from '../auth/AuthManager';
import { RetryPolicy } from './RetryPolicy';
import { LoggingInterceptor } from '../interceptors/LoggingInterceptor';
import { ValidationInterceptor } from '../interceptors/ValidationInterceptor';
import { Logger } from '../logger/Logger';

/** Extends RequestOptions with internal-only transport fields (body, formData). */
type InternalOptions<T> = RequestOptions<T> & {
  readonly body?: unknown;
  readonly formData?: FormData;
};

/**
 * Schema-agnostic HTTP client.
 *
 * Accepts a Zod schema as a generic type parameter at the call site — it never
 * imports from @framework/contracts. This keeps the package structurally portable
 * across client engagements and ready to be published independently.
 *
 * Request lifecycle:
 *   auth injection → request interceptors → fetch → retry → response interceptors
 *   → schema validation → typed ApiResponse<T>
 */
export class HttpClient {
  private readonly authManager: AuthManager;
  private readonly interceptors: Interceptor[];
  private readonly logger: Logger;
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;
  private readonly defaultTimeoutMs: number;

  constructor(config: HttpClientConfig, logger?: Logger) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? 30_000;
    this.logger = logger ?? new Logger();
    this.authManager = new AuthManager();
    this.interceptors = [new LoggingInterceptor(this.logger), new ValidationInterceptor()];
  }

  /** Provides access to the AuthManager for strategy configuration and invalidation. */
  get auth(): AuthManager {
    return this.authManager;
  }

  /** Appends a custom interceptor to the end of the interceptor chain. */
  addInterceptor(interceptor: Interceptor): void {
    this.interceptors.push(interceptor);
  }

  async get<T = unknown>(path: string, options?: RequestOptions<T>): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, options);
  }

  async post<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...options, body });
  }

  async put<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { ...options, body });
  }

  async patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  async delete<T = unknown>(path: string, options?: RequestOptions<T>): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, options);
  }

  /**
   * Sends a multipart/form-data PUT. Required for APIs that use PUT with form encoding
   * rather than JSON (e.g. automationexercise.com /api/updateAccount).
   * Do not set Content-Type manually — fetch sets the boundary string automatically.
   */
  async putMultipart<T = unknown>(
    path: string,
    formData: FormData,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, { ...options, formData });
  }

  /**
   * Sends a multipart/form-data DELETE. Required for APIs that accept credentials
   * or identifiers in the DELETE body (e.g. automationexercise.com /api/deleteAccount).
   * Do not set Content-Type manually — fetch sets the boundary string automatically.
   */
  async deleteMultipart<T = unknown>(
    path: string,
    formData: FormData,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, { ...options, formData });
  }

  /**
   * Sends a multipart/form-data POST. Do not set Content-Type manually —
   * fetch sets it automatically with the correct boundary string.
   */
  async postMultipart<T = unknown>(
    path: string,
    formData: FormData,
    options?: RequestOptions<T>,
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, { ...options, formData });
  }

  private async request<T>(
    method: HttpMethod,
    path: string,
    options?: InternalOptions<T>,
  ): Promise<ApiResponse<T>> {
    const config: RequestConfig = {
      url: this.resolveUrl(path),
      method,
      headers: { ...this.defaultHeaders, ...options?.headers },
      timeoutMs: options?.timeoutMs ?? this.defaultTimeoutMs,
      ...(options?.body !== undefined ? { body: options.body } : {}),
      ...(options?.formData ? { formData: options.formData } : {}),
      ...(options?.queryParams ? { queryParams: options.queryParams } : {}),
      ...(options?.retryOverride ? { retryOverride: options.retryOverride } : {}),
      ...(options?.schema ? { schema: options.schema as ZodType<unknown> } : {}),
    };

    const authenticated = await this.authManager.authenticate(config);
    const afterRequest = await this.runRequestInterceptors(authenticated);
    const rawResponse = await this.executeWithRetry(afterRequest);
    return this.runResponseInterceptors<T>(rawResponse, afterRequest);
  }

  private async runRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
    let current = config;
    for (const interceptor of this.interceptors) {
      if (interceptor.onRequest) {
        current = await interceptor.onRequest(current);
      }
    }
    return current;
  }

  private async runResponseInterceptors<T>(
    response: ApiResponse<unknown>,
    config: RequestConfig,
  ): Promise<ApiResponse<T>> {
    let current: ApiResponse<unknown> = response;
    for (const interceptor of this.interceptors) {
      if (interceptor.onResponse) {
        current = await interceptor.onResponse(current, config);
      }
    }
    return current as ApiResponse<T>;
  }

  private async executeWithRetry(config: RequestConfig): Promise<ApiResponse<unknown>> {
    const policy = new RetryPolicy(config.retryOverride);
    let lastNetworkError: unknown;

    for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
      try {
        const response = await this.executeSingle(config);

        if (!policy.isRetryableStatus(response.status) || attempt === policy.maxAttempts) {
          return response;
        }

        const delayMs =
          response.status === 429
            ? policy.getDelayMsFor429(response.headers['retry-after'], attempt)
            : policy.getDelayMs(attempt);

        this.logger.warn('Retryable response — scheduling retry', {
          status: response.status,
          attempt,
          nextAttemptIn: `${delayMs}ms`,
          url: config.url,
        });

        await this.sleep(delayMs);
      } catch (error) {
        if (!policy.isRetryableError(error) || attempt === policy.maxAttempts) throw error;

        lastNetworkError = error;
        const delayMs = policy.getDelayMs(attempt);

        this.logger.warn('Network error — scheduling retry', {
          error: error instanceof Error ? error.message : String(error),
          attempt,
          nextAttemptIn: `${delayMs}ms`,
          url: config.url,
        });

        await this.sleep(delayMs);
      }
    }

    throw lastNetworkError ?? new Error('HttpClient: retry loop exhausted without a response');
  }

  private async executeSingle(config: RequestConfig): Promise<ApiResponse<unknown>> {
    const url = this.appendQueryParams(config.url, config.queryParams);
    const init = this.buildFetchInit(config);
    const start = Date.now();

    const raw = await fetch(url, init);
    const rawBody = await this.parseBody(raw);
    const duration = Date.now() - start;

    const headers: Record<string, string> = {};
    raw.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return { status: raw.status, headers, body: rawBody, rawBody, duration };
  }

  private buildFetchInit(config: RequestConfig): RequestInit {
    const headers: Record<string, string> = { ...config.headers };
    let body: BodyInit | undefined;

    if (config.formData) {
      body = config.formData;
      // Do NOT set Content-Type — fetch sets the multipart boundary automatically.
    } else if (config.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(config.body);
    }

    return {
      method: config.method,
      headers,
      ...(body !== undefined ? { body } : {}),
      ...(config.timeoutMs ? { signal: AbortSignal.timeout(config.timeoutMs) } : {}),
    };
  }

  private async parseBody(response: Response): Promise<unknown> {
    const text = await response.text();
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text;
    }
  }

  private resolveUrl(path: string): string {
    return path.startsWith('http') ? path : `${this.baseUrl}${path}`;
  }

  private appendQueryParams(url: string, queryParams?: Record<string, string | number>): string {
    if (!queryParams || Object.keys(queryParams).length === 0) return url;
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(queryParams)) {
      params.set(key, String(value));
    }
    return `${url}?${params.toString()}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
