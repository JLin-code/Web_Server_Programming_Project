const API_URL = 'http://localhost:5000/api';

export const authService = {
    async login(email, password) {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Failed to login');
        }

        return response.json();
    },

    async register(email, password) {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Failed to register');
        }

        return response.json();
    },

    async getDemoUsers() {
        const response = await fetch(`${API_URL}/auth/demo-users`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch demo users');
        }
        
        return response.json();
    },
};