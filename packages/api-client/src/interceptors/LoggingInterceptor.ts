import type { Interceptor } from './Interceptor';
import type { RequestConfig, ApiResponse } from '../types/HttpTypes';
import { Logger } from '../logger/Logger';

/** Logs every request and response as structured JSON. Redacts sensitive headers. */
export class LoggingInterceptor implements Interceptor {
  constructor(private readonly logger: Logger = new Logger('INFO', 'HttpClient')) {}

  async onRequest(config: RequestConfig): Promise<RequestConfig> {
    this.logger.debug('→ request', {
      method: config.method,
      url: config.url,
      ...(config.headers ? { headers: Logger.redactHeaders(config.headers) } : {}),
    });
    return config;
  }

  async onResponse<T>(response: ApiResponse<T>, config: RequestConfig): Promise<ApiResponse<T>> {
    this.logger.info('← response', {
      method: config.method,
      url: config.url,
      status: response.status,
      durationMs: response.duration,
    });
    return response;
  }

  async onError(error: unknown, config: RequestConfig): Promise<never> {
    this.logger.error('✗ request failed', {
      method: config.method,
      url: config.url,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
