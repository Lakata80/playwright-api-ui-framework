import { z } from 'zod';

/**
 * Shape of the user object returned by GET /api/getUserDetailByEmail.
 *
 * Field naming quirk: the request uses `birth_date` but the response uses `birth_day`.
 * All fields are strings except id. Empty strings are valid for optional profile fields.
 */
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  title: z.string(),
  birth_day: z.string(),
  birth_month: z.string(),
  birth_year: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  company: z.string(),
  address1: z.string(),
  address2: z.string(),
  country: z.string(),
  state: z.string(),
  city: z.string(),
  zipcode: z.string(),
  // API does not always return mobile_number (e.g. when the field was left blank).
  mobile_number: z.string().optional(),
});

/**
 * GET /api/getUserDetailByEmail?email=...
 * responseCode 200 includes the user object.
 * responseCode 404 returns only { responseCode, message } — user is absent.
 */
export const GetUserResponseSchema = z.object({
  responseCode: z.number(),
  user: UserSchema.optional(),
  message: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type GetUserResponse = z.infer<typeof GetUserResponseSchema>;
