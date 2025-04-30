import type { User } from '../types';
export declare const userStore: {
    currentUser: import("vue").Ref<{
        id: string | number;
        name: string;
        avatar?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        image?: string;
    }, User | {
        id: string | number;
        name: string;
        avatar?: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        image?: string;
    }>;
    isAuthenticated: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    setCurrentUser(user: User | null): void;
    clearUser(): void;
};
