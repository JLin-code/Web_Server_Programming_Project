import { API_BASE_URL } from './api';

async function login(username, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', // This is crucial for sending/receiving cookies
      body: JSON.stringify({ username, password })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export { login };