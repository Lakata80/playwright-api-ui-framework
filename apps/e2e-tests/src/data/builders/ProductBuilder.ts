import type { SearchProductRequest } from '@framework/contracts';

/**
 * Builder for search product request payloads.
 *
 * Usage:
 *   const params = ProductBuilder.searching('dress').build();
 *   await productApiService.search(params);
 */
export class ProductBuilder {
  private constructor(private readonly data: SearchProductRequest) {}

  static searching(keyword: string): ProductBuilder {
    return new ProductBuilder({ search_product: keyword });
  }

  withKeyword(keyword: string): ProductBuilder {
    return new ProductBuilder({ ...this.data, search_product: keyword });
  }

  build(): SearchProductRequest {
    return this.data;
  }
}
