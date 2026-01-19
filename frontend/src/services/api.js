import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  headers: {
    // No establecer Content-Type por defecto, dejar que axios lo maneje
  }
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  (config) => {
    // Intentar obtener token de sessionStorage (donde authStore lo guarda)
    const token = sessionStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
      // Limpiar sesión
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      // Redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

