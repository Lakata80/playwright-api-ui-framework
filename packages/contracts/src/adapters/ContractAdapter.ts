import type { ZodTypeAny } from 'zod';

/**
 * Seam for plugging in an alternative contract source in the future.
 *
 * v1 default: ZodFirstContractAdapter (hand-authored Zod schemas).
 * Future: OpenApiContractAdapter — reads an OpenAPI spec and derives schemas at runtime,
 * swappable via CONTRACT_SOURCE=openapi env var without changing HttpClient or any test.
 */
export interface ContractAdapter {
  /**
   * Returns the Zod schema registered for the given operation ID.
   * Throws if no schema is registered — operation IDs must be explicit, not guessed.
   */
  getSchema(operationId: string): ZodTypeAny;
}
