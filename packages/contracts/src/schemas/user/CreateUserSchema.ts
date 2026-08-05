import { z } from 'zod';

/**
 * POST /api/createAccount  (form-encoded)
 *
 * Field naming quirk: the request uses `birth_date` / `firstname` / `lastname`,
 * while the response (getUserDetailByEmail) returns `birth_day` / `first_name` / `last_name`.
 */
export const CreateUserRequestSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  title: z.enum(['Mr', 'Mrs']),
  birth_date: z.string().min(1),
  birth_month: z.string().min(1),
  birth_year: z.string().min(1),
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  company: z.string(),
  address1: z.string().min(1),
  address2: z.string(),
  city: z.string().min(1),
  state: z.string().min(1),
  zipcode: z.string().min(1),
  country: z.string().min(1),
  mobile_number: z.string().min(1),
});

/** POST /api/createAccount response — responseCode 201 on success */
export const CreateUserResponseSchema = z.object({
  responseCode: z.number(),
  message: z.string(),
});

/** PUT /api/updateAccount — same fields as create */
export const UpdateUserRequestSchema = CreateUserRequestSchema;

/** PUT /api/updateAccount response — responseCode 200 on success */
export const UpdateUserResponseSchema = CreateUserResponseSchema;

/** DELETE /api/deleteAccount (form-encoded: email, password) */
export const DeleteAccountRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

/** DELETE /api/deleteAccount response — responseCode 200 on success */
export const DeleteAccountResponseSchema = z.object({
  responseCode: z.number(),
  message: z.string(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateUserResponse = z.infer<typeof UpdateUserResponseSchema>;
export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;
export type DeleteAccountResponse = z.infer<typeof DeleteAccountResponseSchema>;
