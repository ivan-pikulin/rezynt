import { BaseApi } from './baseApi';
import { User } from './types';

export class UserApi extends BaseApi {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/api/v1/users/me');
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(data: Partial<User>): Promise<User> {
    return this.patch<User>('/api/v1/users/me', data);
  }

  /**
   * Enable premium status for a user (admin only)
   */
  async enablePremium(userId: string, adminToken: string): Promise<User> {
    return this.patch<User>(`/api/v1/users/${userId}/premium/enable`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
  }

  /**
   * Disable premium status for a user (admin only)
   */
  async disablePremium(userId: string, adminToken: string): Promise<User> {
    return this.patch<User>(`/api/v1/users/${userId}/premium/disable`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
  }
}

export const userApi = new UserApi();
