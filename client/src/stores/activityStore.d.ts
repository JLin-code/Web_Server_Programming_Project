import type { Activity } from '../types';
export declare const activityStore: {
    activities: import("vue").Ref<{
        id: string | number;
        title: string;
        description: string;
        type: string;
        date: string;
        metrics: Record<string, string | number>;
        likes: number;
        comments: number;
        image?: string | null;
        user: {
            id: string | number;
            name: string;
            avatar?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            image?: string;
        };
        user_id?: string | number;
    }[], Activity[] | {
        id: string | number;
        title: string;
        description: string;
        type: string;
        date: string;
        metrics: Record<string, string | number>;
        likes: number;
        comments: number;
        image?: string | null;
        user: {
            id: string | number;
            name: string;
            avatar?: string;
            first_name?: string;
            last_name?: string;
            email?: string;
            image?: string;
        };
        user_id?: string | number;
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    initializeActivities: () => Promise<void>;
    deleteActivity: (id: string | number) => Promise<void>;
    likeActivity: (id: string | number) => Promise<void>;
    formatDate: (dateString: string) => string;
    addActivity: (title: string, description: string, type: string, metrics: Record<string, string | number>, image?: string) => Promise<Activity>;
};
