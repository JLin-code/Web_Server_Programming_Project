export declare const authService: {
    login: (username: string, password: string) => Promise<any>;
    logout: () => Promise<any>;
    getCurrentUser: () => Promise<any>;
    register: (userData: any) => Promise<any>;
    getUsers: () => Promise<any>;
};
export declare const userService: {
    getAll: () => Promise<any>;
    getById: (id: string | number) => Promise<any>;
    create: (userData: any) => Promise<any>;
    update: (id: string | number, userData: any) => Promise<any>;
    delete: (id: string | number) => Promise<any>;
    getCurrentUser: () => Promise<any>;
};
export declare const productService: {
    getAll: () => Promise<any>;
    getById: (id: string | number) => Promise<any>;
    create: (productData: any) => Promise<any>;
    update: (id: string | number, productData: any) => Promise<any>;
    delete: (id: string | number) => Promise<any>;
};
export declare const friendService: {
    getFriends: (userId: string | number) => Promise<any>;
    addFriend: (userId: string | number, friendId: string | number) => Promise<any>;
    removeFriend: (userId: string | number, friendId: string | number) => Promise<any>;
};
declare const _default: {
    authService: {
        login: (username: string, password: string) => Promise<any>;
        logout: () => Promise<any>;
        getCurrentUser: () => Promise<any>;
        register: (userData: any) => Promise<any>;
        getUsers: () => Promise<any>;
    };
    userService: {
        getAll: () => Promise<any>;
        getById: (id: string | number) => Promise<any>;
        create: (userData: any) => Promise<any>;
        update: (id: string | number, userData: any) => Promise<any>;
        delete: (id: string | number) => Promise<any>;
        getCurrentUser: () => Promise<any>;
    };
    productService: {
        getAll: () => Promise<any>;
        getById: (id: string | number) => Promise<any>;
        create: (productData: any) => Promise<any>;
        update: (id: string | number, productData: any) => Promise<any>;
        delete: (id: string | number) => Promise<any>;
    };
    friendService: {
        getFriends: (userId: string | number) => Promise<any>;
        addFriend: (userId: string | number, friendId: string | number) => Promise<any>;
        removeFriend: (userId: string | number, friendId: string | number) => Promise<any>;
    };
};
export default _default;
