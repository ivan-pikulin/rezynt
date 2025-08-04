export interface UserLogin {
    username: string;
    password: string;
}

export interface UserSignup {
    username: string;
    password: string;
}

export interface UserFromApi {
    id: number;
    username: string;
    is_admin: boolean;
    last_login: string | null;
}
