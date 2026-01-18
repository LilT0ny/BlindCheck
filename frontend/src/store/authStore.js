import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  
  login: (userData, token) => {
    set({ 
      user: userData, 
      isAuthenticated: true,
      token: token
    });
  },
  
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    }
    
    set({ 
      user: null, 
      isAuthenticated: false,
      token: null
    });
  },
  
  updateUser: (userData) => {
    set({ user: userData });
  },

  restoreSession: async () => {
    set({ isLoading: false });
  }
}));
