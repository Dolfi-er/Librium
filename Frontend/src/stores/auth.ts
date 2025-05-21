import { defineStore } from 'pinia'
import axios, { AxiosError } from 'axios'
import type { LoginDto } from '../dto/authdto' // Создайте этот файл при необходимости

interface AuthState {
  token: string | null
  error: string | null
  isLoading: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
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
            const response = await axios.post<{ token: string }>(
            'http://localhost:5018/api/auth/login',
            { login, password }
            )
            
            this.token = response.data.token
            localStorage.setItem('token', this.token)
            this.error = null
            return true
        } catch (error) {
            const err = error as AxiosError
            this.error = (err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) 
            ? (err.response.data as { message: string }).message 
            : 'Ошибка авторизации'
            return false
        } finally {
            this.isLoading = false
        }
    },
    
    logout() {
      this.token = null
      localStorage.removeItem('token')
      this.error = null
    },
    
    initializeAxiosInterceptors() {
      axios.interceptors.request.use(config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`
        }
        return config
      })
      
      axios.interceptors.response.use(
        response => response,
        error => {
          if (error.response?.status === 401) {
            this.logout()
          }
          return Promise.reject(error)
        }
      )
    }
  }
})
