import type { HttpClient, ApiResponse } from '@framework/api-client';
import {
  CreateUserResponseSchema,
  UpdateUserResponseSchema,
  DeleteAccountResponseSchema,
  GetUserResponseSchema,
} from '@framework/contracts';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  DeleteAccountResponse,
  GetUserResponse,
} from '@framework/contracts';
import { objectToFormData } from '../utils/formUtils';

export class UserApiService {
  constructor(private readonly client: HttpClient) {}

  /** POST /api/createAccount — responseCode 201 on success */
  async createAccount(data: CreateUserRequest): Promise<ApiResponse<CreateUserResponse>> {
    return this.client.postMultipart('/api/createAccount', objectToFormData(data), {
      schema: CreateUserResponseSchema,
    });
  }

  /** GET /api/getUserDetailByEmail?email=... — responseCode 200 on success */
  async getUserByEmail(email: string): Promise<ApiResponse<GetUserResponse>> {
    return this.client.get('/api/getUserDetailByEmail', {
      schema: GetUserResponseSchema,
      queryParams: { email },
    });
  }

  /** PUT /api/updateAccount (form-encoded) — responseCode 200 on success */
  async updateAccount(data: UpdateUserRequest): Promise<ApiResponse<UpdateUserResponse>> {
    return this.client.putMultipart('/api/updateAccount', objectToFormData(data), {
      schema: UpdateUserResponseSchema,
    });
  }

  /** DELETE /api/deleteAccount (form-encoded) — responseCode 200 on success */
  async deleteAccount(
    email: string,
    password: string,
  ): Promise<ApiResponse<DeleteAccountResponse>> {
    const fd = objectToFormData({ email, password });
    return this.client.deleteMultipart('/api/deleteAccount', fd, {
      schema: DeleteAccountResponseSchema,
    });
  }
}
