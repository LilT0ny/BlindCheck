import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  login: (userData) => {
    // ⚠️ NO guardar datos en sessionStorage
    // El token ya está en HttpOnly cookie (no accesible desde JavaScript)
    set({
      user: userData,
      isAuthenticated: true
    });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      console.error("Logout failed", e);
    }
    // ✅ HttpOnly cookie se borra automáticamente por el servidor
    set({
      user: null,
      isAuthenticated: false
    });
  },

  updateUser: (userData) => {
    // ⚠️ NO guardar datos en sessionStorage
    set({ user: userData });
  },

  // Restaurar sesión verificando cookie con el backend
  restoreSession: async () => {
    try {
      const response = await api.get('/auth/me');
      // El token viene en HttpOnly cookie (automático)
      const user = response.data;
      // ⚠️ NO guardar en sessionStorage - mantener en memoria solamente
      set({ user, isAuthenticated: true });
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    }
  }
}));
