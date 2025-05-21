import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:5018/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true // Включаем передачу куки для всех запросов
})

// Добавляем токен из localStorage в заголовок Authorization
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Обрабатываем ошибки аутентификации
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Очищаем данные аутентификации
      localStorage.removeItem('token')
      localStorage.removeItem('userRole')
      
      // Перенаправляем на страницу входа
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api