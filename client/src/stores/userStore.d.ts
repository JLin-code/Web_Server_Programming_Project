type TimePeriod = 'day' | 'week' | 'month' | 'allTime';
type TrackingData = {
    distance: number;
    duration: number;
    avgPace: number;
    calories: number;
};
type UserTrackingData = Record<TimePeriod, TrackingData>;
export declare const userStore: {
    getUserData(): UserTrackingData;
    isLoggedIn(): boolean;
    currentUser(): string;
    login(username: string): void;
    logout(): void;
    state: {
        readonly currentUser: string;
        readonly isLoggedIn: boolean;
    };
};
export {};
