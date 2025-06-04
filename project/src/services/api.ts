import axios from 'axios';

const baseURL = process.env.NODE_ENV === 'production'
  ? '/'  // Для production: /api → /api/Auth/login
  : 'http://localhost:5000'; // Для development: http://localhost:5000/Auth/login

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;