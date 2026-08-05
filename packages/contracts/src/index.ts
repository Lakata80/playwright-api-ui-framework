// Common
export { ApiResponseBaseSchema, MessageResponseSchema } from './schemas/common';
export type { ApiResponseBase, MessageResponse } from './schemas/common';

// Auth
export { VerifyLoginRequestSchema, VerifyLoginResponseSchema } from './schemas/auth';
export type { VerifyLoginRequest, VerifyLoginResponse } from './schemas/auth';

// User
export {
  UserSchema,
  GetUserResponseSchema,
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  UpdateUserRequestSchema,
  UpdateUserResponseSchema,
  DeleteAccountRequestSchema,
  DeleteAccountResponseSchema,
} from './schemas/user';
export type {
  User,
  GetUserResponse,
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from './schemas/user';

// Product
export {
  UserTypeSchema,
  CategorySchema,
  ProductSchema,
  ProductListResponseSchema,
  SearchProductRequestSchema,
  SearchProductResponseSchema,
} from './schemas/product';
export type {
  UserType,
  Category,
  Product,
  ProductListResponse,
  SearchProductRequest,
  SearchProductResponse,
} from './schemas/product';

// Brand
export { BrandSchema, BrandListResponseSchema } from './schemas/brand';
export type { Brand, BrandListResponse } from './schemas/brand';

// Cart (placeholder — see CartSchema.ts for replacement instructions)
export {
  CartItemSchema,
  CartSchema,
  AddToCartRequestSchema,
  AddToCartResponseSchema,
} from './schemas/cart';
export type { CartItem, Cart, AddToCartRequest, AddToCartResponse } from './schemas/cart';

// Adapter layer
export type { ContractAdapter } from './adapters/ContractAdapter';
export { ZodFirstContractAdapter } from './adapters/ZodFirstContractAdapter';
