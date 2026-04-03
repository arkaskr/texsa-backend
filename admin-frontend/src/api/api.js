import axios from 'axios';

let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// 1. Force HTTPS for Vercel domains to prevent CORS preflight redirect errors
if (baseUrl.includes('.vercel.app') && baseUrl.startsWith('http://')) {
    baseUrl = baseUrl.replace('http://', 'https://');
}

// 2. Ensure baseUrl ends with /api (standard suffix for this backend)
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
}

const api = axios.create({
  baseURL: baseUrl,
});

// Request interceptor for robust token handling
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    // Supporting all Axios versions by using both standard and bracket notation
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor to handle global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401, the token is likely invalid or expired
    if (error.response && error.response.status === 401) {
      // Clear security credentials and force reload to login screen
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Only reload if we are not already on the login page to avoid infinite loops
      if (!window.location.pathname.includes('login')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
