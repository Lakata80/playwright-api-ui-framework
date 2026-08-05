import type { HttpClient, ApiResponse } from '@framework/api-client';
import { VerifyLoginResponseSchema } from '@framework/contracts';
import type { VerifyLoginRequest, VerifyLoginResponse } from '@framework/contracts';
import { objectToFormData } from '../utils/formUtils';

export class AuthApiService {
  constructor(private readonly client: HttpClient) {}

  /**
   * POST /api/verifyLogin
   * responseCode 200 → user exists, responseCode 404 → user not found.
   * HTTP status is always 200 on this endpoint regardless of outcome.
   */
  async verifyLogin(credentials: VerifyLoginRequest): Promise<ApiResponse<VerifyLoginResponse>> {
    return this.client.postMultipart('/api/verifyLogin', objectToFormData(credentials), {
      schema: VerifyLoginResponseSchema,
    });
  }
}
