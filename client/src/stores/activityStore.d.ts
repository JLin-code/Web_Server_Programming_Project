interface User {
    id: number;
    name: string;
    avatar: string;
}
interface Metrics {
    [key: string]: string | number;
}
interface Activity {
    id: number;
    user: User;
    type: string;
    title: string;
    description: string;
    date: string;
    metrics: Metrics;
    likes: number;
    comments: number;
    image: string | null;
}
export declare const activityStore: {
    activities: import("vue").Ref<{
        id: number;
        user: {
            id: number;
            name: string;
            avatar: string;
        };
        type: string;
        title: string;
        description: string;
        date: string;
        metrics: Metrics;
        likes: number;
        comments: number;
        image: string | null;
    }[], Activity[] | {
        id: number;
        user: {
            id: number;
            name: string;
            avatar: string;
        };
        type: string;
        title: string;
        description: string;
        date: string;
        metrics: Metrics;
        likes: number;
        comments: number;
        image: string | null;
    }[]>;
    loading: import("vue").Ref<boolean, boolean>;
    error: import("vue").Ref<string, string>;
    initializeActivities: () => void;
    deleteActivity: (id: number) => void;
    likeActivity: (id: number) => void;
    formatDate: (dateString: string) => string;
};
export {};
