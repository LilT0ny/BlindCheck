import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || '/api',
  withCredentials: true,  // ✅ Permite enviar HttpOnly cookies automáticamente
  headers: {
    // No establecer Content-Type por defecto
  }
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // ✅ No hay nada que limpiar aquí
      // El servidor ya borra la HttpOnly cookie automáticamente
      // Zustand state se limpia en el logout del componente

      // Redirect to login if not already there
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

