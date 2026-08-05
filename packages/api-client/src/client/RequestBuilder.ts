import type { ZodType } from 'zod';
import type { HttpMethod, RequestConfig } from '../types/HttpTypes';
import type { RetryOptions } from '../types/RetryOptions';

/**
 * Fluent, immutable builder for RequestConfig.
 * Every with* method returns a new instance — the original is never mutated.
 * Use this when you need fine-grained per-request control beyond the HttpClient
 * convenience methods (e.g., dynamic headers, per-request retry tuning).
 */
export class RequestBuilder {
  private constructor(private readonly config: Readonly<Partial<RequestConfig>>) {}

  static for(method: HttpMethod, url: string): RequestBuilder {
    return new RequestBuilder({ method, url });
  }

  withHeader(key: string, value: string): RequestBuilder {
    return new RequestBuilder({
      ...this.config,
      headers: { ...this.config.headers, [key]: value },
    });
  }

  withHeaders(headers: Record<string, string>): RequestBuilder {
    return new RequestBuilder({
      ...this.config,
      headers: { ...this.config.headers, ...headers },
    });
  }

  withBody(body: unknown): RequestBuilder {
    return new RequestBuilder({ ...this.config, body });
  }

  withFormData(formData: FormData): RequestBuilder {
    return new RequestBuilder({ ...this.config, formData });
  }

  withQueryParam(key: string, value: string | number): RequestBuilder {
    return new RequestBuilder({
      ...this.config,
      queryParams: { ...this.config.queryParams, [key]: value },
    });
  }

  withQueryParams(params: Record<string, string | number>): RequestBuilder {
    return new RequestBuilder({
      ...this.config,
      queryParams: { ...this.config.queryParams, ...params },
    });
  }

  withTimeout(ms: number): RequestBuilder {
    return new RequestBuilder({ ...this.config, timeoutMs: ms });
  }

  withRetryOverride(override: Partial<RetryOptions>): RequestBuilder {
    return new RequestBuilder({ ...this.config, retryOverride: override });
  }

  withSchema<T>(schema: ZodType<T>): RequestBuilder {
    return new RequestBuilder({ ...this.config, schema: schema as ZodType<unknown> });
  }

  build(): RequestConfig {
    if (!this.config.method || !this.config.url) {
      throw new Error('RequestBuilder: method and url are required before calling build()');
    }
    return this.config as RequestConfig;
  }
}
