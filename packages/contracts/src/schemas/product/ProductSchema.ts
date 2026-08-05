import { z } from 'zod';

/**
 * Nested usertype wrapper — redundant field name in the API is intentional.
 * Actual values observed: "Women", "Men", "Kids"
 */
export const UserTypeSchema = z.object({
  usertype: z.string(),
});

/**
 * Product category containing the target user type and the category name.
 * Observed values: "Tops", "Tshirts", "Dress", "Jeans", "Saree", "Tops & Shirts"
 */
export const CategorySchema = z.object({
  usertype: UserTypeSchema,
  category: z.string(),
});

/**
 * A single product from GET /api/productsList or POST /api/searchProduct.
 *
 * price is a string ("Rs. 500") — not a number.
 * IDs are non-consecutive; gaps in the sequence are normal.
 */
export const ProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  price: z.string(),
  brand: z.string(),
  category: CategorySchema,
});

export type UserType = z.infer<typeof UserTypeSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
