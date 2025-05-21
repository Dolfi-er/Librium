import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import api from '../utils/api'

interface AuthState {
  token: string | null
  role: string | null
  error: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('userRole'),
    error: null,
    isLoading: false
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token
  },
  
  actions: {
    async login(login: string, password: string) {
      this.isLoading = true
      this.error = null
      
      try {
        // Включаем передачу куки в запросе
        const response = await axios.post(
          'http://localhost:5018/api/auth/login',
          { login, password },
          { 
            withCredentials: true, // Важно для работы с куки между доменами
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        )
        
        // Сохраняем токен и роль
        this.token = response.data.token
        this.role = response.data.role
        
        // Сохраняем в localStorage для сохранения сессии при перезагрузке
        localStorage.setItem('token', this.token)
        localStorage.setItem('userRole', this.role)
        
        // Инициализируем перехватчики запросов
        this.initializeAxiosInterceptors()
        
        this.error = null
        return true
      } catch (error) {
        const err = error as AxiosError
        if (err.response?.status === 401) {
          this.error = 'Неверный логин или пароль'
        } else {
          this.error = 'Ошибка при подключении к серверу'
        }
        console.error('Ошибка авторизации:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },
    
    async logout() {
      try {
        // Отправляем запрос на выход с куки
        await axios.post(
          'http://localhost:5018/api/auth/logout',
          {},
          { withCredentials: true }
        )
      } catch (error) {
        console.error('Ошибка при выходе:', error)
      } finally {
        // Очищаем состояние в любом случае
        this.token = null
        this.role = null
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
      }
    },
    
    initializeAxiosInterceptors() {
      // Настраиваем axios для всех запросов
      axios.interceptors.request.use(config => {
        // Добавляем токен в заголовок Authorization
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        
        // Включаем передачу куки для всех запросов
        config.withCredentials = true
        
        return config
      })
      
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            // При получении 401 считаем, что пользователь не аутентифицирован
            this.token = null
            this.role = null
            localStorage.removeItem('token')
            localStorage.removeItem('userRole')
            
            // Перенаправляем на страницу входа, если не на ней
            if (window.location.pathname !== '/login') {
              window.location.href = '/login'
            }
          }
          return Promise.reject(error)
        }
      )
    }
  }
})