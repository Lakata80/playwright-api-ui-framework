import { z } from 'zod';

/**
 * All automationexercise.com API responses share this envelope.
 * The HTTP status is always 200; the real outcome lives in responseCode.
 */
export const ApiResponseBaseSchema = z.object({
  responseCode: z.number(),
});

/** Responses that carry only a responseCode + human-readable message. */
export const MessageResponseSchema = ApiResponseBaseSchema.extend({
  message: z.string(),
});

export type ApiResponseBase = z.infer<typeof ApiResponseBaseSchema>;
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
