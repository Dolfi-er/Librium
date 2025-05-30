import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5018',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Включаем передачу кук во всех запросах
});

// Response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;