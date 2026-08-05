import type { RequestConfig, ApiResponse } from '../types/HttpTypes';

/** Hook interface for request and response lifecycle events. */
export interface Interceptor {
  onRequest?(config: RequestConfig): Promise<RequestConfig>;
  onResponse?<T>(response: ApiResponse<T>, config: RequestConfig): Promise<ApiResponse<T>>;
  onError?(error: unknown, config: RequestConfig): Promise<never>;
}
