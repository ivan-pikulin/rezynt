import baseApi from './baseApi';
import { User } from 'shared/types/user';
import { UserFromApi } from './types';
import { mapUserFromApi } from './utils';

const userApi = {
  getCurrentUser: async (): Promise<User> => {
    const response = await baseApi.get<UserFromApi>('/user/me/');
    return mapUserFromApi(response.data);
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await baseApi.get<UserFromApi[]>('/user/');
    return response.data.map(mapUserFromApi);
  },

  updateUserRole: async (userId: number, isAdmin: boolean): Promise<User> => {
    const response = await baseApi.put<UserFromApi>(`/user/${userId}/role/`, { is_admin: isAdmin });
    return mapUserFromApi(response.data);
  },
};

export default userApi; 