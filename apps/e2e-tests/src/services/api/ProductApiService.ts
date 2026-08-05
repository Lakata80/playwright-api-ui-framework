import type { HttpClient, ApiResponse } from '@framework/api-client';
import {
  ProductListResponseSchema,
  SearchProductResponseSchema,
  BrandListResponseSchema,
} from '@framework/contracts';
import type {
  ProductListResponse,
  SearchProductRequest,
  SearchProductResponse,
  BrandListResponse,
} from '@framework/contracts';
import { objectToFormData } from '../utils/formUtils';

export class ProductApiService {
  constructor(private readonly client: HttpClient) {}

  /** GET /api/productsList */
  async listAll(): Promise<ApiResponse<ProductListResponse>> {
    return this.client.get('/api/productsList', { schema: ProductListResponseSchema });
  }

  /** POST /api/searchProduct */
  async search(params: SearchProductRequest): Promise<ApiResponse<SearchProductResponse>> {
    return this.client.postMultipart('/api/searchProduct', objectToFormData(params), {
      schema: SearchProductResponseSchema,
    });
  }

  /** GET /api/brandsList */
  async listBrands(): Promise<ApiResponse<BrandListResponse>> {
    return this.client.get('/api/brandsList', { schema: BrandListResponseSchema });
  }
}
