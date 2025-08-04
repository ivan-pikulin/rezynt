import { User } from 'shared/types/user';
import { UserFromApi } from './types';

export const mapUserFromApi = (userFromApi: UserFromApi): User => {
    return {
        id: userFromApi.id,
        username: userFromApi.username,
        isAdmin: userFromApi.is_admin,
        lastLogin: userFromApi.last_login,
    };
}; 