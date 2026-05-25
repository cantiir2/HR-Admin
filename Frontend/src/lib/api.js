import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true // Penting untuk mengirimkan HttpOnly Cookie
});

// Handle 401/403 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Jika request bukan untuk check auth awal
      if (error.config.url !== '/api/auth/me') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
