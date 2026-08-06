/**
 * Contract tests: validate that the live automationexercise.com API responses
 * still parse successfully against our hand-authored Zod schemas.
 *
 * These tests assert SCHEMA, not business logic. A ContractViolationError thrown
 * inside the ApiClient means the live API diverged from our schema — schema drift detected.
 *
 * Run on a schedule via contract-drift.yml CI workflow.
 */
import { test, expect } from '../../fixtures';
import { isWafBlocked, WAF_SKIP_REASON } from '../../fixtures/waf-check';
import {
  ProductListResponseSchema,
  SearchProductResponseSchema,
  BrandListResponseSchema,
} from '@framework/contracts';

test.describe('Product + Brand schema contracts @contract', () => {
  test.beforeAll(async () => {
    test.skip(await isWafBlocked(), WAF_SKIP_REASON);
  });
  test('GET /api/productsList matches ProductListResponseSchema', async ({ apiClient }) => {
    const response = await apiClient.get('/api/productsList', {
      schema: ProductListResponseSchema,
    });
    // Reaching here means no ContractViolationError — schema matched
    expect(response.body.responseCode).toBe(200);
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  test('POST /api/searchProduct matches SearchProductResponseSchema', async ({ apiClient }) => {
    const fd = new FormData();
    fd.append('search_product', 'dress');

    const response = await apiClient.postMultipart('/api/searchProduct', fd, {
      schema: SearchProductResponseSchema,
    });

    expect(response.body.responseCode).toBe(200);
    expect(Array.isArray(response.body.products)).toBe(true);
  });

  test('GET /api/brandsList matches BrandListResponseSchema', async ({ apiClient }) => {
    const response = await apiClient.get('/api/brandsList', {
      schema: BrandListResponseSchema,
    });

    expect(response.body.responseCode).toBe(200);
    expect(Array.isArray(response.body.brands)).toBe(true);
  });

  test('product price field remains a string (not a number)', async ({ apiClient }) => {
    const response = await apiClient.get('/api/productsList', {
      schema: ProductListResponseSchema,
    });

    const first = response.body.products[0];
    // If the API silently changes price from string to number, this line throws
    // (schema parse would have already failed, but this makes the intent explicit)
    expect(typeof first?.price).toBe('string');
  });
});
