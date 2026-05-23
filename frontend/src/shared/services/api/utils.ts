import { User } from '../../types/user';

interface UserFromApi {
    id: number;
    username: string;
    is_admin: boolean;
    last_login: string | null;
}

export const mapUserFromApi = (userFromApi: UserFromApi): User => {
    return {
        id: userFromApi.id,
        username: userFromApi.username,
        isAdmin: userFromApi.is_admin,
        lastLogin: userFromApi.last_login,
    };
};
