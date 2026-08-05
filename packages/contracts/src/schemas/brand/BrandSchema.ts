import { z } from 'zod';

/**
 * A single brand entry from GET /api/brandsList.
 * IDs match product IDs — each product has a corresponding brand entry.
 */
export const BrandSchema = z.object({
  id: z.number(),
  brand: z.string(),
});

/** GET /api/brandsList */
export const BrandListResponseSchema = z.object({
  responseCode: z.number(),
  brands: z.array(BrandSchema),
});

export type Brand = z.infer<typeof BrandSchema>;
export type BrandListResponse = z.infer<typeof BrandListResponseSchema>;
