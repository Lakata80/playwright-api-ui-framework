import { z } from 'zod';

/**
 * PLACEHOLDER — automationexercise.com does not expose a cart REST API.
 * Cart state is managed through the browser session only.
 *
 * Replace these schemas with the real API contract when onboarding a client
 * whose system exposes a cart endpoint (e.g. GET /api/cart, POST /api/cart/items).
 */

export const CartItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  quantity: z.number().int().positive(),
  unitPrice: z.number(),
});

export const CartSchema = z.object({
  id: z.string(),
  items: z.array(CartItemSchema),
  totalPrice: z.number(),
});

export const AddToCartRequestSchema = z.object({
  productId: z.number(),
  quantity: z.number().int().positive().default(1),
});

export const AddToCartResponseSchema = z.object({
  responseCode: z.number(),
  message: z.string(),
  cart: CartSchema.optional(),
});

export type CartItem = z.infer<typeof CartItemSchema>;
export type Cart = z.infer<typeof CartSchema>;
export type AddToCartRequest = z.infer<typeof AddToCartRequestSchema>;
export type AddToCartResponse = z.infer<typeof AddToCartResponseSchema>;
