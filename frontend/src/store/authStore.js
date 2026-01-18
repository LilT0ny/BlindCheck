import { create } from 'zustand';
import api, { setAuthToken } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,
  
  login: (userData, token) => {
    setAuthToken(token); // Guardar en sessionStorage con ID único
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
    
    setAuthToken(null); // Limpiar de sessionStorage
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
