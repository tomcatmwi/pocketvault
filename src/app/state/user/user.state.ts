export interface User {
    uid?: string;
    name?: string;
    email?: string;
    token?: string;
    picture?: string;
    locale?: string;
    isNewUser?: boolean;
    error?: string;
}

export const initialState = {} as User;
