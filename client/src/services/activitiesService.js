import { API_BASE_URL } from './api';
import { authHeader } from './auth';

export async function getAll() {
  try {
    const response = await fetch(`${API_BASE_URL}/activities`, {
      method: 'GET',
      headers: authHeader(),
      credentials: 'include'
    });
    
    if (!response.ok) {
      console.error('Failed to fetch activities:', response.statusText);
      throw new Error(`Failed to fetch activities: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Activities data received:', data); // Debugging
    return data;
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw error;
  }
}