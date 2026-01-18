import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  
  login: (userData, token) => {
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    set({ 
      user: userData, 
      token, 
      isAuthenticated: true 
    });
  },
  
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    set({ 
      user: null, 
      token: null, 
      isAuthenticated: false 
    });
  },
  
  updateUser: (userData) => {
    sessionStorage.setItem('user', JSON.stringify(userData));
    set({ user: userData });
  },

  // Restaurar sesión desde sessionStorage al cargar
  restoreSession: () => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true });
      } catch (error) {
        sessionStorage.clear();
      }
    }
  }
}));
