export interface User {
    id: string | number;
    name: string;
    avatar?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    image?: string;
}
export interface Activity {
    id: string | number;
    title: string;
    description: string;
    type: string;
    date: string;
    metrics: Record<string, string | number>;
    likes: number;
    comments: number;
    image?: string | null;
    user: User;
    user_id?: string | number;
}
export interface ActivityResponse {
    items: Activity[];
    total: number;
}
