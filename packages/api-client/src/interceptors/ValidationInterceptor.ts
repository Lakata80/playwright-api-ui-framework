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
      // Include a body snippet in the error — this surfaces the actual server
      // response (HTML challenge page or unexpected JSON) alongside the Zod path.
      // JSON objects are serialised so Cloudflare/WAF block payloads are visible.
      const rawBody = response.rawBody;
      const bodySnippet =
        typeof rawBody === 'string'
          ? ` | rawBody[0..300]: ${rawBody.slice(0, 300)}`
          : rawBody !== null && typeof rawBody === 'object'
            ? ` | rawBody: ${JSON.stringify(rawBody).slice(0, 300)}`
            : '';
      throw new ContractViolationError(config.url, result.error.issues, bodySnippet);
    }

    return { ...response, body: result.data as T };
  }
}
