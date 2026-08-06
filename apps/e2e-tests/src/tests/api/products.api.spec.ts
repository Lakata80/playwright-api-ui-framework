import { test, expect } from '../../fixtures';
import { isWafBlocked, WAF_SKIP_REASON } from '../../fixtures/waf-check';
import { ProductApiService } from '../../services/api/ProductApiService';

test.describe('Products API', () => {
  test.beforeAll(async () => {
    test.skip(await isWafBlocked(), WAF_SKIP_REASON);
  });
  test('GET /api/productsList returns non-empty list @smoke', async ({ apiClient }) => {
    const service = new ProductApiService(apiClient);
    const response = await service.listAll();

    expect(response.body.responseCode).toBe(200);
    expect(response.body.products.length).toBeGreaterThan(0);
    expect(response.status).toBe(200);
  });

  test('every product has required fields (id, name, price, brand, category)', async ({
    apiClient,
  }) => {
    const service = new ProductApiService(apiClient);
    const response = await service.listAll();

    for (const product of response.body.products) {
      expect(typeof product.id).toBe('number');
      expect(typeof product.name).toBe('string');
      expect(typeof product.price).toBe('string');
      expect(typeof product.brand).toBe('string');
      expect(product.category).toBeDefined();
    }
  });

  test('POST /api/searchProduct returns results for "top"', async ({ apiClient }) => {
    const service = new ProductApiService(apiClient);
    const response = await service.search({ search_product: 'top' });

    expect(response.body.responseCode).toBe(200);
    expect(response.body.products.length).toBeGreaterThan(0);
  });

  test('GET /api/brandsList returns non-empty list', async ({ apiClient }) => {
    const service = new ProductApiService(apiClient);
    const response = await service.listBrands();

    expect(response.body.responseCode).toBe(200);
    expect(response.body.brands.length).toBeGreaterThan(0);
  });

  test('every brand has id and brand name fields', async ({ apiClient }) => {
    const service = new ProductApiService(apiClient);
    const response = await service.listBrands();

    for (const brand of response.body.brands) {
      expect(typeof brand.id).toBe('number');
      expect(typeof brand.brand).toBe('string');
    }
  });
});
