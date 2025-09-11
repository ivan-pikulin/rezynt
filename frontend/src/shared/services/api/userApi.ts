import { BaseApi } from './baseApi';
import { User } from './types';

export interface OnboardingResponse {
  experience: string;
  job_search_status: string;
  background_field: string;
  resume_goal: string;
}

export interface OnboardingComplete {
  responses: OnboardingResponse;
}

export class UserApi extends BaseApi {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    return this.get<User>('/user/me');
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(data: Partial<User>): Promise<User> {
    return this.patch<User>('/users/me', data);
  }

  /**
   * Enable premium status for a user (admin only)
   */
  async enablePremium(userId: number, adminToken: string): Promise<User> {
    return this.patch<User>(`/users/${userId}/premium/enable`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
  }

  /**
   * Disable premium status for a user (admin only)
   */
  async disablePremium(userId: number, adminToken: string): Promise<User> {
    return this.patch<User>(`/users/${userId}/premium/disable`, {}, {
      headers: {
        Authorization: `Bearer ${adminToken}`
      }
    });
  }

  /**
   * Complete user onboarding
   */
  async completeOnboarding(data: OnboardingComplete): Promise<{ user: User; task_id?: string; message: string }> {
    return this.post<{ user: User; task_id?: string; message: string }>('/user/onboarding/complete', data);
  }
}

export const userApi = new UserApi();
