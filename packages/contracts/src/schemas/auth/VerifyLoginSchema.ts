import { z } from 'zod';

/**
 * POST /api/verifyLogin
 * Form-encoded body: email, password
 * HTTP always returns 200; use responseCode in the body to determine success (200) vs failure (404).
 */
export const VerifyLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const VerifyLoginResponseSchema = z.object({
  responseCode: z.number(),
  message: z.string(),
});

export type VerifyLoginRequest = z.infer<typeof VerifyLoginRequestSchema>;
export type VerifyLoginResponse = z.infer<typeof VerifyLoginResponseSchema>;
