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
  async updateCurrentUser(data: { first_name?: string; last_name?: string; email?: string; verification_code?: string }): Promise<User> {
    return this.patch<User>('/user/me', data);
  }

  /**
   * Request email change verification code
   */
  async requestEmailChangeCode(email: string): Promise<{ message: string; token: string }> {
    return this.post<{ message: string; token: string }>('/user/request-email-change-code', { email });
  }

  /**
   * Change user password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/user/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  /**
   * Delete current user account
   */
  async deleteAccount(password: string): Promise<{ message: string }> {
    return this.delete<{ message: string }>('/user/me', {
      password
    });
  }

  /**
   * Resend email confirmation
   */
  async resendEmailConfirmation(email: string): Promise<{ message: string; token?: string }> {
    return this.post<{ message: string; token?: string }>('/auth/resend-verification-code', {
      email,
      code_type: 'email_confirm'
    });
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
  async completeOnboarding(data: OnboardingComplete): Promise<{ user: User; message: string }> {
    return this.post<{ user: User; message: string }>('/user/onboarding/complete', data);
  }
}

export const userApi = new UserApi();
