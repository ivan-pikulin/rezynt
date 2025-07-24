import baseApi from './baseApi';
import { User } from 'shared/types/user';
import { UserFromApi } from './types';
import { mapUserFromApi } from './utils';

/**
 * User API service for handling user operations
 */
const userApi = {
  /**
   * Get the current user
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await baseApi.get<UserFromApi>('/user/me/');
    return mapUserFromApi(response.data);
  },

  /**
   * Get all users
   */
  getAllUsers: async (): Promise<User[]> => {
    const response = await baseApi.get<UserFromApi[]>('/user/');
    return response.data.map(mapUserFromApi);
  },

  /**
   * Update user role
   */
  updateUserRole: async (userId: number, isAdmin: boolean): Promise<User> => {
    const response = await baseApi.put<UserFromApi>(`/user/${userId}/role/`, { is_admin: isAdmin });
    return mapUserFromApi(response.data);
  },
};

export default userApi; 