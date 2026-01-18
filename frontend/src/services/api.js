import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Interceptor para agregar token desde authStore
api.interceptors.request.use(
  (config) => {
    // Importar dinámicamente authStore para evitar circular dependency
    // y leer el token actual de esta pestaña
    try {
      const { useAuthStore } = require('../store/authStore');
      const token = useAuthStore.getState().token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Si falla, continuar sin token
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpiar token en authStore
      try {
        const { useAuthStore } = require('../store/authStore');
        useAuthStore.getState().logout();
      } catch (e) {
        // Si falla, redirigir a login
      }
      
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
