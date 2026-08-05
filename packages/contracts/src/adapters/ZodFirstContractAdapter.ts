import type { ZodTypeAny } from 'zod';
import type { ContractAdapter } from './ContractAdapter';
import { ProductListResponseSchema, SearchProductResponseSchema } from '../schemas/product';
import { BrandListResponseSchema } from '../schemas/brand';
import { VerifyLoginResponseSchema } from '../schemas/auth';
import {
  GetUserResponseSchema,
  CreateUserResponseSchema,
  UpdateUserResponseSchema,
  DeleteAccountResponseSchema,
} from '../schemas/user';

/**
 * Default contract adapter — maps operation IDs to hand-authored Zod schemas.
 *
 * Operation IDs follow the convention "<METHOD> <path>" (e.g. "GET /api/productsList").
 * This registry is the machine-readable expression of the Zod-first contract source of truth.
 * The scheduled contract-drift CI job iterates this registry to fire live requests and
 * assert that the real API still satisfies each schema.
 */
export class ZodFirstContractAdapter implements ContractAdapter {
  private static readonly registry: ReadonlyMap<string, ZodTypeAny> = new Map<string, ZodTypeAny>([
    ['GET /api/productsList', ProductListResponseSchema],
    ['POST /api/searchProduct', SearchProductResponseSchema],
    ['GET /api/brandsList', BrandListResponseSchema],
    ['POST /api/verifyLogin', VerifyLoginResponseSchema],
    ['GET /api/getUserDetailByEmail', GetUserResponseSchema],
    ['POST /api/createAccount', CreateUserResponseSchema],
    ['PUT /api/updateAccount', UpdateUserResponseSchema],
    ['DELETE /api/deleteAccount', DeleteAccountResponseSchema],
  ]);

  getSchema(operationId: string): ZodTypeAny {
    const schema = ZodFirstContractAdapter.registry.get(operationId);
    if (!schema) {
      throw new Error(
        `ZodFirstContractAdapter: no schema registered for operationId "${operationId}". ` +
          `Registered operations: ${[...ZodFirstContractAdapter.registry.keys()].join(', ')}`,
      );
    }
    return schema;
  }

  /** Returns all registered operation IDs — useful for iterating in contract-drift tests. */
  static getOperationIds(): readonly string[] {
    return [...ZodFirstContractAdapter.registry.keys()];
  }
}
