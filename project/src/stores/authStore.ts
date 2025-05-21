import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AuthState {
  token: string | null;
  user: any | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      
      login: async (login: string, password: string) => {
        try {
          const response = await api.post('/api/Auth/login', { login, password });
          
          // Assuming the API returns a token and user info
          // In a real app, you would extract this from the response
          // This is a mockup since we don't know the exact response structure
          set({ 
            token: 'mock-token',  // In real app: response.data.token
            user: { login },      // In real app: response.data.user
            isAuthenticated: true
          });
          
          toast.success('Login successful');
          return true;
        } catch (error) {
          console.error('Login failed:', error);
          toast.error('Login failed. Please check your credentials.');
          return false;
        }
      },
      
      logout: async () => {
        try {
          await api.post('/api/Auth/logout');
          // Even if the API call fails, we still want to clear the local state
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          set({ token: null, user: null, isAuthenticated: false });
          toast.success('Logged out successfully');
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);