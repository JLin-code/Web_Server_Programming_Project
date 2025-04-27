export function authHeader() {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json'
  };
}

export function isAuthenticated() {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  // Check if token is expired (this is a simple check, your JWT might have a different structure)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp > Date.now() / 1000;
  } catch (e) {
    return false;
  }
}
