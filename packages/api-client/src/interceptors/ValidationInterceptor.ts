import type { Interceptor } from './Interceptor';
import type { RequestConfig, ApiResponse } from '../types/HttpTypes';
import { ContractViolationError } from '../errors/ContractViolationError';

/**
 * Validates the response body against the Zod schema provided at the call site.
 * No-ops when no schema is passed — raw responses flow through as ApiResponse<unknown>.
 *
 * This interceptor is the enforcement point for contract tests: a schema mismatch
 * throws ContractViolationError with per-field path information.
 */
export class ValidationInterceptor implements Interceptor {
  async onResponse<T>(response: ApiResponse<T>, config: RequestConfig): Promise<ApiResponse<T>> {
    if (!config.schema) return response;

    const result = config.schema.safeParse(response.rawBody);
    if (!result.success) {
      // Include a body snippet when rawBody is a string — this surfaces the actual
      // server response (e.g. an HTML challenge page) in the test failure output,
      // which would otherwise only show the Zod path error.
      const bodySnippet =
        typeof response.rawBody === 'string'
          ? ` | rawBody[0..300]: ${(response.rawBody as string).slice(0, 300)}`
          : '';
      throw new ContractViolationError(config.url, result.error.issues, bodySnippet);
    }

    return { ...response, body: result.data as T };
  }
}
