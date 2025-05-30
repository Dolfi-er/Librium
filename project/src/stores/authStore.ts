import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

interface UserData {
  id: number | null;
  login: string | null;
  role: string | null;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      
      login: async (login: string, password: string) => {
        try {
          const response = await api.post(
            '/api/Auth/login', 
            { login, password },
            { withCredentials: true }
          );
          
          set({ 
            user: {
              id: response.data.Id,
              login: response.data.Login,
              role: response.data.Role
            },
            isAuthenticated: true
          });
          
          toast.success('Вход выполнен успешно');
          return true;
        } catch (error) {
          console.error('Ошибка входа:', error);
          
          let errorMessage = 'Ошибка входа. Проверьте учетные данные';
          
          if (error instanceof AxiosError && error.response?.data?.message) {
            errorMessage = error.response.data.message;
          }
          
          toast.error(errorMessage);
          return false;
        }
      },
      
      logout: async () => {
        try {
          await api.post(
            '/api/Auth/logout', 
            {}, 
            { withCredentials: true }
          );
        } catch (error) {
          console.error('Ошибка при выходе:', error);
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
          toast.success('Выход выполнен успешно');
        }
      },
      
      checkAuth: async () => {
        try {
          await api.get('/api/Auth/check', { withCredentials: true });
          
          if (!get().isAuthenticated) {
            set({ isAuthenticated: true });
          }
        } catch {
          set({ 
            user: null, 
            isAuthenticated: false 
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
);