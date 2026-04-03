import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL || 'https://texsa-backend.vercel.app';

const api = axios.create({
  baseURL: `${apiUrl}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      // Force a reload or a clean logout state if needed
      if (!window.location.pathname.includes('/login')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
