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
    const status = error.response?.status;
    const errorMsg = error.response?.data?.error;

    if ((status === 401 || status === 403) && error.config?.url !== '/api/auth/me') {
      if (errorMsg === 'Token diperlukan' || errorMsg === 'Token tidak valid' || errorMsg === 'Unauthorized: User not authenticated') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;
