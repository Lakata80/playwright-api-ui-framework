import { z } from 'zod';
import { ProductSchema } from './ProductSchema';

/** GET /api/productsList */
export const ProductListResponseSchema = z.object({
  responseCode: z.number(),
  products: z.array(ProductSchema),
});

/**
 * POST /api/searchProduct (form-encoded: search_product=<query>)
 * Returns the same envelope as productsList but filtered to matching products.
 */
export const SearchProductRequestSchema = z.object({
  search_product: z.string().min(1),
});

export const SearchProductResponseSchema = ProductListResponseSchema;

export type ProductListResponse = z.infer<typeof ProductListResponseSchema>;
export type SearchProductRequest = z.infer<typeof SearchProductRequestSchema>;
export type SearchProductResponse = ProductListResponse;
